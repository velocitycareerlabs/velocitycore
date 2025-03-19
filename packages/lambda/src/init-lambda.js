const { loggerProvider } = require('@velocitycareerlabs/logger');
const {
  initSendEmailNotification,
} = require('@velocitycareerlabs/aws-clients');

const initLambdaContext = async ({ config }) => {
  const { nodeEnv, logSeverity, awsRegion, awsEndpoint, version } = config;
  let sendEmail;

  const log = loggerProvider({ nodeEnv, logSeverity, version });

  if (awsRegion || awsEndpoint) {
    sendEmail = initSendEmailNotification({ awsRegion, awsEndpoint });
  }

  log.info(config, 'Lambda Configured');

  return {
    config,
    log,
    sendEmail,
  };
};

module.exports = { initLambdaContext };
