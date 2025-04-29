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

const { generateKeyPair } = require('@velocitycareerlabs/crypto');
const { wait } = require('@velocitycareerlabs/common-functions');
const {
  mongoFactoryWrapper,
  mongoCloseWrapper,
} = require('@velocitycareerlabs/tests-helpers');
const { env: config } = require('@spencejs/spence-config');
const console = require('console');

const {
  toEthereumAddress,
} = require('@velocitycareerlabs/blockchain-functions');

const testEventsAbi = require('./data/test-events-abi.json');
const testNoEventsAbi = require('./data/test-no-events-abi.json');

const { initContractClient, initProvider } = require('../index');
const { deployContract } = require('./helpers/deployContract');

const context = {
  log: console,
  config,
};

describe('Contract Client Test Suite', () => {
  jest.setTimeout(15000);
  const { privateKey: deployerPrivateKey } = generateKeyPair();
  const randomAccount = toEthereumAddress(generateKeyPair().publicKey);
  const rpcUrl = 'http://localhost:8545';
  const authenticate = () => 'TOKEN';
  const rpcProvider = initProvider(rpcUrl, authenticate);

  const deployContractThatHasEvents = () =>
    deployContract(testEventsAbi, deployerPrivateKey, rpcUrl, (contract) =>
      contract.initialize(randomAccount, ['0x2c26'])
    );

  const deployContractThatHasNoEvents = () =>
    deployContract(testNoEventsAbi, deployerPrivateKey, rpcUrl);

  beforeAll(async () => {
    await mongoFactoryWrapper('test-contract', context);
  });

  afterAll(async () => {
    await mongoCloseWrapper();
  });

  describe('Contract Client Creation Test Suite', () => {
    let contractInstance;
    let contractClient;

    beforeEach(async () => {
      contractInstance = await deployContractThatHasEvents();
    });
    it('Creating a client with no contractAddress should fail', async () => {
      const { privateKey: clientPrivateKey } = generateKeyPair();
      const func = async () =>
        initContractClient(
          {
            privateKey: clientPrivateKey,
            contractAbi: testEventsAbi,
            rpcProvider,
          },
          context
        );
      expect(func).rejects.toThrowError(
        'Check the required parameters: contractAddress'
      );
    });

    it('Create a client', async () => {
      const { privateKey: clientPrivateKey } = generateKeyPair();

      contractClient = await initContractClient(
        {
          privateKey: clientPrivateKey,
          contractAddress: await contractInstance.getAddress(),
          contractAbi: testEventsAbi,
          rpcProvider,
        },
        context
      );

      expect(contractClient.wallet.provider).toEqual(rpcProvider);
      expect(contractClient.contractClient.runner.provider).toEqual(
        rpcProvider
      );
    });
  });

  describe('Contract Client functions Test Suite', () => {
    let contractWithEventsClient;

    beforeEach(async () => {
      const contractInstance = await deployContractThatHasEvents();
      const { privateKey: clientPrivateKey } = generateKeyPair();

      contractWithEventsClient = await initContractClient(
        {
          privateKey: clientPrivateKey,
          contractAddress: await contractInstance.getAddress(),
          contractAbi: testEventsAbi,
          rpcProvider,
        },
        context
      );
    });

    it('Should be able to get events', async () => {
      const pullFooEvents = contractWithEventsClient.pullEvents(
        'CreatedMetadataList'
      );
      const { latestBlock, eventsCursor } = await pullFooEvents();

      for await (const events of eventsCursor()) {
        expect(events).toEqual([]);
      }
      expect(latestBlock).toBeGreaterThan(0);
    });
  });

  describe('execution of contract transactions', () => {
    let contractClient;
    let testTxFunc;
    let fakeAddress;

    beforeEach(async () => {
      const contractInstance = await deployContractThatHasNoEvents();

      contractClient = await initContractClient(
        {
          privateKey: deployerPrivateKey,
          contractAddress: await contractInstance.getAddress(),
          contractAbi: testNoEventsAbi,
          rpcProvider,
        },
        context
      );

      const { contractClient: client } = contractClient;
      fakeAddress = toEthereumAddress(generateKeyPair().publicKey);
      testTxFunc = async ({ address, scope }) => {
        const tx = await client.addAddressScope(address, scope);
        return tx.wait();
      };
      await wait(2000);
    });

    it('should rethrow other errors', async () => {
      await testTxFunc({
        address: fakeAddress,
        scope: 'foo',
      });

      await expect(
        testTxFunc({
          address: fakeAddress,
          scope: 'bar',
        })
      ).rejects.toThrowError(/unsigned value cannot be negative/);
    });
  });
});
