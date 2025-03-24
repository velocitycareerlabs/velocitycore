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

const path = require('path');

const {
  injectEnv,
  bulkWriteInSession,
  bulkMigrateAtomic,
  buildWrites,
} = require('../src');

describe('migrations test suite', () => {
  describe('environment injection test suite', () => {
    const migrationEnv = 'mock';
    beforeEach(() => {
      delete process.env.SECRET_FOO;
      delete process.env.FOO;
    });
    it('should read the proper environment', () => {
      const p0 = path.join(__dirname, '..', 'test', 'data');
      injectEnv({ migrationEnv, envDirPath: p0 });
      expect(process.env.FOO).toEqual('bar');
      expect(process.env.SECRET_FOO).toEqual('password');
    });
    it('should read env file when secret file is missing', () => {
      const p0 = path.join(__dirname, '..', 'test', 'data');
      injectEnv({ migrationEnv, envDirPath: path.join(p0, 'missing-env-dir') });
      expect(process.env.FOO).toBeUndefined();
      expect(process.env.SECRET_FOO).toEqual('password');
    });
    it('should error when the secret env file is not loaded successfully', () => {
      const p0 = path.join(__dirname, '..', 'test', 'data');
      injectEnv({
        migrationEnv,
        envDirPath: path.join(p0, 'missing-secret-env-dir'),
      });
      expect(process.env.FOO).toEqual('bar');
      expect(process.env.SECRET_FOO).toBeUndefined();
    });
  });

  describe('bulkWriteInSession test suite', () => {
    const mockBulkWriteFunc = jest.fn();
    const mockCollectionFunc = jest
      .fn()
      .mockImplementation(() => ({ bulkWrite: mockBulkWriteFunc }));
    const mockDb = {
      collection: mockCollectionFunc,
    };
    const mockSession = 'fooSession';
    const mockLog = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should not do a bulkWrite if writes are empty', async () => {
      await bulkWriteInSession(
        'fooCollection',
        [],
        mockDb,
        mockSession,
        mockLog
      );
      expect(mockCollectionFunc.mock.calls).toEqual([]);
      expect(mockBulkWriteFunc.mock.calls).toEqual([]);
      expect(mockLog.mock.calls).toEqual([[expect.any(String)]]);
    });

    it('should do a bulkWrite if writes are non-empty', async () => {
      await bulkWriteInSession(
        'fooCollection',
        ['fooWrite'],
        mockDb,
        mockSession,
        mockLog
      );
      expect(mockCollectionFunc.mock.calls).toEqual([['fooCollection']]);
      expect(mockBulkWriteFunc.mock.calls).toEqual([
        [['fooWrite'], { session: 'fooSession' }],
      ]);

      expect(mockLog.mock.calls).toEqual([[expect.any(String)]]);
    });
  });

  describe('bulkMigrateAtomic test suite', () => {
    const mockWithTransactionFunc = jest
      .fn()
      .mockImplementation(async (func) => {
        return func();
      });
    const mockEndSessionFunc = jest.fn().mockResolvedValue(undefined);
    const mockSession = {
      id: 'fooSession',
      withTransaction: mockWithTransactionFunc,
      endSession: mockEndSessionFunc,
    };
    const mockStartSessionFunc = jest.fn().mockReturnValue(mockSession);
    const mockBulkWriteFunc = jest.fn();
    const mockCollectionFunc = jest
      .fn()
      .mockImplementation(() => ({ bulkWrite: mockBulkWriteFunc }));
    const mockDb = {
      collection: mockCollectionFunc,
    };
    const mockClient = {
      startSession: mockStartSessionFunc,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('inject the session into the migration func', async () => {
      const mockFunc = jest.fn();
      await bulkMigrateAtomic(mockFunc, mockDb, mockClient);
      expect(mockStartSessionFunc.mock.calls).toEqual([[]]);
      expect(mockWithTransactionFunc.mock.calls).toEqual([
        [expect.any(Function), expect.any(Object)],
      ]);
      expect(mockFunc.mock.calls).toEqual([
        [
          {
            id: 'fooSession',
            withTransaction: expect.any(Function),
            endSession: expect.any(Function),
          },
        ],
      ]);
      expect(mockEndSessionFunc.mock.calls).toEqual([[]]);
    });

    it('should end session even if there is error', async () => {
      await expect(
        bulkMigrateAtomic(
          () => {
            throw new Error('mock error');
          },
          mockDb,
          mockClient
        )
      ).rejects.toThrow('mock error');
      expect(mockStartSessionFunc.mock.calls).toEqual([[]]);
      expect(mockWithTransactionFunc.mock.calls).toEqual([
        [expect.any(Function), expect.any(Object)],
      ]);
      expect(mockCollectionFunc.mock.calls).toEqual([]);
      expect(mockBulkWriteFunc.mock.calls).toEqual([]);
      expect(mockEndSessionFunc.mock.calls).toEqual([[]]);
    });
  });

  describe('buildWrites test suite', () => {
    const mockRewind = jest.fn();
    const mockCursorNext = jest
      .fn()
      .mockImplementationOnce(async () => {
        return { value: { _id: 1, foo: 1 } };
      })
      .mockImplementationOnce(async () => {
        return { value: { _id: 2, foo: 2 } };
      })
      .mockImplementationOnce(async () => {
        return { value: { _id: 3, foo: 3 } };
      })
      .mockImplementationOnce(async () => {
        return { done: true };
      });

    const mockCursor = {
      [Symbol.asyncIterator]: () => {
        return {
          next: mockCursorNext,
        };
      },
      rewind: mockRewind,
    };

    const mockCollection = {
      find: jest.fn().mockImplementation(() => ({
        project: jest.fn().mockResolvedValue(mockCursor),
      })),
    };
    const mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };
    const mockBuildFunc = jest.fn().mockImplementation(async (doc) => {
      if (doc.foo === 2) {
        return undefined;
      }
      return { updateOne: { bar: doc.foo } };
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should build writes and ignore undefined writes', async () => {
      const writes = await buildWrites(
        'fooCollection',
        {},
        { _id: 1, clientId: 1 },
        mockBuildFunc,
        mockDb
      );
      expect(writes).toEqual([
        { updateOne: { bar: 1 } },
        { updateOne: { bar: 3 } },
      ]);
      expect(mockDb.collection.mock.calls).toEqual([['fooCollection']]);
      expect(mockBuildFunc.mock.calls).toEqual([
        [{ _id: 1, foo: 1 }],
        [{ _id: 2, foo: 2 }],
        [{ _id: 3, foo: 3 }],
      ]);
      expect(mockRewind.mock.calls).toEqual([[]]);
      expect(mockCursorNext.mock.calls).toEqual([[], [], [], []]);
      expect(mockCollection.find.mock.calls).toEqual([[{}]]);
    });
  });
});
