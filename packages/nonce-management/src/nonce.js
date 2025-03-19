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

const { NonceCollectionErrors } = require('./constants');

const initNonceManagement = (address, provider, context) => {
  const { log } = context;
  const getInitialNonce = async () => {
    log.info({ address }, 'getTransactionCount');
    const result = await provider.getTransactionCount(address, 'pending');
    log.info({ result }, 'getTransactionCount');
    return result;
  };

  if (address != null && context.repos?.walletNonces != null) {
    return {
      nextAddressNonce: async () =>
        nextNonce(address, getInitialNonce, context),
      resetAddressNonce: async () =>
        resetNonce(address, getInitialNonce, context),
      rollbackAddressNonce: async (nonce) =>
        rollbackNonce(address, nonce, context),
    };
  }

  return {
    nextAddressNonce: async () => undefined,
    resetAddressNonce: async () => undefined,
    rollbackAddressNonce: async () => {},
  };
};

const nextNonce = async (address, getInitialNonce, context) => {
  try {
    const { repos, log } = context;
    const nonce = await repos.walletNonces.incrementNonce(address);
    log.info({ address, nonce }, 'nextNonce');
    return nonce;
  } catch (error) {
    if (error.message === NonceCollectionErrors.NONCE_NOT_FOUND) {
      return insertInitialNonce(address, getInitialNonce, context);
    }

    throw error;
  }
};

const resetNonce = async (address, getInitialNonce, context) => {
  const { repos, log } = context;
  await repos.walletNonces.delUsingFilter({ filter: { _id: address } }); // use delUsingFilter to avoid the notFound error when using del
  const nonce = await insertInitialNonce(address, getInitialNonce, context);
  log.info({ address, nonce }, 'resetNonce');
  return nonce;
};

const rollbackNonce = async (address, nonce, { repos, log }) => {
  log.info({ address, nonce }, 'rollbackAddressNonce');
  await repos.walletNonces.updateUsingFilter(
    // requires the filter { nonce: {$gt: nonce} } to ensure that if rollback is requested to a higher value that request is ignored
    { filter: { _id: address, nonce: { $gt: nonce } } },
    { nonce }
  );
};

const insertInitialNonce = async (address, getInitialNonce, { repos, log }) => {
  try {
    const initialNonce = await getInitialNonce(address);
    await repos.walletNonces.insert({
      _id: address,
      nonce: initialNonce + 1, // set nonce to be the next value to be used
    });
    return initialNonce;
  } catch (error) {
    if (isDuplicate(error)) {
      log.info('nonce duplicate race condition');
      // this branch handles the potential race condition of two requests for nonces happening simultaneously and one winning the insert
      return repos.walletNonces.incrementNonce(address);
    }

    throw error;
  }
};

const DuplicateKeyError = 11000;
const isDuplicate = (error) => error?.code === DuplicateKeyError;

module.exports = {
  initNonceManagement,
};
