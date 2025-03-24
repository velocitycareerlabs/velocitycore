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

const { last } = require('lodash/fp');
const { initContractClient } = require('@velocitycareerlabs/base-contract-io');
const contractAbi = require('./contracts/verification-coupon.json');

const initVerificationCoupon = async (
  { privateKey, contractAddress, rpcProvider },
  context
) => {
  const { log } = context;
  log.info({ privateKey, contractAddress }, 'initVerificationCoupon');

  const { contractClient, executeContractTx, pullEvents } =
    await initContractClient(
      {
        privateKey,
        contractAddress,
        rpcProvider,
        contractAbi,
      },
      context
    );

  const isExpired = (tokenId) => {
    log.info({ tokenId }, 'isExpired');
    return contractClient.isExpired(tokenId);
  };

  const mint = async ({ toAddress, expirationTime, quantity, ownerDid }) => {
    log.info({ toAddress, expirationTime, quantity, ownerDid }, 'mint');
    const { traceId } = context;
    const transactionReceipt = await executeContractTx((nonce) =>
      contractClient.mint(
        toAddress,
        Math.floor(Date.parse(expirationTime) / 1000),
        quantity,
        traceId,
        ownerDid,
        { nonce }
      )
    );

    return last(transactionReceipt.logs).args;
  };

  const burn = async (tokenId, traceId, caoDid, burnerDid, burnAddress) => {
    log.info({ tokenId, traceId, caoDid, burnerDid, burnAddress }, 'burn');
    const transactionReceipt = await executeContractTx((nonce) =>
      contractClient.burn(tokenId, traceId, caoDid, burnerDid, burnAddress, {
        nonce,
      })
    );

    return last(transactionReceipt.logs).args;
  };

  const setPermissionsAddress = async (permissionsContractAddress) => {
    return executeContractTx((nonce) =>
      contractClient.setPermissionsAddress(permissionsContractAddress, {
        nonce,
      })
    );
  };

  const getCoupon = (fromAddress) => {
    log.info({ fromAddress }, 'fromAddress');
    return contractClient.getTokenId(fromAddress);
  };

  const pullMintCouponBundleEvents = pullEvents('MintCouponBundle');

  const pullBurnCouponEvents = pullEvents('BurnCoupon');

  return {
    contractClient,
    isExpired,
    mint,
    burn,
    setPermissionsAddress,
    pullMintCouponBundleEvents,
    pullBurnCouponEvents,
    getCoupon,
  };
};

module.exports = initVerificationCoupon;
