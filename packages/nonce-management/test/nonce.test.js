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

const console = require('console');
const {
  mongoFactoryWrapper,
  mongoCloseWrapper,
} = require('@velocitycareerlabs/tests-helpers');
const { env: config } = require('@spencejs/spence-config');
const nonceRepoPlugin = require('./repo');
const multitenantNonceRepoPlugin = require('./multitenant-repo');
const { initNonceManagement, totalProjection } = require('..');

describe('Nonce management', () => {
  const address = '0x5f';
  const getTransactionCount = jest.fn();
  const provider = {
    getTransactionCount,
  };

  beforeAll(async () => {
    await mongoFactoryWrapper('test-nonce', {
      log: console,
      config,
    });
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoCloseWrapper();
  });

  describe('no wallet address version of nonce management', () => {
    it('should return 0 for nonces', async () => {
      const { resetAddressNonce, nextAddressNonce, rollbackAddressNonce } =
        initNonceManagement(undefined, undefined, { log: console });
      expect(await resetAddressNonce()).toEqual(undefined);
      expect(await nextAddressNonce()).toEqual(undefined);
      expect(await rollbackAddressNonce()).toEqual(undefined);
    });
  });

  describe('simple nonce management', () => {
    let nonceRepo;
    let resetAddressNonce;
    let nextAddressNonce;
    let rollbackAddressNonce;
    const context = {
      log: console,
    };

    beforeAll(() => {
      nonceRepo = nonceRepoPlugin({})({
        log: console,
      });
      context.repos = { walletNonces: nonceRepo };
      ({ resetAddressNonce, nextAddressNonce, rollbackAddressNonce } =
        initNonceManagement(address, provider, context));
    });

    beforeEach(async () => {
      await nonceRepo.collection().deleteMany();
    });

    describe('rollback address nonce', () => {
      it('should rollback the nonce value', async () => {
        await nonceRepo.insert({ _id: address, nonce: 10 });
        await rollbackAddressNonce(5);
        const dbNonce = await nonceRepo.findById(address, totalProjection);
        expect(dbNonce).toEqual({
          _id: address,
          nonce: 5,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });

    describe('reset address nonce', () => {
      it('should reset the nonce value', async () => {
        await nonceRepo.insert({ _id: address, nonce: 1 });
        getTransactionCount.mockResolvedValue(50);
        const nonce = await resetAddressNonce();

        expect(nonce).toEqual(50);
        expect(getTransactionCount).toHaveBeenCalledWith(address, 'pending');
        const dbNonce = await nonceRepo.findById(address, totalProjection);
        expect(dbNonce).toEqual({
          _id: address,
          nonce: 51,
          createdAt: expect.any(Date),
          updatedAt: dbNonce.createdAt,
        });
      });
      it('should reset even if the address doesnt exist yet', async () => {
        getTransactionCount.mockResolvedValue(50);
        const nonce = await resetAddressNonce();

        expect(nonce).toEqual(50);
        expect(getTransactionCount).toHaveBeenCalledWith(address, 'pending');
        const dbNonce = await nonceRepo.findById(address, totalProjection);
        expect(dbNonce).toEqual({
          _id: address,
          nonce: 51,
          createdAt: expect.any(Date),
          updatedAt: dbNonce.createdAt,
        });
      });
    });

    describe('get next address nonce', () => {
      it('Should store nonce if not already there', async () => {
        getTransactionCount.mockResolvedValue(0);
        const nonce = await nextAddressNonce();

        expect(nonce).toEqual(0);
        expect(getTransactionCount).toHaveBeenCalledWith(address, 'pending');
        const dbNonce = await nonceRepo.findById(address, totalProjection);
        expect(dbNonce).toEqual({
          _id: address,
          nonce: 1,
          createdAt: expect.any(Date),
          updatedAt: dbNonce.createdAt,
        });
      });

      it('Should store non-zero nonce if resyncing', async () => {
        getTransactionCount.mockResolvedValue(50);
        const nonce = await nextAddressNonce();

        expect(nonce).toEqual(50);
        expect(getTransactionCount).toHaveBeenCalledWith(address, 'pending');
        const dbNonce = await nonceRepo.findById(address, totalProjection);
        expect(dbNonce).toEqual({
          _id: address,
          nonce: 51,
          createdAt: expect.any(Date),
          updatedAt: dbNonce.createdAt,
        });
      });

      it('Should return new nonce', async () => {
        await nonceRepo.insert({ _id: address, nonce: 1 });
        const nonce = await nextAddressNonce();

        expect(nonce).toEqual(1);
        expect(getTransactionCount).toHaveBeenCalledTimes(0);
        const dbNonce = await nonceRepo.findById(address, totalProjection);
        expect(dbNonce).toEqual({
          _id: address,
          nonce: 2,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
        expect(dbNonce.updatedAt).not.toEqual(dbNonce.createdAt);
      });

      it('Should not throw if duplicate error code is thrown', async () => {
        getTransactionCount.mockImplementation(async (addr) => {
          await nonceRepo.insert({ _id: addr, nonce: 20 });
          return 1;
        });
        const nonce = await nextAddressNonce();

        expect(nonce).toEqual(20);
        const dbNonce = await nonceRepo.findById(address, totalProjection);
        expect(dbNonce).toEqual({
          _id: address,
          nonce: 21,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
        expect(dbNonce.updatedAt).not.toEqual(dbNonce.createdAt);
      });

      it('Should throw for any regular error', async () => {
        const error = new Error();
        error.code = 0;

        getTransactionCount.mockImplementation(async () => {
          throw error;
        });
        await expect(nextAddressNonce()).rejects.toEqual(error);
      });
    });
  });

  describe('multitenant nonce management', () => {
    const context = {
      log: console,
      tenant: { _id: 'ACME' },
    };

    let multitenantNonceRepo;
    let nextAddressNonce;
    let resetAddressNonce;

    beforeAll(() => {
      multitenantNonceRepo = multitenantNonceRepoPlugin({})(context);
      context.repos = { walletNonces: multitenantNonceRepo };
      ({ nextAddressNonce, resetAddressNonce } = initNonceManagement(
        address,
        provider,
        context
      ));
    });

    beforeEach(async () => {
      await multitenantNonceRepo.collection().deleteMany();
    });

    describe('reset address nonce', () => {
      it('should reset the nonce value', async () => {
        await multitenantNonceRepo.insert({ _id: address, nonce: 1 });
        getTransactionCount.mockResolvedValue(50);
        const nonce = await resetAddressNonce();

        expect(nonce).toEqual(50);
        expect(getTransactionCount).toHaveBeenCalledWith(address, 'pending');
        const dbNonce = await multitenantNonceRepo.findById(
          address,
          totalProjection
        );
        expect(dbNonce).toEqual({
          _id: address,
          nonce: 51,
          tenantId: context.tenant._id,
          createdAt: expect.any(Date),
          updatedAt: dbNonce.createdAt,
        });
      });
      it('should reset even if the address doesnt exist yet', async () => {
        getTransactionCount.mockResolvedValue(50);
        const nonce = await resetAddressNonce();

        expect(nonce).toEqual(50);
        expect(getTransactionCount).toHaveBeenCalledWith(address, 'pending');
        const dbNonce = await multitenantNonceRepo.findById(
          address,
          totalProjection
        );
        expect(dbNonce).toEqual({
          _id: address,
          nonce: 51,
          tenantId: context.tenant._id,
          createdAt: expect.any(Date),
          updatedAt: dbNonce.createdAt,
        });
      });
    });

    describe('multitenant next address nonce', () => {
      it('Should store nonce if not already there', async () => {
        getTransactionCount.mockResolvedValue(0);
        const nonce = await nextAddressNonce();

        expect(nonce).toEqual(0);
        expect(getTransactionCount).toHaveBeenCalledWith(address, 'pending');
        const dbNonce = await multitenantNonceRepo.findById(
          address,
          totalProjection
        );
        expect(dbNonce).toEqual({
          _id: address,
          nonce: 1,
          tenantId: context.tenant._id,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });

      it('Should return new nonce', async () => {
        await multitenantNonceRepo.insert({ _id: address, nonce: 1 });
        const nonce = await nextAddressNonce();

        expect(nonce).toEqual(1);
        expect(getTransactionCount).toHaveBeenCalledTimes(0);
        const dbNonce = await multitenantNonceRepo.findById(
          address,
          totalProjection
        );
        expect(dbNonce).toEqual({
          _id: address,
          nonce: 2,
          tenantId: context.tenant._id,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });

      it('Silently migrate entries that dont have tenant values', async () => {
        // insert using raw insertOne so that no tenantId is set
        await multitenantNonceRepo.collection().insertOne({
          _id: address,
          nonce: 1,
          updatedAt: new Date(),
          createdAt: new Date(),
        });

        // run the test
        const nonce = await nextAddressNonce();

        expect(nonce).toEqual(1);
        expect(getTransactionCount).toHaveBeenCalledTimes(0);
        const dbNonce = await multitenantNonceRepo.findById(
          address,
          totalProjection
        );
        expect(dbNonce).toEqual({
          _id: address,
          nonce: 2,
          tenantId: context.tenant._id, // check tenantId was set
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });

      it('Should succeed, even if the tenant is wrong', async () => {
        const betaMultitenantNonceRepo = multitenantNonceRepoPlugin({})({
          ...context,
          tenant: { _id: 'BETA' },
        });
        betaMultitenantNonceRepo.insert({ _id: address, nonce: 5 });
        const nonce = await nextAddressNonce();
        expect(nonce).toEqual(5);
        const betaDbNonce = await betaMultitenantNonceRepo.findById(
          address,
          totalProjection
        );
        expect(betaDbNonce).toEqual({
          _id: address,
          nonce: 6,
          tenantId: 'BETA',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });
  });
});
