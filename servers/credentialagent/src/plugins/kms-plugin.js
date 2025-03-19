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

const fp = require('fastify-plugin');
const { dbKmsPlugin } = require('@velocitycareerlabs/db-kms');
const {
  multitenantExtension,
} = require('@velocitycareerlabs/spencer-mongo-extensions');

const agentKmsOptions = {
  name: 'keys',
  entityName: 'key',
  keyProp: 'key',
  encryptedKeyProp: 'key',
  publicKeyProp: 'publicKey',
  defaultProjection: {
    _id: 1,
    purposes: 1,
    algorithm: 1,
    encoding: 1,
    kidFragment: 1,
    tenantId: 1,
    createdAt: 1,
    updatedAt: 1,
  },
  extensions: [multitenantExtension()],
  transformToKmsKey: (result) => {
    /* eslint-disable better-mutation/no-mutation */
    result.id = result._id.toString();
    result._id = undefined;

    result.publicJwk = result.publicKey;
    result.publicKey = undefined;

    result.privateJwk = result.key;
    result.key = undefined;
    /* eslint-enable */
    return result;
  },
};

const kmsPlugin = async (fastify) => {
  fastify.register(dbKmsPlugin, agentKmsOptions);
};
module.exports = { kmsPlugin: fp(kmsPlugin), agentKmsOptions };
