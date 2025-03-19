import env from 'env-var';

type ConfigType = {
  nodeEnv: string;
};

const config: ConfigType = {
  nodeEnv: env.get('NODE_ENV').required().asString(),
};

export { config };
