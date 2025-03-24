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

const fp = require('fastify-plugin');
const newError = require('http-errors');

const {
  addFeedSchema,
  modifyFeedSchema,
  feedSchema,
  modifyFeedUpdateBodySchema,
} = require('./schemas');

const assertDisclosureFeedPlugin = (fastify, options, next) => {
  fastify.addHook('preHandler', async (req) => {
    if (req.disclosure?.feed !== true) {
      throw newError(400, 'Disclosure feed must be true', {
        errorCode: 'disclosure_feed_not_true',
      });
    }
  });
  next();
};

module.exports = async (fastify) =>
  fastify
    .register(fp(assertDisclosureFeedPlugin))
    .addSchema(modifyFeedSchema)
    .addSchema(feedSchema)
    .addSchema(modifyFeedUpdateBodySchema)
    .addSchema(addFeedSchema)
    .autoSchemaPreset({ tags: ['feeds'] });
