import cors from '@fastify/cors';
import { config } from './utils/Config';
import build from './App';
import vclSdkPlugin from './plugins/VclSdkPlugin';

const devLogger = {
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
};

const app: any = build({
  logger: config.nodeEnv === 'development' ? devLogger : true,
  pluginTimeout: 0,
});

const initialize = () => {
  app.register(vclSdkPlugin);
  app.register(cors);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.listen({ port: 5000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    // console.log(`Server listening at ${address}`);
  });
};

initialize();
