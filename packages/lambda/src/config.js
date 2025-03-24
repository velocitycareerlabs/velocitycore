const env = require('env-var');
const packageJson = require('../package.json');

const nodeEnv = env.get('NODE_ENV').required().asString();
const isTest = nodeEnv === 'test';
const isDev = nodeEnv === 'development';

module.exports = {
  logSeverity: env.get('LOG_SEVERITY').default('info').asString(),
  nodeEnv,
  isProd: nodeEnv === 'production',
  isDev,
  isTest,
  version: packageJson.version,
};
