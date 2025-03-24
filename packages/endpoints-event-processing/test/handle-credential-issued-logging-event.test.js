/*
 * Copyright 2025 Velocity Team
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
  events: sampleCredentialEventsArray,
} = require('./data/sample-credential-events-array');

const mockReadDocument = jest.fn().mockResolvedValue(undefined);
const mockWriteDocument = jest.fn().mockResolvedValue(undefined);
const mockInitReadDocument = jest.fn().mockReturnValue(mockReadDocument);
const mockInitWriteDocument = jest.fn().mockReturnValue(mockWriteDocument);
const mockLogInfo = jest.fn();
const mockEventCursorNext = jest.fn();
const mockEventCursor = jest.fn().mockImplementation(() => {
  return {
    [Symbol.asyncIterator]: () => {
      return {
        next: mockEventCursorNext
          .mockImplementationOnce(async () => {
            return { value: [] };
          })
          .mockImplementationOnce(async () => {
            return { value: sampleCredentialEventsArray };
          })
          .mockImplementationOnce(async () => {
            return { done: true };
          }),
      };
    },
  };
});

const mockPullAddedCredentialMetadataEvents = jest
  .fn()
  .mockResolvedValue({ eventsCursor: mockEventCursor, latestBlock: 42 });
const mockInitMetadataRegistry = jest.fn().mockImplementation(() => {
  return {
    pullAddedCredentialMetadataEvents: mockPullAddedCredentialMetadataEvents,
  };
});

const { handleCredentialIssuedLoggingEvent } = require('../src/handlers');

jest.mock('@velocitycareerlabs/aws-clients', () => {
  const originalModule = jest.requireActual('@velocitycareerlabs/aws-clients');

  return {
    ...originalModule,
    initReadDocument: mockInitReadDocument,
    initWriteDocument: mockInitWriteDocument,
  };
});

jest.mock('@velocitycareerlabs/metadata-registration', () => {
  const originalModule = jest.requireActual(
    '@velocitycareerlabs/metadata-registration'
  );
  return {
    ...originalModule,
    initMetadataRegistry: mockInitMetadataRegistry,
  };
});

describe('Credential issued event logging task test suite', () => {
  const task = 'credential-issued-logging';
  const testContext = {
    config: {
      couponContractAddress: 'TESTS',
      rpcUrl: 'TESTS',
    },
    log: {
      info: mockLogInfo,
    },
    repos: {
      walletNonces: {},
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should successfully write log entries for a given set of events read off the blockchain', async () => {
    mockReadDocument.mockResolvedValue({
      Item: {
        EventName: task,
        BlockNumber: 1,
      },
    });

    await handleCredentialIssuedLoggingEvent(testContext);

    expect(mockInitReadDocument).toHaveBeenCalledTimes(1);
    expect(mockInitWriteDocument).toHaveBeenCalledTimes(1);
    expect(mockInitMetadataRegistry).toHaveBeenCalledTimes(1);

    expect(mockReadDocument).toHaveBeenCalledTimes(1);
    expect(mockReadDocument).toHaveBeenCalledWith(
      testContext.config.dynamoDbTableEventBlock,
      { EventName: task }
    );

    expect(mockPullAddedCredentialMetadataEvents).toHaveBeenCalledTimes(1);
    expect(mockPullAddedCredentialMetadataEvents).toHaveBeenCalledWith(2);

    expect(mockLogInfo).toHaveBeenCalledTimes(12);
    expect(mockLogInfo).toHaveBeenNthCalledWith(9, {
      blockHash: expect.any(String),
      blockNumber: expect.any(Number),
      caoDid: expect.any(String),
      credentialType: expect.any(String),
      event: 'AddedCredentialMetadata',
      eventTraceId: 'trackingId',
      index: '2342',
      issuerDid: expect.any(String),
      listId: '123',
      sender: expect.any(String),
      transactionHash: expect.any(String),
      transactionIndex: 0,
    });

    expect(mockWriteDocument).toHaveBeenCalledTimes(1);
    expect(mockWriteDocument).toHaveBeenCalledWith(
      testContext.config.dynamoDbTableEventBlock,
      {
        EventName: task,
        BlockNumber: 42,
      }
    );
    expect(mockEventCursor).toHaveBeenCalledTimes(1);
    expect(mockEventCursorNext).toHaveBeenCalledTimes(3);
  });

  it('Should successfully handle initial case of no existing blocks', async () => {
    mockReadDocument.mockResolvedValue(undefined);

    const func = async () => handleCredentialIssuedLoggingEvent(testContext);

    await expect(func()).resolves.toEqual(undefined);

    expect(mockPullAddedCredentialMetadataEvents).toHaveBeenCalledWith(0);
  });

  it('Should still update block when there are no events to process', async () => {
    mockEventCursor.mockImplementation(() => {
      return {
        [Symbol.asyncIterator]: () => {
          return {
            next: mockEventCursorNext
              .mockImplementationOnce(async () => {
                return { value: [] };
              })
              .mockImplementationOnce(async () => {
                return { value: [] };
              })
              .mockImplementationOnce(async () => {
                return { done: true };
              }),
          };
        },
      };
    });

    const func = async () => handleCredentialIssuedLoggingEvent(testContext);

    await expect(func()).resolves.toEqual(undefined);

    expect(mockWriteDocument).toHaveBeenCalledTimes(1);
    expect(mockWriteDocument).toHaveBeenCalledWith(
      testContext.config.dynamoDbTableEventBlock,
      {
        EventName: task,
        BlockNumber: 42,
      }
    );
  });
});
