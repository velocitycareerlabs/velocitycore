/*
 * Copyright 2025 Velocity Team
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
 *
 */
const { toRelativeServiceId } = require('@velocitycareerlabs/did-doc');
const newError = require('http-errors');
const { mapKeyResponse } = require('../domains');

const getKey = async (did, kid, { repos }) => {
  const organization = await repos.organizations.findOneByDid(did);

  const keyId = toRelativeServiceId(kid);
  const key = await repos.organizationKeys.findOne({
    filter: {
      id: keyId,
      organizationId: organization._id,
    },
  });

  if (key == null) {
    throw newError.NotFound('Key not found');
  }

  return { key: mapKeyResponse(key), custodied: key.custodied };
};

module.exports = { getKey };
