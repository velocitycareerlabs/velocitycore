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

const { initContractClient } = require('@velocitycareerlabs/base-contract-io');

const contractAbi = require('./contracts/permissions.json');

const initPermissions = async (
  { privateKey, contractAddress, rpcProvider },
  context
) => {
  const { log } = context;
  log.info({ func: 'initPermission', privateKey, contractAddress });

  const { contractClient, executeContractTx } = await initContractClient(
    {
      privateKey,
      contractAddress,
      rpcProvider,
      contractAbi,
    },
    context
  );

  const updateAddressScopes = async ({
    address,
    scopesToAdd = [],
    scopesToRemove = [],
  }) => {
    log.info({
      func: 'updateAddressScopes',
      address,
      scopesToAdd,
      scopesToRemove,
    });
    await executeContractTx((nonce) =>
      contractClient.updateAddressScopes(address, scopesToAdd, scopesToRemove, {
        nonce,
      })
    );
  };

  const addAddressScope = async ({ address, scope }) => {
    log.info({ func: 'addAddressScope', address, scope });
    await executeContractTx((nonce) =>
      contractClient.addAddressScope(address, scope, { nonce })
    );
  };

  const removeAddressScope = async ({ address, scope }) => {
    log.info({ func: 'removeAddressScope', address, scope });
    await executeContractTx((nonce) =>
      contractClient.removeAddressScope(address, scope, { nonce })
    );
  };

  const getPrimaries = async () => {
    log.info({ func: 'getPrimaries' });
    return contractClient.getPrimaries();
  };

  const addPrimary = async ({ primary, permissioning, rotation }) => {
    log.info({ func: 'addPrimary', primary, permissioning, rotation });
    await executeContractTx((nonce) =>
      contractClient.addPrimary(primary, permissioning, rotation, {
        nonce,
      })
    );
  };

  const removeOperatorKey = async ({ primary, operator }) => {
    log.info({ func: 'removeOperator', primary, operator });
    await executeContractTx((nonce) =>
      contractClient.removeOperatorKey(primary, operator, {
        nonce,
      })
    );
  };

  const addOperatorKey = async ({ primary, operator }) => {
    log.info({ func: 'addOperatorKey', primary, operator });
    await executeContractTx((nonce) =>
      contractClient.addOperatorKey(primary, operator, {
        nonce,
      })
    );
  };

  const rotateOperatorKey = async ({ primary, newOperator, oldOperator }) => {
    log.info({ func: 'rotateOperatorKey', primary, newOperator, oldOperator });
    await executeContractTx((nonce) =>
      contractClient.rotateOperatorKey(primary, newOperator, oldOperator, {
        nonce,
      })
    );
  };

  const rotatePermissioning = async ({
    primary,
    newPermissioning,
    newRotation,
  }) => {
    log.info({
      func: 'rotatePermissioning',
      primary,
      newPermissioning,
      newRotation,
    });
    await executeContractTx((nonce) =>
      contractClient.rotatePermissioning(
        primary,
        newPermissioning,
        newRotation,
        {
          nonce,
        }
      )
    );
  };

  const lookupPrimary = async (address) => {
    log.info({
      func: 'lookupPrimary',
      address,
    });
    return contractClient.lookupPrimary(address);
  };

  return {
    contractClient,
    getPrimaries,
    addAddressScope,
    addOperatorKey,
    addPrimary,
    removeOperatorKey,
    removeAddressScope,
    rotateOperatorKey,
    rotatePermissioning,
    lookupPrimary,
    updateAddressScopes,
  };
};

module.exports = initPermissions;
