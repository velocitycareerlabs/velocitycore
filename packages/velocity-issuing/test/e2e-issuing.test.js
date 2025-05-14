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

const { after, before, beforeEach, describe, it } = require('node:test');
const { expect } = require('expect');

const console = require('console');
const {
  mongoFactoryWrapper,
  mongoCloseWrapper,
} = require('@velocitycareerlabs/tests-helpers');
const {
  toEthereumAddress,
} = require('@velocitycareerlabs/blockchain-functions');
const { initPermissions } = require('@velocitycareerlabs/contract-permissions');
const {
  deployPermissionContract,
  deployVerificationCouponContract,
  deployMetadataContract,
  deployRevocationContract,
  deployerPrivateKey,
  rpcProvider,
} = require('@velocitycareerlabs/metadata-registration/test/helpers/deploy-contracts');

const { nanoid } = require('nanoid');
const {
  jwkFromSecp256k1Key,
  jwtSign,
  jwtDecode,
} = require('@velocitycareerlabs/jwt');
const initRequest = require('@velocitycareerlabs/request');
const { MongoClient } = require('mongodb');
const { map } = require('lodash/fp');
const { collectionClient } = require('./helpers/collection-client');
const { entityFactory } = require('./helpers/entity-factory');

const freeCredentialTypesList = ['EmailV1.0', 'DrivingLicenseV1.0'];

const { offerFactory } = require('./helpers/offer-factory');
const { createExampleDid } = require('./helpers/create-example-did');
const {
  issueVelocityVerifiableCredentials,
} = require('../src/issue-velocity-verifiable-credentials');
const { credentialTypesMap } = require('./helpers/credential-types-map');
const { jwtVcExpectation } = require('./helpers/jwt-vc-expectation');
const {
  mongoAllocationListQueries,
} = require('../src/adapters/mongo-allocation-list-queries');

describe('E2E issuing', { timeout: 60000 }, () => {
  const mongoClient = new MongoClient('mongodb://localhost:27017/');

  const repos = {};

  let context;
  let issuerEntity;
  let caoEntity;
  let issuer;

  let revocationContractAddress;
  let metadataRegistryContractAddress;

  before(async () => {
    await mongoFactoryWrapper('test-metadata-registry', context);
    repos.revocationListAllocations = await collectionClient({
      mongoClient,
      name: 'revocationListAllocations',
    });
    repos.metadataListAllocations = await collectionClient({
      mongoClient,
      name: 'metadataListAllocations',
    });

    context = buildContext({
      repos,
    });

    issuerEntity = entityFactory({ service: [{ id: '#issuer-1' }] });
    caoEntity = entityFactory({ service: [{ id: '#cao-1' }] });
    issuer = {
      id: nanoid(),
      did: issuerEntity.did,
      issuingServiceId: issuerEntity.service[1]?.id,
      issuingServiceKMSKeyId: issuerEntity.key[0].id,
      issuingServiceDIDKeyId: issuerEntity.key[0].id,
      dltOperatorAddress: toEthereumAddress(issuerEntity.keyPair.publicKey),
      dltOperatorKMSKeyId: issuerEntity.key[0].id,
      dltPrimaryAddress: issuerEntity.primaryAddress,
    };

    const permissionsAddress = await deployPermissionContract();
    const verificationCouponAddress = await deployVerificationCouponContract(
      permissionsAddress,
      context
    );
    revocationContractAddress = await deployRevocationContract(
      permissionsAddress,
      context
    );
    metadataRegistryContractAddress = await deployMetadataContract(
      freeCredentialTypesList,
      verificationCouponAddress,
      permissionsAddress,
      context
    );

    const deployerPermissionsClient = await initPermissions(
      {
        privateKey: deployerPrivateKey,
        contractAddress: permissionsAddress,
        rpcProvider,
      },
      context
    );
    await deployerPermissionsClient.addAddressScope({
      address: metadataRegistryContractAddress,
      scope: 'coupon:burn',
    });
    await deployerPermissionsClient.addPrimary({
      primary: issuer.dltPrimaryAddress,
      permissioning: issuer.dltPrimaryAddress,
      rotation: issuer.dltPrimaryAddress,
    });
    await deployerPermissionsClient.addAddressScope({
      address: issuer.dltPrimaryAddress,
      scope: 'transactions:write',
    });
    await deployerPermissionsClient.addAddressScope({
      address: issuer.dltPrimaryAddress,
      scope: 'credential:issue',
    });
    await deployerPermissionsClient.addAddressScope({
      address: issuer.dltPrimaryAddress,
      scope: 'credential:contactissue',
    });
    const operatorPermissionsClient = await initPermissions(
      {
        privateKey: issuerEntity.keyPair.privateKey,
        contractAddress: permissionsAddress,
        rpcProvider,
      },
      context
    );
    await operatorPermissionsClient.addOperatorKey({
      primary: issuer.dltPrimaryAddress,
      operator: issuer.dltOperatorAddress,
    });
  });

  after(async () => {
    await mongoCloseWrapper();
    await mongoClient.close();
  });

  beforeEach(async () => {
    await repos.revocationListAllocations.deleteMany();
    await repos.metadataListAllocations.deleteMany();
    context = buildContext({
      issuerEntity,
      caoEntity,
      revocationContractAddress,
      metadataRegistryContractAddress,
      allocationListQueries: mongoAllocationListQueries(
        mongoClient.db('test-collections')
      ),
      rpcProvider,
    });
  });

  it('should create vcs', async () => {
    const offers = map(offerFactory, [
      { issuerId: issuerEntity.did }, // default email credential
      {
        type: 'EmploymentCurrentV1.1',
        issuerId: issuerEntity.did,
        credentialSubject: {
          role: 'Software Developer',
          legalEmployer: {
            name: 'ACME Corporation',
          },
          startDate: '2022-04-01',
        },
      },
    ]);
    const userId = createExampleDid();
    const credentials = await issueVelocityVerifiableCredentials(
      offers,
      userId,
      credentialTypesMap,
      issuer,
      context
    );

    expect(credentials.length).toEqual(offers.length);
    for (let i = 0; i < credentials.length; i += 1) {
      const jwtVc = jwtDecode(credentials[i]);

      // eslint-disable-next-line no-await-in-loop
      jwtVcExpectation({
        issuerEntity,
        offer: offers[i],
        credentialId: jwtVc.payload.jti,
        userId,
      });
    }
  });
});

const buildContext = ({
  issuerEntity,
  caoEntity,
  db,
  revocationContractAddress = '0x1234',
  metadataRegistryContractAddress = '0x01',
  ...args
}) => ({
  kms: {
    exportKeyOrSecret: (keyId) => {
      const issuerKeyId = issuerEntity.key[0].id;
      if (keyId !== issuerKeyId) {
        throw new Error('KeyNotFound');
      }
      return Promise.resolve({
        privateJwk: jwkFromSecp256k1Key(issuerEntity.keyPair.privateKey),
        id: issuerKeyId,
      });
    },
    async signJwt(jwtJson, keyId, headers) {
      const key = await this.exportKeyOrSecret(keyId);
      return jwtSign(jwtJson, key.privateJwk, headers);
    },
  },
  caoDid: caoEntity?.did,
  config: {
    revocationContractAddress,
    metadataRegistryContractAddress,
    credentialExtensionsContextUrl:
      'https://lib.test/contexts/credential-extensions-2022.jsonld.json',
  },
  db,
  registrarFetch: initRequest({
    prefixUrl: 'http://oracle.localhost.test',
  })({ log: console }),
  log: console,
  traceId: nanoid(),
  ...args,
});
