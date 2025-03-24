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

const mockEncodeFilterTopics = jest.fn();
const mockGetBlockNumber = jest.fn();
const mockQueryFilter = jest.fn();
const mockContract = jest.fn();
const { range, map } = require('lodash/fp');
const { generateKeyPair } = require('@velocitycareerlabs/crypto');
const { env: config } = require('@spencejs/spence-config');
const console = require('console');

const testEventsAbi = require('./data/test-events-abi.json');

const { initContractClient, initProvider } = require('../index');

const context = {
  log: console,
  config,
};

jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');

  return {
    ...originalModule,
    Contract: mockContract,
  };
});
describe('Mocked Contract Client Test Suite', () => {
  const authenticate = () => 'TOKEN';

  beforeAll(async () => {});

  afterAll(async () => {});

  beforeEach(() => {
    jest.resetAllMocks();
    mockContract.mockImplementation(() => ({
      getAddress: () => 'foo',
      interface: {
        encodeFilterTopics: mockEncodeFilterTopics,
      },
      runner: {
        provider: {
          getBlockNumber: mockGetBlockNumber,
          connection: {
            headers: {},
          },
        },
      },
      queryFilter: mockQueryFilter,
    }));
    mockEncodeFilterTopics.mockReturnValue(['fooTopic1', 'fooTopic2']);
  });

  describe('Contract Client functions Test Suite', () => {
    let contractWithEventsClient;

    beforeEach(async () => {
      const { privateKey: clientPrivateKey } = generateKeyPair();

      contractWithEventsClient = await initContractClient(
        {
          privateKey: clientPrivateKey,
          contractAddress: 'foo',
          contractAbi: testEventsAbi,
          rpcProvider: initProvider('foo', authenticate),
        },
        context
      );
    });

    it('Should be able to get events', async () => {
      mockGetBlockNumber.mockResolvedValue(3432);
      mockQueryFilter.mockResolvedValue(
        map((n) => ({ event: n }), range(0, 200))
      );

      const pullFooEvents = contractWithEventsClient.pullEvents(
        'CreatedMetadataList'
      );
      const { latestBlock, eventsCursor } = await pullFooEvents();

      for await (const events of eventsCursor()) {
        expect(events).toHaveLength(200);
      }
      expect(latestBlock).toEqual(3432);
      expect(mockQueryFilter).toHaveBeenCalledTimes(7);
      expect(mockQueryFilter).toHaveBeenNthCalledWith(
        1,
        'CreatedMetadataList',
        0,
        499
      );
      expect(mockQueryFilter).toHaveBeenNthCalledWith(
        2,
        'CreatedMetadataList',
        500,
        999
      );
      expect(mockQueryFilter).toHaveBeenNthCalledWith(
        3,
        'CreatedMetadataList',
        1000,
        1499
      );
      expect(mockQueryFilter).toHaveBeenNthCalledWith(
        4,
        'CreatedMetadataList',
        1500,
        1999
      );
      expect(mockQueryFilter).toHaveBeenNthCalledWith(
        5,
        'CreatedMetadataList',
        2000,
        2499
      );
      expect(mockQueryFilter).toHaveBeenNthCalledWith(
        6,
        'CreatedMetadataList',
        2500,
        2999
      );
      expect(mockQueryFilter).toHaveBeenNthCalledWith(
        7,
        'CreatedMetadataList',
        3000,
        3432
      );
    });
  });
});
