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

const nock = require('nock');
const buildFastify = require('./helpers/credentialagent-build-fastify');

describe('root controller test', () => {
  let fastify;

  beforeAll(async () => {
    fastify = buildFastify();
    await fastify.ready();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    await fastify.close();
    nock.cleanAll();
    nock.restore();
  });

  it('should ping', async () => {
    const response = await fastify.injectJson({ method: 'GET', url: '/' });
    expect(response.statusCode).toEqual(200);
  });
});
