const { createTestServer } = require('@velocitycareerlabs/server-provider');
const {
  loadTestEnv,
  buildMongoConnection,
  // eslint-disable-next-line import/no-extraneous-dependencies
} = require('@velocitycareerlabs/tests-helpers');

loadTestEnv();

const mongoConnection = buildMongoConnection('test-mockvendor');
const { flow } = require('lodash/fp');
const config = require('../../src/config/config');
const { initServer } = require('../../src/init-server');

module.exports = () =>
  flow(createTestServer, initServer)({ ...config, mongoConnection });
