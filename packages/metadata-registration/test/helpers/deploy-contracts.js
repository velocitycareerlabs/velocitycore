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

const {
  deployContract,
} = require('@velocitycareerlabs/base-contract-io/test/helpers/deployContract');
const {
  deployTestPermissionsContract,
} = require('@velocitycareerlabs/contract-permissions/test/helpers/deploy-test-permissions-contract');
const {
  generateKeyPair,
  get2BytesHash,
} = require('@velocitycareerlabs/crypto');
const { initProvider } = require('@velocitycareerlabs/base-contract-io');
const {
  toEthereumAddress,
} = require('@velocitycareerlabs/blockchain-functions/src/ethers-wrappers');
const { initVerificationCoupon, initMetadataRegistry } = require('../../index');
const verificationCouponAbi = require('../../src/contracts/verification-coupon.json');
const metadataRegistryAbi = require('../../src/contracts/metadata-registry.json');
const revocationRegistryAbi = require('../../src/contracts/revocation-registry.json');
const initRevocationRegistry = require('../../src/revocation-registry');

const rpcUrl = 'http://localhost:8545';
const authenticate = () => 'TOKEN';
const rpcProvider = initProvider(rpcUrl, authenticate);
const { privateKey: deployerPrivateKey } = generateKeyPair();

const deployPermissionContract = async () => {
  console.log(
    JSON.stringify({
      call: 'deployPermissionContract',
      fromAddress: toEthereumAddress(deployerPrivateKey),
    })
  );
  const permissionsContract = await deployTestPermissionsContract(
    deployerPrivateKey,
    rpcUrl
  );
  return permissionsContract.getAddress();
};

const deployVerificationCouponContract = async (
  permissionsAddress,
  context
) => {
  const name = 'Velocity Verification Coupon';
  const baseTokenURI = 'https://www.velocitynetwork.foundation/';

  console.log(
    JSON.stringify({
      call: 'deployVerificationCouponContract',
      fromAddress: toEthereumAddress(deployerPrivateKey),
    })
  );
  const verificationCouponContract = await deployContract(
    verificationCouponAbi,
    deployerPrivateKey,
    rpcUrl,
    (contract) => contract.initialize(name, baseTokenURI)
  );

  const verificationCouponAddress =
    await verificationCouponContract.getAddress();
  const deployerVerificationCouponClient = await initVerificationCoupon(
    {
      privateKey: deployerPrivateKey,
      contractAddress: verificationCouponAddress,
      rpcProvider,
    },
    context
  );

  await deployerVerificationCouponClient.setPermissionsAddress(
    permissionsAddress
  );
  return verificationCouponAddress;
};

const deployMetadataContract = async (
  freeCredentialTypes,
  verficationCouponAddress,
  permissionsAddress,
  context
) => {
  console.log(
    JSON.stringify({
      call: 'deployMetadataContract',
      fromAddress: toEthereumAddress(deployerPrivateKey),
    })
  );
  const metadataRegistryContract = await deployContract(
    metadataRegistryAbi,
    deployerPrivateKey,
    rpcUrl,
    async (contract) =>
      contract.initialize(
        verficationCouponAddress,
        freeCredentialTypes.map(get2BytesHash)
      )
  );
  const contractMetadataAddress = await metadataRegistryContract.getAddress();

  const metadataRegistryDeployerClient = await initMetadataRegistry(
    {
      privateKey: deployerPrivateKey,
      contractAddress: contractMetadataAddress,
      rpcProvider,
    },
    context
  );
  await metadataRegistryDeployerClient.setPermissionsAddress(
    permissionsAddress
  );
  return contractMetadataAddress;
};

const deployRevocationContract = async (
  permissionsContractAddress,
  context
) => {
  console.log(
    JSON.stringify({
      call: 'deployRevocationContract',
      fromAddress: toEthereumAddress(deployerPrivateKey),
    })
  );
  const revocationRegistryContract = await deployContract(
    revocationRegistryAbi,
    deployerPrivateKey,
    rpcUrl
  );
  const revocationRegistryContractAddress =
    await revocationRegistryContract.getAddress();

  console.log(
    JSON.stringify({
      call: 'initRevocationRegistry',
      fromAddress: toEthereumAddress(deployerPrivateKey),
    })
  );
  const deployerRevocationRegistry = await initRevocationRegistry(
    {
      privateKey: deployerPrivateKey,
      contractAddress: revocationRegistryContractAddress,
      rpcProvider,
    },
    context
  );
  console.log(
    JSON.stringify({
      call: 'setPermissionsAddress',
      fromAddress: toEthereumAddress(deployerPrivateKey),
    })
  );
  await deployerRevocationRegistry.setPermissionsAddress(
    permissionsContractAddress
  );
  return revocationRegistryContractAddress;
};

module.exports = {
  deployPermissionContract,
  deployVerificationCouponContract,
  deployMetadataContract,
  deployRevocationContract,
  rpcProvider,
  rpcUrl,
  deployerPrivateKey,
};
