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

const { initPermissions } = require('@velocitycareerlabs/contract-permissions');
const { KeyPurposes, decrypt } = require('@velocitycareerlabs/crypto');
const {
  toEthereumAddress,
} = require('@velocitycareerlabs/blockchain-functions');
const { hexFromJwk } = require('@velocitycareerlabs/jwt');

const addPrimaryAddressToTenant = async ({ _id }, context) => {
  const { repos, config, rpcProvider } = context;
  const { permissionsContractAddress: contractAddress } = config;
  const filter = {
    tenantId: _id,
    purposes: KeyPurposes.DLT_TRANSACTIONS,
  };
  const keyDatum = await repos.keys.collection().findOne(filter);
  const stringifiedKey = decrypt(keyDatum.key, context.config.mongoSecret);
  const privateKey = hexFromJwk(JSON.parse(stringifiedKey));
  const publicAddress = toEthereumAddress(privateKey);
  const permissionContract = await initPermissions(
    {
      privateKey,
      contractAddress,
      rpcProvider,
    },
    context
  );
  const primaryAddress = await permissionContract.lookupPrimary(publicAddress);
  await repos.tenants.update(_id, {
    primaryAddress,
  });
};

module.exports = { addPrimaryAddressToTenant };
