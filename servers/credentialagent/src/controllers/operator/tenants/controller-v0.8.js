/**
 * Copyright 2023 Velocity Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {
  isEmpty,
  map,
  uniq,
  reduce,
  some,
  includes,
  omit,
} = require('lodash/fp');
const newError = require('http-errors');
const { KeyPurposes, KeyEncodings } = require('@velocitycareerlabs/crypto');
const { resolveDid } = require('@velocitycareerlabs/common-fetchers');

const {
  hasDuplicatePurposes,
  KeyErrorMessages,
  buildServiceIds,
  validateServiceIds,
  addPrimaryAddressToTenant,
  refreshTenantDids,
  validateGroupByUser,
  validateDidDocKeys,
} = require('../../../entities');

const areKidFragmentsUnique = (keys) => {
  const kidFragments = reduce(
    (arr, key) => {
      return [...arr, key.kidFragment];
    },
    [],
    keys
  );
  return uniq(kidFragments).length === kidFragments.length;
};

const validateAllPurposes = (keys) => {
  const allPurposes = reduce(
    (arr, key) => {
      return [...arr, ...key.purposes];
    },
    [],
    keys
  );
  if (hasDuplicatePurposes(allPurposes)) {
    throw newError(400, KeyErrorMessages.DUPLICATE_PURPOSE_DETECTED);
  }
};

const validateUniqueKidFragments = (keys) => {
  if (!areKidFragmentsUnique(keys)) {
    throw newError(400, 'Duplicate kid fragments purposes detected');
  }
};

const tenantController = async (fastify) => {
  fastify.post(
    '/',
    {
      schema: fastify.autoSchema({
        body: {
          $ref: 'https://velocitycareerlabs.io/secret-new-tenant-v0.8.schema.json#',
        },
        response: {
          201: {
            $ref: 'https://velocitycareerlabs.io/new-tenant.response.200.schema.json#',
          },
          404: { $ref: 'error#' },
        },
      }),
    },
    async (req, reply) => {
      const { did, serviceIds, webhookUrl, keys, webhookAuth } = req.body;

      await validateGroupByUser(req);
      validateAllPurposes(keys);
      validateUniqueKidFragments(keys);

      const organizationDidDoc = await getOrganizationDidDoc(did, req);

      validateServiceIds(organizationDidDoc, serviceIds);
      const validatedKeys = await validateDidDocKeys(organizationDidDoc, keys);

      const insertedTenant = await req.repos.tenants.insertTenant({
        did,
        serviceIds,
        webhookUrl,
        webhookAuth,
      });

      const { createdAt, _id } = insertedTenant;

      if (!isEmpty(validatedKeys)) {
        await Promise.all(
          map(
            (keyDatum) =>
              req.kms.importKey({
                ...keyDatum,
                publicKey: keyDatum.publicKey ?? omit(['d'], keyDatum.key),
                encoding: KeyEncodings.JWK,
                tenantId: _id,
              }),
            validatedKeys
          )
        );

        await tryingToInsertPrimaryAddress(insertedTenant, validatedKeys, req);
      }
      reply.code(201);
      return { createdAt, id: _id };
    }
  );

  fastify.get(
    '/',
    {
      schema: fastify.autoSchema({
        response: {
          200: {
            type: 'array',
            items: {
              $ref: 'https://velocitycareerlabs.io/tenant-v0.8.schema.json',
            },
          },
        },
      }),
    },
    async (req) => {
      const filter = await buildFilterByGroup(req);
      const tenants = await req.repos.tenants.find({ filter });
      return map(
        (tenant) => ({ ...tenant, serviceIds: buildServiceIds(tenant) }),
        tenants
      );
    }
  );

  fastify.post(
    '/refresh',
    {
      schema: fastify.autoSchema({
        body: {
          oneOf: [
            {
              type: 'object',
              properties: {
                all: { type: 'boolean', enum: [true] },
              },
              required: ['all'],
            },
            {
              type: 'object',
              properties: {
                did: { type: 'string' },
              },
              required: ['did'],
            },
          ],
        },
        response: {
          204: { type: 'null' },
        },
      }),
    },
    async (req) => {
      await refreshTenantDids(req.body, req);
      return {};
    }
  );
};

const getOrganizationDidDoc = async (did, req) => {
  const invokeError = () => {
    throw newError(404, 'DID not found on the Velocity network registrar.', {
      errorCode: 'did_not_found',
    });
  };
  try {
    const organizationDidDoc = await resolveDid(did, req);
    if (isEmpty(organizationDidDoc)) {
      return invokeError();
    }
    return organizationDidDoc;
  } catch {
    return invokeError();
  }
};

const buildFilterByGroup = async (context) => {
  const { repos, user } = context;
  if (isEmpty(user.groupId)) {
    return {};
  }
  const group = await repos.groups.findById(user.groupId);
  return { did: { $in: group.dids } };
};

const tryingToInsertPrimaryAddress = async (tenant, insertedKeys, req) => {
  const dltExist = some(
    ({ purposes }) => includes(KeyPurposes.DLT_TRANSACTIONS, purposes),
    insertedKeys
  );
  if (dltExist) {
    await addPrimaryAddressToTenant(tenant, req);
  }
};

module.exports = tenantController;
