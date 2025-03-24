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

const { keys, reduce, isEmpty } = require('lodash/fp');
const dotenv = require('dotenv');

const injectEnv = ({ envDirPath, migrationEnv }) => {
  const logger = console;
  const envPath = `${envDirPath}/${migrationEnv}.env`;
  const secretEnvPath = `${envDirPath}/${migrationEnv}.secrets.env`;
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    logger.warn(result.error);
  }
  if (result.parsed) {
    logger.info(`[${migrationEnv}] Injected environment variables:`);
    logger.info(result.parsed);
  }

  const secretResult = dotenv.config({ path: secretEnvPath });
  if (secretResult.error) {
    logger.warn(secretResult.error);
  }
  if (secretResult.parsed) {
    logger.info(`[${migrationEnv}] Injected secret environment variables:`);
    logger.info(
      reduce(
        (hash, key) => {
          return {
            ...hash,
            [key]: '****',
          };
        },
        {},
        keys(secretResult.parsed)
      )
    );
  }
};

const bulkWriteInSession = async (collectionName, writes, db, session, log) => {
  if (isEmpty(writes)) {
    log(`No writes for ${collectionName} collection`);
    return;
  }
  const bulkResult = await db.collection(collectionName).bulkWrite(writes, {
    session,
  });
  log(collectionName, bulkResult);
};

const bulkMigrateAtomic = async (func, db, client) => {
  const session = client.startSession();
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
  };

  try {
    await session.withTransaction(async () => {
      await func(session);
    }, transactionOptions);
  } finally {
    await session.endSession();
  }
};

const buildWrites = async (
  collectionName,
  filter,
  projection,
  buildFunc,
  db
) => {
  const collection = db.collection(collectionName);
  const cursor = await collection.find(filter).project(projection);
  return buildUpdatesFromCursor(buildFunc, cursor);
};

const buildUpdatesFromCursor = async (buildFunc, cursor) => {
  const writes = [];
  for await (const doc of cursor) {
    const write = await buildFunc(doc);
    if (write != null) {
      writes.push(write);
    }
  }
  await cursor.rewind();
  return writes;
};

module.exports = {
  injectEnv,
  bulkWriteInSession,
  bulkMigrateAtomic,
  buildWrites,
};
