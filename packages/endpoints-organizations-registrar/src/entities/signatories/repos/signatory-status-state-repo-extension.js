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

const { map } = require('lodash/fp');

const signatoryStatusStateRepoExtension = (parent) => ({
  insertWithState: ({ states, authCode, ...val }, ...args) => {
    const timestamp = new Date();
    return parent.insert(
      {
        events: [...map((state) => ({ state, timestamp }), states)],
        authCodes: [{ code: authCode, timestamp }],
        ...val,
      },
      ...args
    );
  },
  addState: async (
    did,
    state,
    $set,
    projection = parent.defaultColumnsSelection
  ) => {
    let updateStatement = {
      $push: { events: { state, timestamp: new Date() } },
    };
    if ($set) {
      updateStatement = {
        ...updateStatement,
        $set: parent.prepModification($set),
      };
    }
    const result = await parent
      .collection()
      .findOneAndUpdate(
        parent.prepFilter({ organizationDid: did }),
        updateStatement,
        {
          returnDocument: 'after',
          includeResultMetadata: true,
          projection,
        }
      );
    return result.value;
  },
  addStateAndCode: async (
    did,
    state,
    authCode,
    projection = parent.defaultColumnsSelection
  ) => {
    const timestamp = new Date();
    const result = await parent.collection().findOneAndUpdate(
      parent.prepFilter({ organizationDid: did }),
      {
        $push: {
          events: { state, timestamp },
          authCodes: { code: authCode, timestamp },
        },
      },
      {
        returnDocument: 'after',
        includeResultMetadata: true,
        projection,
      }
    );
    return result.value;
  },
  extensions: parent.extensions.concat(['signatoryStatusStateRepoExtension']),
});

module.exports = { signatoryStatusStateRepoExtension };
