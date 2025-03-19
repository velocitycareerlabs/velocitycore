const { buildMongoConnection } = require('@velocitycareerlabs/tests-helpers');
require('./helpers/setup');
const env = require('env-var');
const { lambdaHandler } = require('../src');
const config = require('../src/config');

const mongoConnection = buildMongoConnection('test-lambda');
const awsRegion = env.get('AWS_REGION').asString();
const awsEndpoint = env.get('AWS_ENDPOINT').asString();

describe('Credit distribution test suite', () => {
  beforeAll(async () => {});

  it('should call lambda handler', async () => {
    const eventName = 'abc123';
    let expectedEvent;
    let expectedContext;
    await lambdaHandler(
      (event, context) => {
        expectedEvent = event;
        expectedContext = context;
        Promise.resolve();
      },
      { config }
    )(eventName);
    expect(expectedEvent).toEqual(eventName);
    expect(expectedContext).toStrictEqual({
      client: undefined,
      config: expect.any(Object),
      dbConnection: undefined,
      log: expect.any(Object),
      sendEmail: undefined,
    });
  });

  it('should call lambda handler and create mongo connection', async () => {
    const eventName = 'abc123';
    let expectedEvent;
    let expectedContext;
    await lambdaHandler(
      (event, context) => {
        expectedEvent = event;
        expectedContext = context;
        Promise.resolve();
      },
      { config: { ...config, mongoConnection, awsRegion, awsEndpoint } }
    )(eventName);
    expect(expectedEvent).toEqual(eventName);
    expect(expectedContext).toStrictEqual({
      client: expect.any(Object),
      config: expect.any(Object),
      dbConnection: expect.any(Object),
      log: expect.any(Object),
      sendEmail: expect.any(Function),
    });
  });
});
