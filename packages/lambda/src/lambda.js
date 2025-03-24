const { MongoClient } = require('mongodb');
const { initLambdaContext } = require('./init-lambda');

const lambdaHandler = (handler, options) => {
  if (!handler) throw new Error('Lambda handler is required');

  return async (event) => {
    const lambdaContext = await initLambdaContext(options);
    const {
      log,
      config: { mongoConnection },
    } = lambdaContext;

    let client;
    let dbConnection;

    if (mongoConnection) {
      client = await MongoClient.connect(mongoConnection);
      dbConnection = client.db();
    }

    log.info(event);

    try {
      const result = await handler(event, {
        ...lambdaContext,
        dbConnection,
        client,
      });
      return result;
    } finally {
      if (client) await client.close();
    }
  };
};
module.exports = { lambdaHandler };
