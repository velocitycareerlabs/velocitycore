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
const mockSendEmail = jest.fn((payload) => payload);

jest.mock('@aws-sdk/client-ses', () => ({
  SendEmailCommand: jest.fn((args) => args),
  SESClient: jest.fn().mockImplementation(() => ({
    send: mockSendEmail,
  })),
}));

const { mongoDb } = require('@spencejs/spence-mongo-repos');
const { ObjectId } = require('mongodb');
const { subDays, subMonths } = require('date-fns/fp');
const { ServiceTypes } = require('@velocitycareerlabs/organizations-registry');
const { errorResponseMatcher } = require('@velocitycareerlabs/tests-helpers');
const buildFastify = require('./helpers/build-fastify');
const initOrganizationFactory = require('../src/entities/organizations/factories/organizations-factory');
const initSignatoryStatusFactory = require('../src/entities/signatories/factories/signatory-status-factory');
const {
  expectedSignatoryApprovedEmail,
  expectedSignatoryRejectedEmail,
  expectedSignatoryReminderEmail,
} = require('./helpers/email-matchers');
const signatoryStatusPlugin = require('../src/entities/signatories/repos/repo');
const organizationsPlugin = require('../src/entities/organizations/repos/repo');
const {
  sendReminders,
  initSendEmailNotifications,
  SignatoryEventStatus,
} = require('../src/entities');

jest.mock('nanoid', () => {
  const originalModule = jest.requireActual('nanoid');
  return {
    ...originalModule,
    nanoid: jest.fn().mockReturnValue('1'),
  };
});

jest.mock('../src/entities/signatories/orchestrators/send-reminders', () => {
  const originalModule = jest.requireActual(
    '../src/entities/signatories/orchestrators/send-reminders'
  );
  return {
    ...originalModule,
    sendReminders: jest.fn(originalModule.sendReminders),
  };
});

describe('signatoriesController', () => {
  let testContext;
  let fastify;
  let persistOrganization;
  let persistSignatoryStatus;
  let signatoryStatusRepo;
  let organizationsRepo;
  let sendEmailToSignatoryForOrganizationApproval;

  beforeAll(async () => {
    fastify = buildFastify();
    await fastify.ready();
    ({ persistOrganization } = initOrganizationFactory(fastify));
    ({ persistSignatoryStatus } = initSignatoryStatusFactory(fastify));

    signatoryStatusRepo = signatoryStatusPlugin(fastify)({
      log: fastify.log,
      config: fastify.config,
    });
    organizationsRepo = organizationsPlugin(fastify)({
      log: fastify.log,
      config: fastify.config,
    });

    ({ sendEmailToSignatoryForOrganizationApproval } =
      initSendEmailNotifications(fastify));
    testContext = {
      ...fastify,
      repos: {
        signatoryStatus: signatoryStatusRepo,
        organizations: organizationsRepo,
      },
    };
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await mongoDb().collection('organizations').deleteMany({});
    await mongoDb().collection('signatoryStatus').deleteMany({});
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('GET /:did/signatories/response/approve', () => {
    it('should send email', async () => {
      const organization = await persistOrganization();
      const signatory = await persistSignatoryStatus({
        organization,
      });
      const response = await fastify.injectJson({
        method: 'GET',
        url: `/api/v0.6/organizations/${organization.didDoc.id}/signatories/response/approve?authCode=${signatory.authCodes[0].code}`,
      });
      expect(response.statusCode).toEqual(200);
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      expect(mockSendEmail.mock.calls[0][0]).toEqual(
        expectedSignatoryApprovedEmail(organization)
      );
    });

    it('should send email and mark signatory reminder as approved', async () => {
      const organization = await persistOrganization();
      const signatory = await persistSignatoryStatus({
        organization,
      });
      const response = await fastify.injectJson({
        method: 'GET',
        url: `/api/v0.6/organizations/${organization.didDoc.id}/signatories/response/approve?authCode=${signatory.authCodes[0].code}`,
      });
      expect(response.statusCode).toEqual(200);
      const signatoryReminderDb = await signatoryStatusRepo.findOne({
        filter: {
          organizationDid: organization.didDoc.id,
        },
      });
      expect(signatoryReminderDb).toEqual({
        _id: expect.any(ObjectId),
        organizationDid: organization.didDoc.id,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: expect.any(Date),
          },
          {
            state: SignatoryEventStatus.APPROVED,
            timestamp: expect.any(Date),
          },
        ],
        authCodes: [
          {
            code: '12345',
            timestamp: expect.any(Date),
          },
        ],
        approvedAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should return 401 if signatory with auth code does not exist', async () => {
      const organization = await persistOrganization();
      const response = await fastify.injectJson({
        method: 'GET',
        url: `/api/v0.6/organizations/${organization.didDoc.id}/signatories/response/approve?authCode=999`,
      });
      expect(response.statusCode).toEqual(401);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Unauthorized',
          errorCode: 'unauthorized',
          message: 'Unauthorized',
          statusCode: 401,
        })
      );
    });

    it('should return 400 if authCode is old', async () => {
      const organization = await persistOrganization();
      await persistSignatoryStatus({
        organization,
        authCodes: [
          {
            code: '1',
            timestamp: subDays(4)(new Date()),
          },
          {
            code: '2',
            timestamp: subDays(1)(new Date()),
          },
        ],
      });
      const response = await fastify.injectJson({
        method: 'GET',
        url: `/api/v0.6/organizations/${organization.didDoc.id}/signatories/response/approve?authCode=1`,
      });
      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'auth_code_must_be_most_recent',
          message: 'Please use the latest email sent.',
          statusCode: 400,
        })
      );
    });

    it('should return 400 if authCode expired', async () => {
      const organization = await persistOrganization();
      await persistSignatoryStatus({
        organization,
        authCodes: [
          {
            code: '1',
            timestamp: subMonths(4)(new Date()),
          },
        ],
      });
      const response = await fastify.injectJson({
        method: 'GET',
        url: `/api/v0.6/organizations/${organization.didDoc.id}/signatories/response/approve?authCode=1`,
      });
      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'auth_code_expired',
          message: 'Auth code has expired.',
          statusCode: 400,
        })
      );
    });

    it('should return 404 if organization does not exist', async () => {
      const response = await fastify.injectJson({
        method: 'GET',
        url: '/api/v0.6/organizations/did:test:1/signatories/response/approve?authCode=12345',
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
      expect(mockSendEmail).toHaveBeenCalledTimes(0);
    });
  });

  describe('GET /:did/signatories/response/reject', () => {
    it('should send email', async () => {
      const organization = await persistOrganization();
      const signatory = await persistSignatoryStatus({
        organization,
      });
      const response = await fastify.injectJson({
        method: 'GET',
        url: `/api/v0.6/organizations/${organization.didDoc.id}/signatories/response/reject?authCode=${signatory.authCodes[0].code}`,
      });
      expect(response.statusCode).toEqual(200);
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      expect(mockSendEmail.mock.calls[0][0]).toEqual(
        expectedSignatoryRejectedEmail(organization)
      );
    });

    it('should send email and mark signatory reminder as rejected', async () => {
      const organization = await persistOrganization();
      const signatory = await persistSignatoryStatus({
        organization,
      });
      const response = await fastify.injectJson({
        method: 'GET',
        url: `/api/v0.6/organizations/${organization.didDoc.id}/signatories/response/reject?authCode=${signatory.authCodes[0].code}`,
      });
      expect(response.statusCode).toEqual(200);
      const signatoryReminderDb = await signatoryStatusRepo.findOne({
        filter: {
          organizationDid: organization.didDoc.id,
        },
      });
      expect(signatoryReminderDb).toEqual({
        _id: expect.any(ObjectId),
        organizationDid: organization.didDoc.id,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: expect.any(Date),
          },
          {
            state: SignatoryEventStatus.REJECTED,
            timestamp: expect.any(Date),
          },
        ],
        authCodes: [
          {
            code: '12345',
            timestamp: expect.any(Date),
          },
        ],
        rejectedAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should return 401 if signatory with auth code does not exist', async () => {
      const organization = await persistOrganization();
      const response = await fastify.injectJson({
        method: 'GET',
        url: `/api/v0.6/organizations/${organization.didDoc.id}/signatories/response/reject?authCode=999`,
      });
      expect(response.statusCode).toEqual(401);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Unauthorized',
          errorCode: 'unauthorized',
          message: 'Unauthorized',
          statusCode: 401,
        })
      );
    });

    it('should return 400 if authCode is old', async () => {
      const organization = await persistOrganization();
      await persistSignatoryStatus({
        organization,
        authCodes: [
          {
            code: '1',
            timestamp: subDays(4)(new Date()),
          },
          {
            code: '2',
            timestamp: subDays(1)(new Date()),
          },
        ],
      });
      const response = await fastify.injectJson({
        method: 'GET',
        url: `/api/v0.6/organizations/${organization.didDoc.id}/signatories/response/reject?authCode=1`,
      });
      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'auth_code_must_be_most_recent',
          message: 'Please use the latest email sent.',
          statusCode: 400,
        })
      );
    });

    it('should return 400 if authCode expired', async () => {
      const organization = await persistOrganization();
      await persistSignatoryStatus({
        organization,
        authCodes: [
          {
            code: '1',
            timestamp: subMonths(4)(new Date()),
          },
        ],
      });
      const response = await fastify.injectJson({
        method: 'GET',
        url: `/api/v0.6/organizations/${organization.didDoc.id}/signatories/response/reject?authCode=1`,
      });
      expect(response.statusCode).toEqual(400);
      expect(response.json).toEqual(
        errorResponseMatcher({
          error: 'Bad Request',
          errorCode: 'auth_code_expired',
          message: 'Auth code has expired.',
          statusCode: 400,
        })
      );
    });

    it('should return 404 if organization does not exist', async () => {
      const response = await fastify.injectJson({
        method: 'GET',
        url: '/api/v0.6/organizations/did:test:1/signatories/response/reject?authCode=12345',
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
      expect(mockSendEmail).toHaveBeenCalledTimes(0);
    });
  });

  describe('POST /send-reminder', () => {
    it('should return 200', async () => {
      sendReminders.mockResolvedValueOnce(undefined);
      const response = await fastify.injectJson({
        method: 'POST',
        url: '/api/v0.6/signatories/send-reminder',
        payload: {},
      });
      expect(response.statusCode).toEqual(200);
    });

    it('1234 should return 200 if something went wrong', async () => {
      sendReminders.mockRejectedValueOnce(new Error('Something went wrong'));
      const response = await fastify.injectJson({
        method: 'POST',
        url: '/api/v0.6/signatories/send-reminder',
        payload: {},
      });
      expect(response.statusCode).toEqual(200);
    });

    it('should not send emails if there are no signatory reminders', async () => {
      await sendReminders(
        sendEmailToSignatoryForOrganizationApproval,
        testContext
      );
      expect(mockSendEmail).toHaveBeenCalledTimes(0);
    });

    it('should send emails if there are active signatory reminders', async () => {
      const caoOrganization = await persistOrganization();
      const organization1 = await persistOrganization({
        service: [
          {
            id: '#iss-1',
            type: ServiceTypes.HolderAppProviderType,
            serviceEndpoint: `${caoOrganization.didDoc.id}#cao-1`,
          },
        ],
      });
      const organization2 = await persistOrganization({
        service: [
          {
            id: '#iss-1',
            type: ServiceTypes.HolderAppProviderType,
            serviceEndpoint: `${caoOrganization.didDoc.id}#cao-1`,
          },
        ],
      });
      const signatoryReminder1 = await persistSignatoryStatus({
        organization: organization1,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: subDays(7)(new Date()),
          },
        ],
      });
      const signatoryReminder2 = await persistSignatoryStatus({
        organization: organization2,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: subDays(7)(new Date()),
          },
        ],
      });
      const signatoryReminder3 = await persistSignatoryStatus({});
      await sendReminders(
        sendEmailToSignatoryForOrganizationApproval,
        testContext
      );

      expect(mockSendEmail).toHaveBeenCalledTimes(2);
      expect(mockSendEmail.mock.calls).toEqual(
        expect.arrayContaining([
          [expectedSignatoryReminderEmail(organization2, caoOrganization)],
          [expectedSignatoryReminderEmail(organization1, caoOrganization)],
        ])
      );

      const signatoryReminderDb = await signatoryStatusRepo.findOne({
        filter: {
          _id: new ObjectId(signatoryReminder3._id),
        },
      });
      expect(signatoryReminderDb).toEqual({
        _id: expect.any(ObjectId),
        organizationDid: expect.any(String),
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: expect.any(Date),
          },
        ],
        authCodes: [
          {
            code: '12345',
            timestamp: expect.any(Date),
          },
        ],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      const signatoryReminderDb1 = await signatoryStatusRepo.findOne({
        filter: {
          _id: new ObjectId(signatoryReminder1._id),
        },
      });
      expect(signatoryReminderDb1).toEqual({
        _id: expect.any(ObjectId),
        organizationDid: organization1.didDoc.id,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: expect.any(Date),
          },
          {
            state: SignatoryEventStatus.REMINDER_SENT,
            timestamp: expect.any(Date),
          },
        ],
        authCodes: [
          {
            code: '12345',
            timestamp: expect.any(Date),
          },
          {
            code: '1',
            timestamp: expect.any(Date),
          },
        ],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      const signatoryReminderDb2 = await signatoryStatusRepo.findOne({
        filter: {
          _id: new ObjectId(signatoryReminder2._id),
        },
      });
      expect(signatoryReminderDb2).toEqual({
        _id: expect.any(ObjectId),
        organizationDid: organization2.didDoc.id,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: expect.any(Date),
          },
          {
            state: SignatoryEventStatus.REMINDER_SENT,
            timestamp: expect.any(Date),
          },
        ],
        authCodes: [
          {
            code: '12345',
            timestamp: expect.any(Date),
          },
          {
            code: '1',
            timestamp: expect.any(Date),
          },
        ],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should not send emails if there are reminder with reminder sent state', async () => {
      const organization = await persistOrganization();
      await persistSignatoryStatus({
        organization,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: subDays(7)(new Date()),
          },
          {
            state: SignatoryEventStatus.REMINDER_SENT,
            timestamp: new Date(),
          },
        ],
      });
      await sendReminders(
        sendEmailToSignatoryForOrganizationApproval,
        testContext
      );
      expect(mockSendEmail).toHaveBeenCalledTimes(0);
    });

    it('should not send emails if there are signatory reminders with approved state', async () => {
      const organization = await persistOrganization();
      await persistSignatoryStatus({
        organization,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: subDays(7)(new Date()),
          },
          {
            state: SignatoryEventStatus.APPROVED,
            timestamp: new Date(),
          },
        ],
        approvedAt: new Date(),
      });
      await sendReminders(
        sendEmailToSignatoryForOrganizationApproval,
        testContext
      );
      expect(mockSendEmail).toHaveBeenCalledTimes(0);
    });

    it('should not send emails if there are signatory reminders with rejected state', async () => {
      const organization = await persistOrganization();
      await persistSignatoryStatus({
        organization,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: subDays(7)(new Date()),
          },
          {
            state: SignatoryEventStatus.REJECTED,
            timestamp: new Date(),
          },
        ],
        rejectedAt: new Date(),
      });
      await sendReminders(
        sendEmailToSignatoryForOrganizationApproval,
        testContext
      );
      expect(mockSendEmail).toHaveBeenCalledTimes(0);
    });

    it('should not send emails if there are signatory reminders but email sent less than 7 days ago', async () => {
      const organization = await persistOrganization();
      await persistSignatoryStatus({
        organization,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: subDays(6)(new Date()),
          },
        ],
      });
      await sendReminders(
        sendEmailToSignatoryForOrganizationApproval,
        testContext
      );
      expect(mockSendEmail).toHaveBeenCalledTimes(0);
    });

    it('should not send emails if sending fail', async () => {
      const caoOrganization = await persistOrganization();
      const organization = await persistOrganization({
        service: [
          {
            id: '#iss-1',
            type: ServiceTypes.ContactIssuerType,
            serviceEndpoint: `${caoOrganization.didDoc.id}#cao-1`,
          },
        ],
      });
      const signatoryReminder = await persistSignatoryStatus({
        organization,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: subDays(7)(new Date()),
          },
        ],
      });
      mockSendEmail.mockRejectedValueOnce(new Error('Failed to send email'));
      await sendReminders(
        sendEmailToSignatoryForOrganizationApproval,
        testContext
      );
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      const signatoryReminderDb = await signatoryStatusRepo.findOne({
        filter: {
          _id: new ObjectId(signatoryReminder._id),
        },
      });
      expect(signatoryReminderDb).toEqual({
        _id: expect.any(ObjectId),
        organizationDid: organization.didDoc.id,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: expect.any(Date),
          },
          {
            state: SignatoryEventStatus.REMINDER_ERROR,
            timestamp: expect.any(Date),
          },
        ],
        authCodes: [
          {
            code: '12345',
            timestamp: expect.any(Date),
          },
        ],
        error: 'Failed to send email',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should not send emails if org mark as soft deleted', async () => {
      const organization = await persistOrganization({
        deletedAt: new Date(),
      });
      const signatoryReminder = await persistSignatoryStatus({
        organization,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: subDays(7)(new Date()),
          },
        ],
      });
      await sendReminders(
        sendEmailToSignatoryForOrganizationApproval,
        testContext
      );
      expect(mockSendEmail).toHaveBeenCalledTimes(0);
      const signatoryReminderDb = await signatoryStatusRepo.findOne({
        filter: {
          _id: new ObjectId(signatoryReminder._id),
        },
      });
      expect(signatoryReminderDb).toEqual({
        _id: expect.any(ObjectId),
        organizationDid: organization.didDoc.id,
        events: [
          {
            state: SignatoryEventStatus.EMAIL_SENT,
            timestamp: expect.any(Date),
          },
          {
            state: SignatoryEventStatus.REMINDER_ERROR,
            timestamp: expect.any(Date),
          },
        ],
        authCodes: [
          {
            code: '12345',
            timestamp: expect.any(Date),
          },
        ],
        error: 'Organization not found',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
});
