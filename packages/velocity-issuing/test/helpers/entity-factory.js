/*
 * Copyright 2024 Velocity Team
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

const { nanoid } = require('nanoid');
const { generateKeyPair } = require('@velocitycareerlabs/crypto');
const {
  toEthereumAddress,
} = require('@velocitycareerlabs/blockchain-functions');
const { createExampleDid } = require('./create-example-did');

const entityFactory = ({ service = [], key = [], ...values } = {}) => {
  const keyPair = generateKeyPair();

  const did = createExampleDid();
  return {
    id: did,
    did,
    service: [
      {
        id: nanoid(),
        type: 'VelocityNetworkPrimaryAddress',
      },
      ...service,
    ],
    key: [
      { id: `${did}#velocity-key-1`, publicKeyHex: keyPair.publicKey },
      ...key,
    ],
    keyPair,
    kmsKeyId: nanoid(),
    primaryAddress: toEthereumAddress(keyPair.publicKey),
    ...values,
  };
};

module.exports = { entityFactory };
