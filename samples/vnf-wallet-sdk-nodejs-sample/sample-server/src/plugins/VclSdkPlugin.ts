/**
 * Created by Michael Avoyan on 14/07/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import fastifyPlugin from 'fastify-plugin';
import {
  VCLCryptoServicesDescriptor,
  VCLInitializationDescriptor,
  VCLProvider,
} from '@velocitycareerlabs/vnf-nodejs-wallet-sdk';
import {
  JwtSignServiceImpl,
  JwtVerifyServiceImpl,
  KeyServiceImpl,
} from '../crypto-services';
import { GlobalConfig } from '../GlobalConfig';

const vclSdkPlugin = async (fastify: any) => {
  const vclSdk = VCLProvider.getInstance();

  const initializationDescriptor = new VCLInitializationDescriptor(
    GlobalConfig.environment,
    GlobalConfig.xVnfProtocolVersion,
    new VCLCryptoServicesDescriptor(
      new KeyServiceImpl(),
      new JwtSignServiceImpl(),
      new JwtVerifyServiceImpl()
    ),
    GlobalConfig.isDebugOn
  );

  try {
    await vclSdk.initialize(initializationDescriptor);
    // eslint-disable-next-line
    console.log('VCL SDK initialized successfully');
    fastify.decorate('vclSdk', vclSdk);
    const addHooks = async (req, reply) => {
      req.vclSdk = vclSdk;
      reply.vclSdk = vclSdk;
    };
    fastify.addHook('preHandler', addHooks);
  } catch (e) {
    console.error('Failed to initialize VCL SDK', e);
    throw e;
  }
};

export default fastifyPlugin(vclSdkPlugin, {
  fastify: '>=2.0.0',
  name: 'vclSdkPlugin',
});
