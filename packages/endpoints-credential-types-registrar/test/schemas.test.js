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

const { omit } = require('lodash/fp');
const { mongoDb } = require('@spencejs/spence-mongo-repos');
const nock = require('nock');
const { errorResponseMatcher } = require('@velocitycareerlabs/tests-helpers');
const buildFastify = require('./helpers/build-fastify');
const courseExample = require('./data/course.example.json');
const initCredentialSchemasRepo = require('./factories/credential-schema-factory');

describe('Schema Management', () => {
  let fastify;
  let persistCredentialSchema;

  beforeAll(async () => {
    fastify = buildFastify();
    await fastify.ready();
    ({ persistCredentialSchema } = initCredentialSchemasRepo(fastify));
  });

  beforeEach(async () => {
    await mongoDb().collection('credentialSchemas').deleteMany({});
    nock.cleanAll();
  });

  afterAll(async () => {
    await mongoDb().collection('credentialSchemas').deleteMany({});
    await fastify.close();
    nock.cleanAll();
    nock.restore();
  });

  describe('Schema URL Retrieval', () => {
    beforeEach(async () => {
      await mongoDb().collection('credentialSchemas').deleteMany({});
      await persistCredentialSchema({
        schemaUrl: 'https://example.com/schema.json',
        displayDescriptorUrls: {
          en: 'https://example.com/display.json',
        },
        formSchemaUrls: {
          en: 'https://example.com/form.json',
        },
      });
      await persistCredentialSchema({
        schemaName: 'course',
        credentialType: 'Course',
        schemaUrl: 'https://example.com/course.schema.json',
        displayDescriptorUrls: {
          en: 'https://example.com/course.schema.json',
        },
        formSchemaUrls: {
          en: 'https://example.com/course.schema.json',
        },
      });
      await persistCredentialSchema({
        schemaName: 'education-db',
        credentialType: 'EducationDb',
        schemaUrl: 'https://example.com/education-db.schema.json',
        displayDescriptorUrls: {
          en: 'https://example.com/education-db.schema.json',
        },
        formSchemaUrls: {
          en: 'https://example.com/education-db.schema.json',
        },
      });
    });

    it('should allow schema url to be retrieved by one schema', async () => {
      const response = await fastify.injectJson({
        method: 'GET',
        url: '/schemas/get-uri?credentialTypes=EducationDegreeGraduationV1.0',
      });

      expect(response.statusCode).toEqual(200);
      responseHeadersExpectation(response);
      expect(response.json).toEqual({
        schemaFileNames: [
          {
            id: 'https://example.com/schema.json',
            credentialType: 'EducationDegreeGraduationV1.0',
          },
        ],
      });
    });

    it('should allow schema url to be retrieved for an in db schema', async () => {
      const response = await fastify.injectJson({
        method: 'GET',
        url: '/schemas/get-uri?credentialTypes=EducationDb',
      });

      expect(response.statusCode).toEqual(200);
      responseHeadersExpectation(response);
      expect(response.json).toEqual({
        schemaFileNames: [
          {
            id: 'https://example.com/education-db.schema.json',
            credentialType: 'EducationDb',
          },
        ],
      });
    });

    it('should allow schema url to be retrieved by 2 schemas', async () => {
      const response = await fastify.injectJson({
        method: 'GET',
        url: '/schemas/get-uri?credentialTypes=EducationDegreeGraduationV1.0&credentialTypes=Course',
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json).toEqual({
        schemaFileNames: expect.arrayContaining([
          {
            id: 'https://example.com/course.schema.json',
            credentialType: 'Course',
          },
          {
            id: 'https://example.com/schema.json',
            credentialType: 'EducationDegreeGraduationV1.0',
          },
        ]),
      });
    });

    it('should respond with empty array if schema not found', async () => {
      const response = await fastify.injectJson({
        method: 'GET',
        url: '/schemas/get-uri?credentialTypes=Phone&credentialTypes=',
      });

      expect(response.statusCode).toEqual(200);
      responseHeadersExpectation(response);
      expect(response.json).toEqual({
        schemaFileNames: [],
      });
    });
  });

  describe('Schema Retrieval', () => {
    it('should respond 404 if credential unknown and return suggestion', async () => {
      await persistCredentialSchema({
        schemaName: 'course',
        credentialType: 'Course',
        schemaUrl: 'https://example.com/course.schema.json',
        displayDescriptorUrls: {
          en: 'https://example.com/course.schema.json',
        },
        formSchemaUrls: {
          en: 'https://example.com/course.schema.json',
        },
      });

      const response = await fastify.injectJson({
        method: 'GET',
        url: '/api/v0.6/schemas/courses',
      });

      expect(response.statusCode).toEqual(404);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Not Found',
          errorCode: 'missing_error_code',
          message: "Schema courses not found. Did you mean 'course'?",
          statusCode: 404,
        })
      );
    });

    it('should allow schemas be retrieved', async () => {
      const json = require('../../../apps/libapp/schemas/education-degree-graduation-v1.0.schema.json');
      await persistCredentialSchema({
        schemaUrl: 'https://example.com/schema.json',
        displayDescriptorUrls: {
          en: 'https://example.com/display.json',
        },
        formSchemaUrls: {
          en: 'https://example.com/form.json',
        },
      });
      const fetchNock = nock('https://example.com')
        .get('/schema.json')
        .times(1)
        .reply(200, json);
      const response = await fastify.injectJson({
        method: 'GET',
        url: '/schemas/education-degree-graduation-v1.0',
      });
      expect(response.statusCode).toEqual(200);
      responseHeadersExpectation(response);
      expect(response.headers).toMatchObject({
        'content-type': 'application/json; charset=UTF-8',
      });
      expect(response.json).toEqual(json);
      expect(fetchNock.isDone()).toBe(true);
    });

    it('should allow schemas be retrieved when schema name is fully kebab-cased', async () => {
      const json = require('../../../apps/libapp/schemas/education-degree-graduation-v1.0.schema.json');
      await persistCredentialSchema({
        schemaUrl: 'https://example.com/schema.json',
        displayDescriptorUrls: {
          en: 'https://example.com/display.json',
        },
        formSchemaUrls: {
          en: 'https://example.com/form.json',
        },
      });
      const fetchNock = nock('https://example.com')
        .get('/schema.json')
        .times(1)
        .reply(200, json);
      const response = await fastify.injectJson({
        method: 'GET',
        url: '/schemas/education-degree-graduation-v-1-0',
      });

      expect(response.statusCode).toEqual(200);
      responseHeadersExpectation(response);
      expect(response.headers).toMatchObject({
        'content-type': 'application/json; charset=UTF-8',
      });
      expect(response.json).toEqual(json);
      expect(fetchNock.isDone()).toBe(true);
    });

    it('should allow schemas be retrieved on the old url', async () => {
      const json = require('../../../apps/libapp/schemas/education-degree-graduation-v1.0.schema.json');
      await persistCredentialSchema({
        schemaUrl: 'https://example.com/schema.json',
        displayDescriptorUrls: {
          en: 'https://example.com/display.json',
        },
        formSchemaUrls: {
          en: 'https://example.com/form.json',
        },
      });
      const fetchNock = nock('https://example.com')
        .get('/schema.json')
        .times(1)
        .reply(200, json);
      const response = await fastify.injectJson({
        method: 'GET',
        url: '/api/v0.6/schemas/education-degree-graduation-v1.0.schema.json',
      });

      expect(response.statusCode).toEqual(200);
      responseHeadersExpectation(response);
      expect(response.headers).toMatchObject({
        'content-type': 'application/json; charset=UTF-8',
      });
      expect(response.json).toEqual(json);
      expect(fetchNock.isDone()).toBe(true);
    });
  });

  describe('Schema validation', () => {
    it('should respond 200 if valid', async () => {
      await persistCredentialSchema({
        schemaName: 'course',
        credentialType: 'Course',
        schemaUrl: 'https://example.com/course.schema.json',
        displayDescriptorUrls: {
          en: 'https://example.com/course.descriptor.json',
        },
        formSchemaUrls: {
          en: 'https://example.com/couse.form-schema.json',
        },
      });
      const fetchNock = nock('https://example.com')
        .get('/course.schema.json')
        .times(1)
        .reply(200, require('../../../apps/libapp/schemas/course.schema.json'));

      const response = await fastify.injectJson({
        method: 'POST',
        url: '/api/v0.6/schemas/course/validate',
        payload: {
          vendorUserId: 'foo',
          ...courseExample,
        },
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json).toEqual({ valid: true });
      expect(fetchNock.isDone()).toBe(true);
    });
    it('should respond 200 and form schema for validation by uri', async () => {
      await persistCredentialSchema({
        schemaName: 'course1',
        credentialType: 'Course1',
        schemaUrl: 'https://example.com/course1.schema.json',
        displayDescriptorUrls: {
          en: 'https://example.com/course1.descriptor.json',
        },
        formSchemaUrls: {
          en: 'https://example.com/couse1.form-schema.json',
        },
      });
      const fetchNock = nock('https://example.com')
        .get('/course1.schema.json')
        .times(1)
        .reply(200, {
          ...omit(
            ['$id'],
            require('../../../apps/libapp/schemas/course.schema.json')
          ),
          $id: 'https://velocitynetwork.foundation/schemas/course1',
        });

      const response = await fastify.injectJson({
        method: 'POST',
        url: '/api/v0.6/schemas/course1/validate',
        payload: {
          vendorUserId: 'foo',
          ...courseExample,
        },
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json).toEqual({ valid: true });
      expect(fetchNock.isDone()).toBe(true);
    });
    it('should respond 200 if region code has format of ISO 3166-2', async () => {
      const licenseSchema = require('../../../apps/libapp/schemas/license.schema.json');
      licenseSchema.$id = 'license';
      await persistCredentialSchema({
        schemaName: 'license',
        credentialType: 'License',
        schemaUrl: 'https://example.com/license.schema.json',
        displayDescriptorUrls: {
          en: 'https://example.com/license.descriptor.json',
        },
        formSchemaUrls: {
          en: 'https://example.com/license.form-schema.json',
        },
      });
      const schemaValue = {
        '@context':
          'https://velocitynetwork.foundation/contexts/certification-license',
        authority: {
          name: 'New Jersey Board of Nursing',
          did: 'did:velocity:0xc257274276a4e539741ca11b590b9447b26a8052',
          place: {
            addressLocality: 'Newark',
            addressRegion: 'US-NJ',
            addressCountry: 'US',
          },
        },
        name: 'Licensed Practical Nurse',
        description:
          // eslint-disable-next-line max-len
          'As an assistant to physicians and registered nurses (RNs), a licensed practical nurse (LPN) takes care of basic nursing duties in settings such as hospitals, nursing homes, and long-term care facilities.  To acquiire the license the applicant must sit for the NCLEX-LPN exam.',
        identifier: '7765430',
        validity: {
          firstValidFrom: '2018-07-01',
          validFrom: '2020-07-01',
          validUntil: '2022-07-01',
          validIn: {
            addressRegion: 'US-NJ',
            addressCountry: 'US',
          },
        },
      };
      const fetchNock = nock('https://example.com')
        .get('/license.schema.json')
        .times(1)
        .reply(200, licenseSchema);
      const response = await fastify.injectJson({
        method: 'POST',
        url: '/schemas/license/validate',
        payload: schemaValue,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json).toEqual({ valid: true });
      expect(fetchNock.isDone()).toBe(true);
    });
    it('should respond 400 if region code has not format of ISO 3166-2', async () => {
      const licenseSchema = require('../../../apps/libapp/schemas/license.schema.json');
      licenseSchema.$id = 'license';
      await persistCredentialSchema({
        schemaName: 'license',
        credentialType: 'license',
        schemaUrl: 'https://example.com/license.schema.json',
        displayDescriptorUrls: {
          en: 'https://example.com/license.descriptor.json',
        },
        formSchemaUrls: {
          en: 'https://example.com/license.form-schema.json',
        },
      });
      const fetchNock = nock('https://example.com')
        .get('/license.schema.json')
        .times(1)
        .reply(200, licenseSchema);
      const schemaValue = {
        '@context':
          'https://velocitynetwork.foundation/contexts/certification-license',
        authority: {
          name: 'New Jersey Board of Nursing',
          did: 'did:velocity:0xc257274276a4e539741ca11b590b9447b26a8052',
          place: {
            addressLocality: 'Newark',
            addressRegion: 'USA-NJWA',
            addressCountry: 'US',
          },
        },
        name: 'Licensed Practical Nurse',
        description:
          // eslint-disable-next-line max-len
          'As an assistant to physicians and registered nurses (RNs), a licensed practical nurse (LPN) takes care of basic nursing duties in settings such as hospitals, nursing homes, and long-term care facilities.  To acquiire the license the applicant must sit for the NCLEX-LPN exam.',
        identifier: '7765430',
        validity: {
          firstValidFrom: '2018-07-01',
          validFrom: '2020-07-01',
          validUntil: '2022-07-01',
          validIn: {
            addressRegion: 'USA-NJWA',
            addressCountry: 'US',
          },
        },
      };

      const response = await fastify.injectJson({
        method: 'POST',
        url: '/schemas/license/validate',
        payload: schemaValue,
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual({
        valid: false,
        errors: [
          '/authority/place/addressRegion must match pattern "^[A-Z]{2}(-[A-Z0-9]{1,3})?$"',
          '/validity/validIn/addressRegion must match pattern "^[A-Z]{2}(-[A-Z0-9]{1,3})?$"',
        ],
      });
      expect(fetchNock.isDone()).toBe(false);
    });
    it('should respond 400 if invalid', async () => {
      await persistCredentialSchema({
        schemaName: 'course',
        credentialType: 'course',
        schemaUrl: 'https://example.com/course.schema.json',
        displayDescriptorUrls: {
          en: 'https://example.com/course.descriptor.json',
        },
        formSchemaUrls: {
          en: 'https://example.com/couse.form-schema.json',
        },
      });
      const fetchNock = nock('https://example.com')
        .get('/course.schema.json')
        .times(1)
        .reply(200, require('../../../apps/libapp/schemas/course.schema.json'));

      const response = await fastify.injectJson({
        method: 'POST',
        url: '/api/v0.6/schemas/course/validate',
        payload: {
          alignment: [{ something: '' }],
          ...omit(['title'], courseExample),
        },
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual({
        valid: false,
        errors: [
          "must have required property 'title'",
          "/alignment/0 must have required property 'targetName'",
          "/alignment/0 must have required property 'targetUrl'",
          '/alignment/0 must NOT have additional properties',
        ],
      });
      expect(fetchNock.isDone()).toBe(false);
    });
    it('should respond 404 if credential type that is unknown and return suggestion', async () => {
      await persistCredentialSchema({
        schemaName: 'course',
        credentialType: 'Course',
      });
      const response = await fastify.injectJson({
        method: 'POST',
        url: '/api/v0.6/schemas/courses/validate',
        payload: courseExample,
      });

      expect(response.statusCode).toEqual(404);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Not Found',
          errorCode: 'missing_error_code',
          message: "Schema courses not found. Did you mean 'course'?",
          statusCode: 404,
        })
      );
    });
  });

  const responseHeadersExpectation = (response) => {
    expect(response.headers['cache-control']).toEqual(
      'public,max-age=31536000,immutable'
    );
  };
});
