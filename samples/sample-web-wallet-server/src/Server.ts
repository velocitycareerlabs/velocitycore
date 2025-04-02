import cors from '@fastify/cors';
import build from './App';
import vclSdkPlugin from './plugins/VclSdkPlugin';
import { GlobalConfig } from './GlobalConfig';

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
  logger: GlobalConfig.nodeEnv === 'dev' ? devLogger : true,
  pluginTimeout: 0,
});

const initialize = () => {
  app.register(vclSdkPlugin);
  app.register(cors);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.listen(
    { port: GlobalConfig.port, host: GlobalConfig.host },
    (err: any, address: any) => {
      if (err) {
        console.error(err);
        console.error(address);
        process.exit(1);
      }
      console.log(`Server listening at ${address}`);
    }
  );
};

initialize();
