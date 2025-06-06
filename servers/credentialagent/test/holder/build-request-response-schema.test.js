/*
 * Copyright 2024 Velocity Team
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

const { buildRequestResponseSchema } = require('../../src/entities');

describe('build request response schema test suite', () => {
  it('should build default schema if isProd true', async () => {
    const schemaObject = buildRequestResponseSchema('presentation', {
      isProd: true,
    });
    expect(schemaObject).toEqual({
      type: 'object',
      properties: { presentation_request: { type: 'string' } },
      required: ['presentation_request'],
    });
  });
  it('should build for dev env schemas if isProd false', async () => {
    const schemaObject = buildRequestResponseSchema('presentation', {
      isProd: false,
    });
    expect(schemaObject).toEqual({
      oneOf: [
        {
          type: 'object',
          properties: { presentation_request: { type: 'string' } },
          required: ['presentation_request'],
        },
        {
          type: 'object',
          properties: {
            presentation_request: {
              type: 'object',
              additionalProperties: true,
            },
          },
          required: ['presentation_request'],
        },
      ],
    });
  });
});
