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

const mockSendError = jest.fn().mockReturnValue(undefined);
const mockInitSendError = jest.fn().mockReturnValue({
  sendError: mockSendError,
  startProfiling: () => {
    console.log('fake start sentry profiling');
  },
  finishProfiling: () => {
    console.log('fake finish sentry profiling');
  },
});

/* eslint-disable max-len */
require('auth0');

const { ObjectId } = require('mongodb');
const { mongoDb } = require('@spencejs/spence-mongo-repos');
const { omit } = require('lodash/fp');
const { ServiceTypes } = require('@velocitycareerlabs/organizations-registry');
const { nanoid } = require('nanoid');
const {
  mongoify,
  DEFAULT_GROUP_ID,
  testRegistrarUser,
  testRegistrarSuperUser,
  errorResponseMatcher,
} = require('@velocitycareerlabs/tests-helpers');
const console = require('console');
const buildFastify = require('./helpers/build-fastify');
const { expectedInvitationSentEmail } = require('./helpers/email-matchers');
const initGroupsFactory = require('../src/entities/groups/factories/groups-factory');
const initOrganizationFactory = require('../src/entities/organizations/factories/organizations-factory');
const initInvitationsFactory = require('../src/entities/invitations/factories/invitations-factory');
const initCredentialSchemaFactory = require('../../endpoints-credential-types-registrar/test/factories/credential-schema-factory');
const { invitationsRepoPlugin } = require('../src/entities/invitations');

const mockAuth0UserCreate = jest.fn().mockImplementation(async (obj) => {
  return { user_id: 'user_id_123', ...obj };
});

const mockAuth0UserGetByEmail = jest.fn().mockImplementation(async () => {
  return [];
});

const mockAuth0TicketChange = jest.fn().mockImplementation(async () => {
  return {
    ticket: undefined,
  };
});

const mockAuth0ClientAssignRole = jest.fn().mockImplementation(async (obj) => {
  return { id: nanoid(), ...obj };
});

jest.mock('auth0', () => ({
  ManagementClient: jest.fn().mockImplementation(() => ({
    users: {
      create: mockAuth0UserCreate,
      getByEmail: mockAuth0UserGetByEmail,
      assignRoles: mockAuth0ClientAssignRole,
    },
    tickets: { changePassword: mockAuth0TicketChange },
  })),
}));

const mockSendEmail = jest.fn((payload) => payload);

jest.mock('@aws-sdk/client-ses', () => ({
  SendEmailCommand: jest.fn((args) => args),
  SESClient: jest.fn().mockImplementation(() => ({
    send: mockSendEmail,
  })),
}));

jest.mock('@velocitycareerlabs/error-aggregation', () => {
  const originalModule = jest.requireActual(
    '@velocitycareerlabs/error-aggregation'
  );
  return {
    ...originalModule,
    initSendError: mockInitSendError,
  };
});

jest.mock('nanoid/non-secure', () => {
  const originalModule = jest.requireActual('nanoid/non-secure');
  return {
    ...originalModule,
    nanoid: jest.fn().mockReturnValue('mocknano'),
  };
});

const invitationUrl = (did) => `/api/v0.6/organizations/${did}/invitations`;

const mapPayloadToInvitation = (payload, inviter) => ({
  ...payload,
  id: expect.anything(),
  code: expect.any(String),
  createdAt: expect.any(String),
  createdBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
  expiresAt: expect.any(String),
  invitationUrl: expect.any(String),
  inviterDid: inviter.didDoc.id,
  updatedAt: expect.any(String),
  updatedBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
});

const keyIndividuals = {
  adminGivenName: 'A-given-name',
  adminFamilyName: 'A-family-name',
  adminTitle: 'A-title',
  adminEmail: 'admin@email.com',
  signatoryGivenName: 'S-given-name',
  signatoryFamilyName: 'S-family-name',
  signatoryTitle: 'S-title',
  signatoryEmail: 'signatory@email.com',
};

const minKeyIndvidiuals = {
  adminGivenName: 'A-given-name',
  adminFamilyName: 'A-family-name',
  adminEmail: 'admin@email.com',
};

const inviteeProfile = {
  name: 'fooName',
  linkedInProfile: 'https://www.linkedin.com/in/test-profile',
  physicalAddress: {
    line1: '123 Main St',
    line2: 'Suite 123',
    line3: 'New York',
  },
};

describe('Organization invitations test suites', () => {
  let fastify;
  let invitationsRepo;
  let persistOrganization;
  let newOrganization;
  let persistInvitation;
  let persistCredentialSchema;
  let persistGroup;
  let caoOrganization;

  const clearDb = async () => {
    await mongoDb().collection('organizations').deleteMany({});
    await mongoDb().collection('invitations').deleteMany({});
    await mongoDb().collection('groups').deleteMany({});
    await mongoDb().collection('credentialSchemas').deleteMany({});
  };

  beforeAll(async () => {
    fastify = buildFastify();
    await fastify.ready();
    ({ persistOrganization, newOrganization } =
      initOrganizationFactory(fastify));
    ({ persistInvitation } = initInvitationsFactory(fastify));
    ({ persistCredentialSchema } = initCredentialSchemaFactory(fastify));
    ({ persistGroup } = initGroupsFactory(fastify));
    invitationsRepo = invitationsRepoPlugin(fastify)({
      log: fastify.log,
      config: fastify.config,
    });
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDb();
    caoOrganization = await persistOrganization({
      service: [
        {
          id: '#caoid',
          type: ServiceTypes.CredentialAgentOperatorType,
          serviceEndpoint: 'https://www.caoendpoint.com',
        },
      ],
    });
    await persistGroup({
      groupId: DEFAULT_GROUP_ID,
      clientAdminIds: [testRegistrarUser.sub],
      dids: [caoOrganization.didDoc.id],
    });
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('Create Invitation Test Suite', () => {
    it('should return 404 if did does not exist', async () => {
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl('did:test:notfound'),
        payload: {
          inviteeEmail: 'test@email.com',
          inviteeService: [],
          inviteeProfile,
          keyIndividuals,
        },
      });

      expect(response.statusCode).toEqual(404);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Not Found',
          errorCode: 'organization_not_found',
          message: 'Organization not found',
          statusCode: 404,
        })
      );
    });

    it('should return 400 and invitations_not_supported if did does not have a CAO service', async () => {
      const orgWithoutCAO = await persistOrganization();

      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(orgWithoutCAO.didDoc.id),
        payload: {
          inviteeEmail: 'test@email.com',
          inviteeService: [],
          inviteeProfile,
          keyIndividuals,
        },
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'invitations_not_supported',
          message: 'CAO service does not exist',
          statusCode: 400,
        })
      );
    });

    it('should return 400 if keyIndividuals is missing', async () => {
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: {
          inviteeEmail: 'test@email.com',
          inviteeProfile,
          inviteeService: [],
        },
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'request_validation_failed',
          message: "body must have required property 'keyIndividuals'",
          statusCode: 400,
        })
      );
    });

    it('should return 400 if keyIndividuals.adminGivenName is missing', async () => {
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: {
          inviteeEmail: 'test@email.com',
          inviteeProfile,
          inviteeService: [],
          keyIndividuals: omit(['adminFamilyName'], keyIndividuals),
        },
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'request_validation_failed',
          message:
            "body/keyIndividuals must have required property 'adminFamilyName'",
          statusCode: 400,
        })
      );
    });

    it('should return 400 if keyIndividuals.adminEmail is badly formatted', async () => {
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: {
          inviteeEmail: 'test@email.com',
          inviteeProfile,
          inviteeService: [],
          keyIndividuals: { ...minKeyIndvidiuals, adminEmail: 'not-an-email' },
        },
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'request_validation_failed',
          message: 'body/keyIndividuals/adminEmail must match format "email"',
          statusCode: 400,
        })
      );
    });

    it('should return 400 if name is missing', async () => {
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: {
          inviteeEmail: 'test@email.com',
          inviteeService: [],
          inviteeProfile: {},
          keyIndividuals,
        },
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'request_validation_failed',
          message: "body/inviteeProfile must have required property 'name'",
          statusCode: 400,
        })
      );
    });

    it('should return 400 if service type is CAO', async () => {
      const service = {
        id: 'did:123#cao',
        type: 'VlcCredentialAgentOperator_v1',
        serviceEndpoint: 'https://one.com',
      };
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: {
          inviteeEmail: 'test@email.com',
          inviteeService: [service],
          inviteeProfile,
          keyIndividuals,
        },
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'request_validation_failed',
          message:
            'body/inviteeService/0/type must be equal to one of the allowed values',
          statusCode: 400,
        })
      );
    });

    it('should return 400 if service endpoint is invalid', async () => {
      const service = {
        id: 'issuer-1',
        type: 'VlcCareerIssuer_v1',
        serviceEndpoint: 'not-valid',
      };
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: {
          inviteeEmail: 'test@email.com',
          inviteeService: [service],
          inviteeProfile,
          keyIndividuals,
        },
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'service_endpoint_must_be_ref',
          message: 'serviceEndpoint must be a did service reference',
          statusCode: 400,
        })
      );
    });

    it('should return 400 if service credentialTypes is invalid', async () => {
      const service = {
        id: 'issuer-1',
        type: 'VlcCareerIssuer_v1',
        serviceEndpoint: 'did:123:mock#caoid',
        credentialTypes: ['NOT_SUPPORTED'],
      };
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: {
          inviteeEmail: 'test@email.com',
          inviteeService: [service],
          inviteeProfile,
          keyIndividuals,
        },
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'invitee_service_invalid',
          message:
            'Cannot add issuer that issues unsupported credential types NOT_SUPPORTED',
          statusCode: 400,
        })
      );
    });

    it('should return 400 if email is invalid', async () => {
      const service = {
        id: 'issuer-1',
        type: 'VlcCareerIssuer_v1',
        serviceEndpoint: 'did:123:mock#caoid',
      };
      const payload = {
        inviteeEmail: 'email@test.m',
        inviteeService: [service],
        inviteeProfile,
        keyIndividuals,
      };
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: { ...payload, inviteeEmail: '?@gmail.com' },
      });
      const response1 = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload,
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'bad_invitee_email',
          message:
            'The email address is invalid and the invitation was not sent',
          statusCode: 400,
        })
      );

      expect(response1.statusCode).toEqual(400);
      expect(response1.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'bad_invitee_email',
          message:
            'The email address is invalid and the invitation was not sent',
          statusCode: 400,
        })
      );
    });

    it('should return 400 credential type for service is invalid', async () => {
      await persistCredentialSchema();
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: {
          inviteeEmail: 'test@email.com',
          inviteeService: [
            {
              id: 'issuer-1',
              type: ServiceTypes.CareerIssuerType,
              serviceEndpoint: 'did:123:mock#caoid',
              credentialTypes: ['WrongType'],
            },
          ],
          inviteeProfile: {
            ...inviteeProfile,
            name: 'Given',
          },
          keyIndividuals,
        },
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'invitee_service_invalid',
          message:
            'Cannot add issuer that issues unsupported credential types WrongType',
          statusCode: 400,
        })
      );
    });

    describe('Create invitation for Wallet Provider service Test Suite', () => {
      it('Should add organization service type HolderAppProvider', async () => {
        const payload = {
          inviteeEmail: 'test@email.com',
          inviteeService: [
            {
              id: '#holder-1',
              type: ServiceTypes.HolderAppProviderType,
              serviceEndpoint: 'https://example.com',
            },
          ],
          inviteeProfile: {
            ...inviteeProfile,
            name: 'Given',
          },
          keyIndividuals,
        };
        const response = await fastify.injectJson({
          method: 'POST',
          url: invitationUrl(caoOrganization.didDoc.id),
          payload,
        });

        expect(response.statusCode).toEqual(200);
        expect(response.json).toEqual({
          invitation: {
            id: expect.any(String),
            ...payload,
            code: 'mocknano',
            inviterDid: caoOrganization.didDoc.id,
            invitationUrl: 'http://localhost.test/invitations/mocknano',
            expiresAt: expect.any(String),
            createdAt: expect.any(String),
            createdBy: testRegistrarSuperUser.sub,
            updatedAt: expect.any(String),
            updatedBy: testRegistrarSuperUser.sub,
          },
          messageCode: 'invitation_sent',
        });
      });
      it('Should add organization service type WebWalletProvider', async () => {
        const payload = {
          inviteeEmail: 'test@email.com',
          inviteeService: [
            {
              id: '#holder-1',
              type: ServiceTypes.WebWalletProviderType,
              serviceEndpoint: 'https://example.com',
            },
          ],
          inviteeProfile: {
            ...inviteeProfile,
            name: 'Given',
          },
          keyIndividuals,
        };
        const response = await fastify.injectJson({
          method: 'POST',
          url: invitationUrl(caoOrganization.didDoc.id),
          payload,
        });

        expect(response.statusCode).toEqual(200);
        expect(response.json).toEqual({
          invitation: {
            id: expect.any(String),
            ...payload,
            code: 'mocknano',
            inviterDid: caoOrganization.didDoc.id,
            invitationUrl: 'http://localhost.test/invitations/mocknano',
            expiresAt: expect.any(String),
            createdAt: expect.any(String),
            createdBy: testRegistrarSuperUser.sub,
            updatedAt: expect.any(String),
            updatedBy: testRegistrarSuperUser.sub,
          },
          messageCode: 'invitation_sent',
        });
      });
    });

    it('should create invitation with correct service with credential types', async () => {
      const credentialType = await persistCredentialSchema();
      const payload = {
        inviteeEmail: 'test@email.com',
        inviteeService: [
          {
            id: 'issuer-1',
            type: ServiceTypes.CareerIssuerType,
            serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
            credentialTypes: [credentialType.credentialType],
          },
        ],
        inviteeProfile: {
          ...inviteeProfile,
          name: 'Given',
        },
        keyIndividuals: minKeyIndvidiuals,
      };
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json).toEqual({
        invitation: {
          id: expect.any(String),
          ...payload,
          code: 'mocknano',
          inviterDid: caoOrganization.didDoc.id,
          invitationUrl: 'http://localhost.test/invitations/mocknano',
          expiresAt: expect.any(String),
          createdAt: expect.any(String),
          createdBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
          updatedAt: expect.any(String),
          updatedBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
        },
        messageCode: 'invitation_sent',
      });
    });

    it('should create invitation with Holder app provider service type', async () => {
      const payload = {
        inviteeEmail: 'test@email.com',
        inviteeService: [
          {
            id: '#holder-1',
            type: ServiceTypes.CareerIssuerType,
            serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
          },
        ],
        inviteeProfile: {
          ...inviteeProfile,
          name: 'Given',
        },
        keyIndividuals: minKeyIndvidiuals,
      };
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json).toEqual({
        invitation: {
          id: expect.any(String),
          ...payload,
          code: 'mocknano',
          inviterDid: caoOrganization.didDoc.id,
          invitationUrl: 'http://localhost.test/invitations/mocknano',
          expiresAt: expect.any(String),
          createdAt: expect.any(String),
          createdBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
          updatedAt: expect.any(String),
          updatedBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
        },
        messageCode: 'invitation_sent',
      });
    });

    it('should send error if send email failed', async () => {
      mockSendEmail.mockRejectedValueOnce('mocked error');
      const service = {
        id: 'issuer-1',
        type: 'VlcCareerIssuer_v1',
        serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
      };
      const payload = {
        inviteeEmail: 'test@email.com',
        inviteeService: [service],
        inviteeProfile: {
          ...inviteeProfile,
          name: 'Given Family',
        },
        keyIndividuals: minKeyIndvidiuals,
      };
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json).toEqual({
        invitation: mapPayloadToInvitation(payload, caoOrganization),
        messageCode: 'invitation_not_sent',
      });

      const invitesFromDb = await invitationsRepo.find();
      expect(invitesFromDb).toEqual([
        {
          _id: expect.anything(),
          code: expect.any(String),
          createdAt: expect.any(Date),
          createdBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
          expiresAt: expect.any(Date),
          invitationUrl: `http://localhost.test/invitations/${invitesFromDb[0].code}`,
          ...payload,
          inviterDid: caoOrganization.didDoc.id,
          updatedAt: expect.any(Date),
          updatedBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
        },
      ]);

      expect(mockAuth0UserGetByEmail).toBeCalledTimes(1);
      expect(mockAuth0UserCreate).toBeCalledTimes(1);
      expect(mockAuth0TicketChange).toBeCalledTimes(1);

      expect(mockAuth0UserGetByEmail).toHaveBeenCalledWith('test@email.com');
      expect(mockAuth0UserCreate).toHaveBeenCalledWith({
        app_metadata: { groupId: undefined },
        connection: undefined,
        email: 'test@email.com',
        email_verified: false,
        family_name: 'A-family-name',
        given_name: 'A-given-name',
        password: expect.anything(),
        verify_email: false,
      });
      expect(mockAuth0ClientAssignRole.mock.calls).toEqual([
        [{ id: 'user_id_123' }, { roles: ['rol_sQZLrbwBEblVBNDj'] }],
        [{ id: 'user_id_123' }, { roles: ['rol_xxx'] }],
      ]);
      expect(mockAuth0TicketChange).toHaveBeenCalledWith({
        mark_email_as_verified: true,
        result_url: 'https://ui.example.com',
        ttl_sec: 604800,
        user_id: 'user_id_123',
      });

      expect(mockSendError).toHaveBeenCalledWith('mocked error', {
        err: 'mocked error',
        message: 'Unable to send invitation email to user',
        email: 'test@email.com',
      });
    });

    it('should create a profile with only name and one service, return 200, and ensure auth0 user is created & email sent', async () => {
      const service = {
        id: 'issuer-1',
        type: 'VlcCareerIssuer_v1',
        serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
      };
      const payload = {
        inviteeEmail: 'test@email.com',
        inviteeService: [service],
        inviteeProfile: {
          ...inviteeProfile,
          name: 'Given Family',
        },
        keyIndividuals: minKeyIndvidiuals,
      };
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json).toEqual({
        invitation: mapPayloadToInvitation(payload, caoOrganization),
        messageCode: 'invitation_sent',
      });

      const invitesFromDb = await invitationsRepo.find();
      expect(invitesFromDb).toEqual([
        {
          _id: expect.anything(),
          code: expect.any(String),
          createdAt: expect.any(Date),
          createdBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
          expiresAt: expect.any(Date),
          invitationUrl: `http://localhost.test/invitations/${invitesFromDb[0].code}`,
          ...payload,
          inviterDid: caoOrganization.didDoc.id,
          updatedAt: expect.any(Date),
          updatedBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
        },
      ]);

      expect(mockAuth0UserGetByEmail).toBeCalledTimes(1);
      expect(mockAuth0UserCreate).toBeCalledTimes(1);
      expect(mockAuth0TicketChange).toBeCalledTimes(1);

      expect(mockAuth0UserGetByEmail).toHaveBeenCalledWith('test@email.com');
      expect(mockAuth0UserCreate).toHaveBeenCalledWith({
        app_metadata: { groupId: undefined },
        connection: undefined,
        email: 'test@email.com',
        email_verified: false,
        family_name: 'A-family-name',
        given_name: 'A-given-name',
        password: expect.anything(),
        verify_email: false,
      });
      expect(mockAuth0ClientAssignRole.mock.calls).toEqual([
        [{ id: 'user_id_123' }, { roles: ['rol_sQZLrbwBEblVBNDj'] }],
        [{ id: 'user_id_123' }, { roles: ['rol_xxx'] }],
      ]);
      expect(mockAuth0TicketChange).toHaveBeenCalledWith({
        mark_email_as_verified: true,
        result_url: 'https://ui.example.com',
        ttl_sec: 604800,
        user_id: 'user_id_123',
      });
      expect(mockSendEmail.mock.calls[0][0]).toEqual(
        expectedInvitationSentEmail()
      );
    });

    it('should create a profile with profile.name which can not be split', async () => {
      const service = {
        id: 'issuer-1',
        type: 'VlcCareerIssuer_v1',
        serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
      };
      const payload = {
        inviteeEmail: 'test@email.com',
        inviteeService: [service],
        inviteeProfile: {
          ...inviteeProfile,
          name: 'Given',
        },
        keyIndividuals: minKeyIndvidiuals,
      };
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json).toEqual({
        invitation: mapPayloadToInvitation(payload, caoOrganization),
        messageCode: 'invitation_sent',
      });

      const invitesFromDb = await invitationsRepo.find();
      expect(invitesFromDb).toEqual([
        {
          _id: expect.anything(),
          code: expect.any(String),
          createdAt: expect.any(Date),
          createdBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
          expiresAt: expect.any(Date),
          invitationUrl: `http://localhost.test/invitations/${invitesFromDb[0].code}`,
          inviterDid: caoOrganization.didDoc.id,
          ...payload,
          updatedAt: expect.any(Date),
          updatedBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
        },
      ]);

      expect(mockAuth0UserGetByEmail).toBeCalledTimes(1);
      expect(mockAuth0UserCreate).toBeCalledTimes(1);
      expect(mockAuth0TicketChange).toBeCalledTimes(1);

      expect(mockAuth0UserGetByEmail).toHaveBeenCalledWith('test@email.com');
      expect(mockAuth0UserCreate).toHaveBeenCalledWith({
        app_metadata: { groupId: undefined },
        connection: undefined,
        email: 'test@email.com',
        email_verified: false,
        family_name: 'A-family-name',
        given_name: 'A-given-name',
        password: expect.anything(),
        verify_email: false,
      });
      expect(mockAuth0ClientAssignRole.mock.calls).toEqual([
        [{ id: 'user_id_123' }, { roles: ['rol_sQZLrbwBEblVBNDj'] }],
        [{ id: 'user_id_123' }, { roles: ['rol_xxx'] }],
      ]);
      expect(mockAuth0TicketChange).toHaveBeenCalledWith({
        mark_email_as_verified: true,
        result_url: 'https://ui.example.com',
        ttl_sec: 604800,
        user_id: 'user_id_123',
      });

      expect(mockSendEmail.mock.calls[0][0]).toEqual(
        expectedInvitationSentEmail()
      );
    });

    it('should create invitation with correct service types', async () => {
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: {
          inviteeEmail: 'test@email.com',
          keyIndividuals: minKeyIndvidiuals,
          inviteeService: [
            {
              id: 'issuer-1',
              type: ServiceTypes.CareerIssuerType,
              serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
            },
            {
              id: 'issuer-1',
              type: ServiceTypes.IdDocumentIssuerType,
              serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
            },
            {
              id: 'issuer-1',
              type: ServiceTypes.NotaryIssuerType,
              serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
            },
            {
              id: 'issuer-1',
              type: ServiceTypes.InspectionType,
              serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
            },
          ],
          inviteeProfile: {
            ...inviteeProfile,
            name: 'Given',
          },
        },
      });

      expect(response.statusCode).toEqual(200);
    });

    it('should create invitation with key individuals', async () => {
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: {
          inviteeEmail: 'test@email.com',
          inviteeService: [
            {
              id: 'issuer-1',
              type: ServiceTypes.CareerIssuerType,
              serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
            },
            {
              id: 'issuer-1',
              type: ServiceTypes.IdDocumentIssuerType,
              serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
            },
            {
              id: 'issuer-1',
              type: ServiceTypes.NotaryIssuerType,
              serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
            },
            {
              id: 'issuer-1',
              type: ServiceTypes.InspectionType,
              serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
            },
          ],
          inviteeProfile: {
            ...inviteeProfile,
            name: 'Given',
          },
          keyIndividuals,
        },
      });
      expect(response.statusCode).toEqual(200);
      expect(response.json.invitation.keyIndividuals).toEqual(keyIndividuals);
    });
    it('should reuse a an existing user if they have already signed up', async () => {
      mockAuth0UserGetByEmail.mockImplementationOnce(async (email) => {
        return [{ user_id: 'user_id_123', logins_count: 1, email }];
      });
      const payload = {
        inviteeEmail: 'test@email.com',
        inviteeService: [
          {
            id: 'issuer-1',
            type: 'VlcCareerIssuer_v1',
            serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
          },
        ],
        inviteeProfile: {
          ...inviteeProfile,
          name: 'Given Family',
        },
        keyIndividuals: minKeyIndvidiuals,
      };
      const response = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload,
        headers: {
          'x-override-oauth-user': JSON.stringify(testRegistrarUser),
        },
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json).toEqual({
        invitation: mapPayloadToInvitation(payload, caoOrganization),
        messageCode: 'invitation_sent',
      });
      const invitesFromDb = await invitationsRepo.find();
      expect(invitesFromDb).toEqual([
        {
          ...payload,
          invitationUrl: `http://localhost.test/invitations/${invitesFromDb[0].code}`,
          inviterDid: caoOrganization.didDoc.id,
          _id: expect.anything(),
          code: expect.any(String),
          createdAt: expect.any(Date),
          createdBy: testRegistrarUser.sub,
          expiresAt: expect.any(Date),
          updatedAt: expect.any(Date),
          updatedBy: testRegistrarUser.sub,
        },
      ]);
      expect(mockAuth0UserGetByEmail).toBeCalledTimes(1);
      expect(mockAuth0UserCreate).toBeCalledTimes(0);
      expect(mockAuth0ClientAssignRole).toBeCalledTimes(0);
      expect(mockAuth0TicketChange).toBeCalledTimes(0);
      expect(mockSendEmail.mock.calls[0][0]).toEqual(
        expectedInvitationSentEmail()
      );
    });

    it('should create two profiles for different organizations with the same auth0 user, ensure only one version of the user is created, and send two emails', async () => {
      const ticket = 'https://ticket.com?pass=123';
      mockAuth0TicketChange.mockImplementationOnce(async () => {
        return {
          ticket,
        };
      });
      mockAuth0UserGetByEmail.mockImplementationOnce(async () => {
        return [];
      });
      mockAuth0UserGetByEmail.mockImplementationOnce(async () => {
        return [{ user_id: 'user_id_123' }];
      });

      const payload1 = {
        inviteeEmail: 'test@email.com',
        inviteeService: [
          {
            id: 'issuer-1',
            type: 'VlcCareerIssuer_v1',
            serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
          },
        ],
        inviteeProfile: {
          ...inviteeProfile,
          name: 'Given Family',
        },
        keyIndividuals: minKeyIndvidiuals,
      };
      const payload2 = {
        inviteeEmail: 'test@email.com',
        inviteeService: [
          {
            id: 'issuer-2',
            type: 'VlcCareerIssuer_v1',
            serviceEndpoint: `${caoOrganization.didDoc.id}#caoid`,
          },
        ],
        inviteeProfile: {
          ...inviteeProfile,
          name: 'Given Family',
        },
        keyIndividuals: minKeyIndvidiuals,
      };
      const response1 = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: payload1,
      });

      const response2 = await fastify.injectJson({
        method: 'POST',
        url: invitationUrl(caoOrganization.didDoc.id),
        payload: payload2,
      });

      expect(response1.statusCode).toEqual(200);
      expect(response1.json).toEqual({
        invitation: mapPayloadToInvitation(payload1, caoOrganization),
        messageCode: 'invitation_sent',
      });
      expect(response2.statusCode).toEqual(200);
      expect(response2.json).toEqual({
        invitation: mapPayloadToInvitation(payload2, caoOrganization),
        messageCode: 'invitation_sent',
      });

      const invitesFromDb = await invitationsRepo.find();
      expect(invitesFromDb).toEqual([
        {
          ...payload2,
          invitationUrl: `http://localhost.test/invitations/${invitesFromDb[0].code}`,
          inviterDid: caoOrganization.didDoc.id,
          _id: expect.anything(),
          code: expect.any(String),
          createdAt: expect.any(Date),
          createdBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
          expiresAt: expect.any(Date),
          updatedAt: expect.any(Date),
          updatedBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
        },
        {
          ...payload1,
          invitationUrl: `http://localhost.test/invitations/${invitesFromDb[1].code}`,
          inviterDid: caoOrganization.didDoc.id,
          _id: expect.anything(),
          code: expect.any(String),
          createdAt: expect.any(Date),
          createdBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
          expiresAt: expect.any(Date),
          updatedAt: expect.any(Date),
          updatedBy: expect.stringMatching(/auth0|[A-Za-z0-9_-]+/),
        },
      ]);

      expect(mockAuth0UserGetByEmail).toBeCalledTimes(2);
      expect(mockAuth0UserCreate).toBeCalledTimes(1);
      expect(mockAuth0TicketChange).toBeCalledTimes(2);

      expect(mockAuth0UserGetByEmail).toHaveBeenNthCalledWith(
        1,
        'test@email.com'
      );
      expect(mockAuth0UserGetByEmail).toHaveBeenNthCalledWith(
        2,
        'test@email.com'
      );
      expect(mockAuth0UserCreate).toHaveBeenCalledWith({
        app_metadata: { groupId: undefined },
        connection: undefined,
        email: 'test@email.com',
        email_verified: false,
        family_name: 'A-family-name',
        given_name: 'A-given-name',
        password: expect.anything(),
        verify_email: false,
      });
      expect(mockAuth0ClientAssignRole.mock.calls).toEqual([
        [{ id: 'user_id_123' }, { roles: ['rol_sQZLrbwBEblVBNDj'] }],
        [{ id: 'user_id_123' }, { roles: ['rol_xxx'] }],
      ]);
      expect(mockAuth0TicketChange).toBeCalledTimes(2);
      expect(mockAuth0TicketChange).toHaveBeenCalledWith({
        mark_email_as_verified: true,
        result_url: 'https://ui.example.com',
        ttl_sec: 604800,
        user_id: 'user_id_123',
      });

      expect(mockSendEmail.mock.calls[0][0]).toEqual(
        expectedInvitationSentEmail(`?signup_url=${encodeURIComponent(ticket)}`)
      );
      expect(mockSendEmail.mock.calls[1][0]).toEqual(
        expectedInvitationSentEmail()
      );
    });
  });

  describe('Get Invitations Test Suite', () => {
    it('should return 404 if did does not exist', async () => {
      const response = await fastify.injectJson({
        method: 'GET',
        url: invitationUrl('did:test:not-found'),
      });

      expect(response.statusCode).toEqual(404);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Not Found',
          errorCode: 'organization_not_found',
          message: 'Organization not found',
          statusCode: 404,
        })
      );
    });

    it('should return empty array if no invitations', async () => {
      const response = await fastify.injectJson({
        method: 'GET',
        url: invitationUrl(caoOrganization.didDoc.id),
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json).toEqual({
        invitations: [],
      });
    });

    it('should return paginated array of invitations', async () => {
      const inviterDid = caoOrganization.didDoc.id;
      const omitOrgProfile = omit([
        'permittedVelocityServiceCategory',
        'adminGivenName',
        'adminFamilyName',
        'adminTitle',
        'adminEmail',
        'signatoryGivenName',
        'signatoryFamilyName',
        'signatoryTitle',
        'signatoryEmail',
      ]);
      const organization = await newOrganization({
        service: [
          {
            id: '#foo',
            type: 'VlcCareerIssuer_v1',
            serviceEndpoint: 'did:mocked:1123#bar',
          },
        ],
      });
      const [invitation5, invitation6, invitation1, invitation4] =
        await Promise.all([
          persistInvitation({
            inviterDid,
            organization,
            inviteeEmail: 'em-5@email.com',
            keyIndividuals: minKeyIndvidiuals,
          }),
          persistInvitation({
            inviterDid,
            organization,
            inviteeEmail: 'em-6@email.com',
            keyIndividuals: minKeyIndvidiuals,
          }),
          persistInvitation({
            inviterDid,
            organization,
            inviteeEmail: 'em-1@email.com',
            keyIndividuals,
          }),
          persistInvitation({
            inviterDid,
            organization,
            inviteeEmail: 'em-4@email.com',
            keyIndividuals: minKeyIndvidiuals,
            inviteeService: [
              {
                id: '#foo',
                type: 'foo',
                serviceEndpoint: 'https://foo#bar',
              },
            ],
          }),
        ]);

      const response = await fastify.injectJson({
        method: 'GET',
        url: `/api/v0.6/organizations/${inviterDid}/invitations?page.size=2&page.skip=0&sort[0]=inviteeEmail,DESC`,
      });
      const response1 = await fastify.injectJson({
        method: 'GET',
        url: `/api/v0.6/organizations/${inviterDid}/invitations?page.size=2&page.skip=1&sort[0]=inviteeEmail,DESC`,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json).toEqual({
        invitations: [
          {
            ...omit(['_id'], invitation6),
            id: invitation6._id.toString(),
            inviteeProfile: omitOrgProfile(invitation6.inviteeProfile),
          },
          {
            ...omit(['_id'], invitation5),
            id: invitation5._id.toString(),
            inviteeProfile: omitOrgProfile(invitation5.inviteeProfile),
          },
        ],
      });

      expect(response1.statusCode).toEqual(200);
      expect(response1.json).toEqual({
        invitations: [
          {
            ...omit(['_id'], invitation4),
            id: invitation4._id.toString(),
            inviteeProfile: omitOrgProfile(invitation4.inviteeProfile),
            inviteeService: [
              {
                id: '#foo',
                type: 'foo',
                serviceEndpoint: 'https://foo#bar',
              },
            ],
          },
          {
            ...omit(['_id'], invitation1),
            id: invitation1._id.toString(),
            keyIndividuals,
            inviteeProfile: omitOrgProfile(invitation1.inviteeProfile),
          },
        ],
      });
    });
  });

  describe('Delete Invitation Test Suite', () => {
    let inviterOrganization;
    beforeEach(async () => {
      inviterOrganization = await persistOrganization();
    });

    it('should delete an invitation', async () => {
      const invitation = await persistInvitation({
        inviterDid: inviterOrganization.didDoc.id,
      });

      const response = await fastify.inject({
        method: 'DELETE',
        url: `/api/v0.6/organizations/${
          inviterOrganization.didDoc.id
        }/invitations/${invitation._id.toString()}`,
      });

      expect(response.statusCode).toEqual(204);
      const deletedInvitation = await invitationsRepo.findOne({
        filter: {
          _id: invitation._id.toString(),
        },
      });
      expect(deletedInvitation).toBeNull();
    });

    it('should return 404 if invitation id is not object id', async () => {
      const response = await fastify.inject({
        method: 'DELETE',
        url: `/api/v0.6/organizations/${inviterOrganization.didDoc.id}/invitations/foo`,
      });

      expect(response.statusCode).toEqual(404);
      expect(response.json()).toEqual(
        errorResponseMatcher({
          error: 'Not Found',
          errorCode: 'invitation_not_found',
          message: 'Invitation not found',
          statusCode: 404,
        })
      );
    });

    it('3should return 404 if invitation does not exist in db', async () => {
      const response = await fastify.inject({
        method: 'DELETE',
        url: `/api/v0.6/organizations/${inviterOrganization.didDoc.id}/invitations/5f4d2e1e9f9b7f0b8c5b7f4c`,
      });

      expect(response.statusCode).toEqual(404);
      expect(response.json()).toEqual(
        errorResponseMatcher({
          error: 'Not Found',
          errorCode: 'invitation_not_found',
          message: 'Invitation not found',
          statusCode: 404,
        })
      );
    });
  });

  describe('Get Invitation Test Suite', () => {
    let inviterOrganization;
    beforeEach(async () => {
      inviterOrganization = await persistOrganization();
    });

    it('should return 404 if invitation does not exist', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: `/api/v0.6/organizations/${inviterOrganization.didDoc.id}/invitations/5f4d2e1e9f9b7f0b8c5b7f4c`,
      });

      expect(response.statusCode).toEqual(404);
      expect(response.json()).toEqual(
        errorResponseMatcher({
          error: 'Not Found',
          errorCode: 'invitation_not_found',
          message: 'Invitation not found',
          statusCode: 404,
        })
      );
    });

    it('should return 404 if invitation has deletedAt', async () => {
      const invitation = await persistInvitation({
        inviterDid: inviterOrganization.didDoc.id,
        code: 'fooCode',
        inviteeDid: 'fooInviteeDid',
        inviteeProfile: {
          ...inviteeProfile,
          name: 'fooName',
          description: 'fooDescription',
        },
        inviteeService: [
          {
            id: '#foo',
            type: 'foo',
            serviceEndpoint: 'foo#bar',
          },
        ],
        invitationUrl: 'http://foo,invitation',
        createdBy: 'fooUser1',
        updatedBy: 'fooUser1',
        deletedBy: 'fooUser1',
        deletedAt: new Date(),
      });

      const response = await fastify.inject({
        method: 'GET',
        url: `/api/v0.6/organizations/${
          inviterOrganization.didDoc.id
        }/invitations/${invitation._id.toString()}`,
      });

      expect(response.statusCode).toEqual(404);
      expect(response.json()).toEqual(
        errorResponseMatcher({
          error: 'Not Found',
          errorCode: 'invitation_not_found',
          message: 'Invitation not found',
          statusCode: 404,
        })
      );

      const invitationFromDb = await invitationsRepo
        .collection()
        .find()
        .toArray();
      expect(invitationFromDb).toEqual([
        {
          _id: new ObjectId(invitation._id),
          inviterDid: inviterOrganization.didDoc.id,
          inviteeDid: 'fooInviteeDid',
          inviteeEmail: 'foo@example.com',
          inviteeProfile: {
            ...inviteeProfile,
            name: 'fooName',
            description: 'fooDescription',
          },
          inviteeService: [
            {
              id: '#foo',
              type: 'foo',
              serviceEndpoint: 'foo#bar',
            },
          ],
          invitationUrl: 'http://foo,invitation',
          code: 'fooCode',
          createdBy: 'fooUser1',
          updatedBy: 'fooUser1',
          deletedBy: 'fooUser1',
          expiresAt: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          deletedAt: expect.any(Date),
        },
      ]);
    });

    it('should return an invitation', async () => {
      const invitation = await persistInvitation({
        inviterDid: inviterOrganization.didDoc.id,
        code: 'fooCode',
        inviteeDid: 'fooInviteeDid',
        inviteeProfile: {
          name: 'Some Name',
          contactEmail: 'contact@betacorp.com',
          description: 'Invitee org 1 for tesing 4268',
          founded: '2023',
          closed: '2024',
          location: {
            countryCode: 'BY',
          },
          logo: 'https://betacorp.com/logo.png',
          technicalEmail: 'support@betacorp.com',
          type: 'company',
          website: 'http://betacorp.com',
          linkedInProfile: 'https://www.linkedin.com/in/test-profile',
          physicalAddress: {
            line1: '123 Main St',
            line2: 'Suite 123',
            line3: 'New York',
          },
        },
        inviteeService: [
          {
            id: '#foo',
            type: 'foo',
            serviceEndpoint: 'foo#bar',
          },
        ],
        invitationUrl: 'http://foo,invitation',
        createdBy: 'fooUser1',
        updatedBy: 'fooUser1',
        keyIndividuals,
      });

      const response = await fastify.inject({
        method: 'GET',
        url: `/api/v0.6/organizations/${
          inviterOrganization.didDoc.id
        }/invitations/${invitation._id.toString()}`,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json()).toEqual({
        invitation: {
          id: invitation._id.toString(),
          inviterDid: inviterOrganization.didDoc.id,
          inviteeDid: 'fooInviteeDid',
          inviteeEmail: 'foo@example.com',
          inviteeProfile: invitation.inviteeProfile,
          inviteeService: [
            {
              id: '#foo',
              type: 'foo',
              serviceEndpoint: 'foo#bar',
            },
          ],
          invitationUrl: 'http://foo,invitation',
          code: 'fooCode',
          createdBy: 'fooUser1',
          updatedBy: 'fooUser1',
          expiresAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          keyIndividuals,
        },
      });
    });

    it('should return an invitation from did in alsoKnownAs', async () => {
      const alsoKnownAs = 'did:aka:foo';
      await persistOrganization({
        alsoKnownAs,
      });
      const invitation = await persistInvitation({
        inviterDid: alsoKnownAs,
        code: 'fooCode',
        inviteeDid: 'fooInviteeDid',
        inviteeProfile: {
          name: 'Some Name',
          contactEmail: 'contact@betacorp.com',
          description: 'Invitee org 1 for tesing 4268',
          founded: '2023',
          closed: '2024',
          location: {
            countryCode: 'BY',
          },
          logo: 'https://betacorp.com/logo.png',
          technicalEmail: 'support@betacorp.com',
          type: 'company',
          website: 'http://betacorp.com',
          linkedInProfile: 'https://www.linkedin.com/in/test-profile',
          physicalAddress: {
            line1: '123 Main St',
            line2: 'Suite 123',
            line3: 'New York',
          },
        },
        inviteeService: [
          {
            id: '#foo',
            type: 'foo',
            serviceEndpoint: 'foo#bar',
          },
        ],
        invitationUrl: 'http://foo,invitation',
        createdBy: 'fooUser1',
        updatedBy: 'fooUser1',
        keyIndividuals,
      });

      const response = await fastify.inject({
        method: 'GET',
        url: `/api/v0.6/organizations/${alsoKnownAs}/invitations/${invitation._id.toString()}`,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json()).toEqual({
        invitation: {
          id: invitation._id.toString(),
          inviterDid: alsoKnownAs,
          inviteeDid: 'fooInviteeDid',
          inviteeEmail: 'foo@example.com',
          inviteeProfile: invitation.inviteeProfile,
          inviteeService: [
            {
              id: '#foo',
              type: 'foo',
              serviceEndpoint: 'foo#bar',
            },
          ],
          invitationUrl: 'http://foo,invitation',
          code: 'fooCode',
          createdBy: 'fooUser1',
          updatedBy: 'fooUser1',
          expiresAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          keyIndividuals,
        },
      });
    });
  });

  describe('Resend Invitation Test Suite', () => {
    let inviterOrganization;
    beforeEach(async () => {
      inviterOrganization = await persistOrganization();
    });

    it('should return 404 if email ivalid', async () => {
      const payload = {
        inviteeEmail: '1@ti',
      };
      const response = await fastify.inject({
        method: 'PUT',
        url: `/api/v0.6/organizations/${inviterOrganization.didDoc.id}/invitations/invitationId`,
        payload,
      });

      expect(response.statusCode).toEqual(400);
      expect(response.json()).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'bad_invitee_email',
          message:
            'The email address is invalid and the invitation was not sent',
          statusCode: 400,
        })
      );
    });

    it('should return 404 if did not matched with inviterId', async () => {
      const invitation = await persistInvitation({
        inviterDid: inviterOrganization.didDoc.id,
        code: 'fooCode',
        inviteeDid: 'fooInviteeDid',
        inviteeProfile: {
          ...inviteeProfile,
          name: 'fooName',
        },
        inviteeService: [
          {
            id: '#foo',
            type: 'foo',
            serviceEndpoint: 'foo#bar',
          },
        ],
        invitationUrl: 'http://fooinvitation',
        createdBy: 'fooUser1',
        updatedBy: 'fooUser1',
      });
      const notMatchedOrg = await persistOrganization();
      const response = await fastify.inject({
        method: 'PUT',
        url: `/api/v0.6/organizations/${
          notMatchedOrg.didDoc.id
        }/invitations/${invitation._id.toString()}`,
        payload: {
          inviteeEmail: 'email@email.com',
        },
      });

      expect(mockAuth0TicketChange).toBeCalledTimes(0);
      expect(mockAuth0UserGetByEmail).toBeCalledTimes(0);
      expect(mockSendEmail).toBeCalledTimes(0);
      expect(response.statusCode).toEqual(404);
      expect(response.json()).toEqual(
        errorResponseMatcher({
          error: 'Not Found',
          errorCode: 'invitation_not_found',
          message: 'Invitation not found',
          statusCode: 404,
        })
      );
    });

    it('should return 404 if invitation does not exist', async () => {
      const response = await fastify.inject({
        method: 'PUT',
        url: `/api/v0.6/organizations/${inviterOrganization.didDoc.id}/invitations/5f4d2e1e9f9b7f0b8c5b7f4c`,
        payload: {
          inviteeEmail: 'email@email.com',
        },
      });

      expect(response.statusCode).toEqual(404);
      expect(response.json()).toEqual(
        errorResponseMatcher({
          error: 'Not Found',
          errorCode: 'invitation_not_found',
          message: 'Invitation not found',
          statusCode: 404,
        })
      );
    });

    it('should return 404 if invitation has deletedAt', async () => {
      const invitation = await persistInvitation({
        inviterDid: inviterOrganization.didDoc.id,
        code: 'fooCode',
        inviteeDid: 'fooInviteeDid',
        inviteeProfile: {
          ...inviteeProfile,
          name: 'fooName',
          description: 'fooDescription',
        },
        inviteeService: [
          {
            id: '#foo',
            type: 'foo',
            serviceEndpoint: 'foo#bar',
          },
        ],
        invitationUrl: 'http://foo,invitation',
        createdBy: 'fooUser1',
        updatedBy: 'fooUser1',
        deletedBy: 'fooUser1',
        deletedAt: new Date(),
      });

      const response = await fastify.inject({
        method: 'PUT',
        url: `/api/v0.6/organizations/${
          inviterOrganization.didDoc.id
        }/invitations/${invitation._id.toString()}`,
        payload: {
          inviteeEmail: 'email@email.com',
        },
      });

      expect(response.statusCode).toEqual(404);
      expect(response.json()).toEqual(
        errorResponseMatcher({
          error: 'Not Found',
          errorCode: 'invitation_not_found',
          message: 'Invitation not found',
          statusCode: 404,
        })
      );

      const invitationFromDb = await invitationsRepo
        .collection()
        .find()
        .toArray();
      expect(invitationFromDb).toEqual([
        {
          _id: new ObjectId(invitation._id),
          inviterDid: inviterOrganization.didDoc.id,
          inviteeDid: 'fooInviteeDid',
          inviteeEmail: 'foo@example.com',
          inviteeProfile: {
            ...inviteeProfile,
            name: 'fooName',
            description: 'fooDescription',
          },
          inviteeService: [
            {
              id: '#foo',
              type: 'foo',
              serviceEndpoint: 'foo#bar',
            },
          ],
          invitationUrl: 'http://foo,invitation',
          code: 'fooCode',
          createdBy: 'fooUser1',
          updatedBy: 'fooUser1',
          deletedBy: 'fooUser1',
          expiresAt: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          deletedAt: expect.any(Date),
        },
      ]);
    });

    it('Should resend invitation', async () => {
      const ticket = 'https://ticket.com?pass=123';
      mockAuth0UserGetByEmail.mockImplementationOnce(async () => {
        return [];
      });
      mockAuth0TicketChange.mockImplementationOnce(async () => {
        return {
          ticket,
        };
      });
      const invitation = await persistInvitation({
        inviterDid: inviterOrganization.didDoc.id,
        code: 'fooCode',
        inviteeDid: 'fooInviteeDid',
        inviteeProfile: {
          ...inviteeProfile,
          name: 'fooName',
        },
        inviteeService: [
          {
            id: '#foo',
            type: 'foo',
            serviceEndpoint: 'foo#bar',
          },
        ],
        keyIndividuals: minKeyIndvidiuals,
        invitationUrl: 'http://fooinvitation',
        createdBy: 'fooUser1',
        updatedBy: 'fooUser1',
      });

      const response = await fastify.inject({
        method: 'PUT',
        url: `/api/v0.6/organizations/${
          inviterOrganization.didDoc.id
        }/invitations/${invitation._id.toString()}`,
        payload: {
          inviteeEmail: 'email123@email.com',
        },
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json()).toEqual({
        invitation: {
          id: invitation._id.toString(),
          inviterDid: inviterOrganization.didDoc.id,
          inviteeDid: 'fooInviteeDid',
          inviteeEmail: 'email123@email.com',
          inviteeProfile: {
            ...inviteeProfile,
            name: 'fooName',
          },
          inviteeService: [
            {
              id: '#foo',
              type: 'foo',
              serviceEndpoint: 'foo#bar',
            },
          ],
          keyIndividuals: minKeyIndvidiuals,
          invitationUrl: 'http://localhost.test/invitations/mocknano',
          code: 'mocknano',
          createdBy: 'fooUser1',
          updatedBy: 'fooUser1',
          expiresAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        messageCode: 'invitation_sent',
      });

      const invitesFromDb = await invitationsRepo.findOne(invitation._id);
      expect(invitesFromDb).toEqual({
        _id: expect.anything(),
        inviterDid: inviterOrganization.didDoc.id,
        inviteeDid: 'fooInviteeDid',
        inviteeEmail: 'email123@email.com',
        inviteeProfile: {
          ...inviteeProfile,
          name: 'fooName',
        },
        inviteeService: [
          {
            id: '#foo',
            type: 'foo',
            serviceEndpoint: 'foo#bar',
          },
        ],
        keyIndividuals: minKeyIndvidiuals,
        invitationUrl: 'http://localhost.test/invitations/mocknano',
        code: 'mocknano',
        createdBy: 'fooUser1',
        updatedBy: 'fooUser1',
        expiresAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(invitesFromDb.expiresAt.getTime()).toBeGreaterThan(
        mongoify(invitation).updatedAt.getTime()
      );

      expect(mockAuth0UserGetByEmail).toBeCalledTimes(1);
      expect(mockAuth0UserCreate).toBeCalledTimes(1);
      expect(mockAuth0TicketChange).toBeCalledTimes(1);

      expect(mockAuth0UserGetByEmail).toHaveBeenCalledWith(
        'email123@email.com'
      );
      expect(mockAuth0ClientAssignRole.mock.calls).toEqual([
        [{ id: 'user_id_123' }, { roles: ['rol_sQZLrbwBEblVBNDj'] }],
        [{ id: 'user_id_123' }, { roles: ['rol_xxx'] }],
      ]);
      expect(mockAuth0TicketChange).toHaveBeenCalledWith({
        mark_email_as_verified: true,
        result_url: 'https://ui.example.com',
        ttl_sec: 604800,
        user_id: 'user_id_123',
      });
      expect(mockSendEmail.mock.calls[0][0]).toEqual(
        expectedInvitationSentEmail(
          `?signup_url=${encodeURIComponent(ticket)}`,
          'email123@email.com'
        )
      );
    });

    it('Should resend invitation without creating a user', async () => {
      mockAuth0UserGetByEmail.mockImplementationOnce(async () => {
        return [{ user_id: 'user_id_123' }];
      });
      const ticket = 'https://ticket.com?pass=123';
      mockAuth0TicketChange.mockImplementationOnce(async () => {
        return {
          ticket,
        };
      });
      const invitation = await persistInvitation({
        inviterDid: inviterOrganization.didDoc.id,
        code: 'fooCode',
        inviteeDid: 'fooInviteeDid',
        inviteeProfile: {
          ...inviteeProfile,
          name: 'fooName',
        },
        keyIndividuals,
        inviteeService: [
          {
            id: '#foo',
            type: 'foo',
            serviceEndpoint: 'foo#bar',
          },
        ],
        invitationUrl: 'http://fooinvitation',
        createdBy: 'fooUser1',
        updatedBy: 'fooUser1',
      });

      const response = await fastify.inject({
        method: 'PUT',
        url: `/api/v0.6/organizations/${
          inviterOrganization.didDoc.id
        }/invitations/${invitation._id.toString()}`,
        payload: {
          inviteeEmail: 'email123@email.com',
        },
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json()).toEqual({
        invitation: {
          id: invitation._id.toString(),
          inviterDid: inviterOrganization.didDoc.id,
          inviteeDid: 'fooInviteeDid',
          inviteeEmail: 'email123@email.com',
          inviteeProfile: {
            ...inviteeProfile,
            name: 'fooName',
          },
          inviteeService: [
            {
              id: '#foo',
              type: 'foo',
              serviceEndpoint: 'foo#bar',
            },
          ],
          keyIndividuals,
          invitationUrl: 'http://localhost.test/invitations/mocknano',
          code: 'mocknano',
          createdBy: 'fooUser1',
          updatedBy: 'fooUser1',
          expiresAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        messageCode: 'invitation_sent',
      });

      const invitesFromDb = await invitationsRepo.findOne(invitation._id);
      expect(invitesFromDb).toEqual({
        _id: expect.anything(),
        inviterDid: inviterOrganization.didDoc.id,
        inviteeDid: 'fooInviteeDid',
        inviteeEmail: 'email123@email.com',
        inviteeProfile: {
          ...inviteeProfile,
          name: 'fooName',
        },
        inviteeService: [
          {
            id: '#foo',
            type: 'foo',
            serviceEndpoint: 'foo#bar',
          },
        ],
        keyIndividuals,
        invitationUrl: 'http://localhost.test/invitations/mocknano',
        code: 'mocknano',
        createdBy: 'fooUser1',
        updatedBy: 'fooUser1',
        expiresAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(invitesFromDb.expiresAt.getTime()).toBeGreaterThan(
        mongoify(invitation).updatedAt.getTime()
      );

      expect(mockAuth0UserGetByEmail).toBeCalledTimes(1);
      expect(mockAuth0UserCreate).toBeCalledTimes(0);
      expect(mockAuth0ClientAssignRole).toBeCalledTimes(0);
      expect(mockAuth0TicketChange).toBeCalledTimes(1);

      expect(mockAuth0UserGetByEmail).toHaveBeenCalledWith(
        'email123@email.com'
      );
      expect(mockSendEmail.mock.calls[0][0]).toEqual(
        expectedInvitationSentEmail(
          `?signup_url=${encodeURIComponent(ticket)}`,
          'email123@email.com'
        )
      );
    });
  });
});
