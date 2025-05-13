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
const { beforeEach, describe, it, mock } = require('node:test');
const { expect } = require('expect');

const mockReadDocument = mock.fn();
const mockWriteDocument = mock.fn();
const mockLogInfo = mock.fn();
const eventsWrapper = { events: [] };

const mockEventCursor = mock.fn(() => ({
  [Symbol.asyncIterator]() {
    return {
      index: -1,
      next() {
        this.index += 1;
        return eventsWrapper.events[this.index];
      },
    };
  },
}));
const mockInitVerificationCoupon = mock.fn(() => ({
  pullBurnCouponEvents: () =>
    Promise.resolve({ eventsCursor: mockEventCursor, latestBlock: 42 }),
}));

mock.module('@velocitycareerlabs/aws-clients', {
  namedExports: {
    initReadDocument: () => mockReadDocument,
    initWriteDocument: () => mockWriteDocument,
  },
});

mock.module('@velocitycareerlabs/metadata-registration', {
  namedExports: {
    initVerificationCoupon: mockInitVerificationCoupon,
  },
});

const { burnEventsArray } = require('./data/sample-burn-events-array');
const { handleCouponsBurnedLoggingEvent } = require('../src/handlers');

describe('Coupons burned event logging task test suite', () => {
  const task = 'coupons-burned-logging';
  const testContext = {
    config: {
      couponContractAddress: 'TESTS',
      rpcUrl: 'TESTS',
    },
    log: {
      info: mockLogInfo,
    },
  };

  beforeEach(() => {
    eventsWrapper.events = [
      { value: [] },
      { value: burnEventsArray },
      { done: true },
    ];
    mockInitVerificationCoupon.mock.resetCalls();
    mockReadDocument.mock.resetCalls();
    mockWriteDocument.mock.resetCalls();
    mockLogInfo.mock.resetCalls();
    mockEventCursor.mock.resetCalls();
  });

  it('Should successfully write log entries for a given set of events read off the blockchain', async () => {
    mockReadDocument.mock.mockImplementationOnce(() =>
      Promise.resolve({
        Item: {
          EventName: task,
          BlockNumber: 1,
        },
      })
    );

    await handleCouponsBurnedLoggingEvent(testContext);
    expect(mockInitVerificationCoupon.mock.callCount()).toEqual(1);

    expect(mockReadDocument.mock.callCount()).toEqual(1);
    expect(
      mockReadDocument.mock.calls.map((call) => call.arguments)
    ).toContainEqual([
      testContext.config.dynamoDbTableEventBlock,
      { EventName: task },
    ]);

    expect(mockLogInfo.mock.callCount()).toEqual(10);
    expect(mockLogInfo.mock.calls[7].arguments[0]).toEqual({
      blockNumber: expect.any(Number),
      blockHash: expect.any(String),
      transactionHash: expect.any(String),
      transactionIndex: expect.any(Number),
      event: 'BurnCoupon',
      owner: expect.any(String),
      bundleId: expect.any(String),
      bundleIdHex: expect.any(String),
      eventTraceId: 'trackingId',
      caoDid: expect.any(String),
      burnerDid: expect.any(String),
      balance: 3,
      expirationTime: expect.any(Date),
      burnTime: expect.any(Date),
    });

    expect(mockWriteDocument.mock.callCount()).toEqual(1);
    expect(
      mockWriteDocument.mock.calls.map((call) => call.arguments)
    ).toContainEqual([
      testContext.config.dynamoDbTableEventBlock,
      {
        EventName: task,
        BlockNumber: 42,
      },
    ]);
    expect(mockEventCursor.mock.callCount()).toEqual(1);
  });

  it('Should successfully handle initial case of no existing blocks', async () => {
    mockReadDocument.mock.mockImplementationOnce(() =>
      Promise.resolve(undefined)
    );

    const func = async () => handleCouponsBurnedLoggingEvent(testContext);

    await expect(func()).resolves.toEqual(undefined);
  });

  it('Should still update block when there are no events to process', async () => {
    eventsWrapper.events = [{ value: [] }, { value: [] }, { done: true }];

    const func = async () => handleCouponsBurnedLoggingEvent(testContext);

    await expect(func()).resolves.toEqual(undefined);

    expect(mockWriteDocument.mock.callCount()).toEqual(1);
    expect(
      mockWriteDocument.mock.calls.map((call) => call.arguments)
    ).toContainEqual([
      testContext.config.dynamoDbTableEventBlock,
      {
        EventName: task,
        BlockNumber: 42,
      },
    ]);
    expect(mockEventCursor.mock.callCount()).toEqual(1);
    expect(mockLogInfo.mock.callCount()).toEqual(4);
  });
});
