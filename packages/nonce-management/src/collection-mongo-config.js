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

const newError = require('http-errors');
const { NonceCollectionErrors } = require('./constants');

const incrementNonceExtension = (parent, { tenant }) => {
  const incrementNonce = async (address) => {
    // atomically increment the nonce
    const { value } = await parent.collection().findOneAndUpdate(
      { _id: address },
      {
        $inc: { nonce: 1 }, // set nonce to be the next value to be used
        $set: { updatedAt: new Date() },
      },
      {
        projection: totalProjection,
        returnDocument: 'before',
        includeResultMetadata: true,
      }
    );

    if (value == null) {
      throw newError.InternalServerError(NonceCollectionErrors.NONCE_NOT_FOUND);
    }

    // migrate nonces without tenantId's set
    if (value.tenantId == null && tenant?._id != null) {
      await parent
        .collection()
        .findOneAndUpdate(
          { _id: address },
          { $set: { tenantId: tenant._id, updatedAt: new Date() } }
        );
    }

    return value.nonce;
  };

  return {
    incrementNonce,
    extensions: parent.extensions.concat(['incrementNonce']),
  };
};

const defaultProjection = {
  _id: 1,
  nonce: 1,
};

const totalProjection = {
  _id: 1,
  nonce: 1,
  tenantId: 1,
  createdAt: 1,
  updatedAt: 1,
};

module.exports = {
  defaultMongoCollectionConfig: {
    name: 'walletNonces',
    entityName: 'walletNonce',
    defaultProjection,
    extensions: [incrementNonceExtension],
  },
  defaultProjection,
  totalProjection,
};
