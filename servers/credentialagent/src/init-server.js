/**
 * Copyright 2023 Velocity Team
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
 */

const initRequest = require('@velocitycareerlabs/request');
const Static = require('@fastify/static');
const fastifyRoutes = require('@fastify/routes');
const { adminJwtAuthPlugin } = require('@velocitycareerlabs/auth');
const {
  vnfProtocolVersionPlugin,
} = require('@velocitycareerlabs/fastify-plugins');
const {
  authenticateVnfClientPlugin,
  rpcProviderPlugin,
} = require('@velocitycareerlabs/base-contract-io');
const { validationPlugin } = require('@velocitycareerlabs/validation');
const { pick, omit } = require('lodash/fp');
const path = require('path');
const { autoloadRepos, validateCaoPlugin } = require('./plugins');
const {
  autoloadHolderApiControllers,
  autoloadOperatorApiControllers,
  autoloadRootApiController,
  autoloadSaasoperatorApiControllers,
} = require('./controllers');

const convertOldPath = {
  '/test-integration': '/test-integration',
  '/issuing/identify': '/issuing/identify',
  '/issuing/generate-offers': '/offers/generate',
  '/inspection/find-or-create-applicant': '/applicant',
  '/inspection/add-credentials-to-applicant': '/applicant/addCredentials',
};

const initMapVendorUrl = (config) => {
  if (config.vendorVersion < 0.6) {
    return (oldPath) => convertOldPath[oldPath];
  }
  return undefined;
};

const initServer = (server) => {
  if (!server.config.isTest) {
    server.register(adminJwtAuthPlugin).register(authenticateVnfClientPlugin);
  }

  return server
    .addContentTypeParser('*', (req, payload, done) => {
      let data = '';
      // eslint-disable-next-line better-mutation/no-mutation,no-return-assign
      payload.on('data', (chunk) => (data += chunk));
      payload.on('end', () => {
        done(null, data);
      });
    })
    .register(rpcProviderPlugin)
    .register(vnfProtocolVersionPlugin)
    .register(validationPlugin, {
      ajv: server.config.validationPluginAjvOptions,
    })
    .register(fastifyRoutes)
    .register(autoloadRepos, { path: `${__dirname}/entities` })
    .register(autoloadOperatorApiControllers)
    .register(autoloadHolderApiControllers)
    .register(autoloadRootApiController)
    .register(autoloadSaasoperatorApiControllers)
    .decorate(
      'baseVendorFetch',
      initRequest({
        ...omit(['bearerToken'], server.config),
        mapUrl: initMapVendorUrl(server.config),
        prefixUrl: server.config.vendorUrl,
      })
    )
    .decorate(
      'baseRegistrarFetch',
      initRequest({
        ...pick(['nodeEnv', 'requestTimeout', 'traceIdHeader'], server.config),
        prefixUrl: server.config.oracleUrl,
      })
    )
    .decorate(
      'baseUniversalResolverFetch',
      initRequest({
        ...pick(['nodeEnv', 'requestTimeout', 'traceIdHeader'], server.config),
        prefixUrl: server.config.universalResolverUrl,
      })
    )
    .decorate(
      'baseFetch',
      initRequest({
        ...pick(['nodeEnv', 'requestTimeout', 'traceIdHeader'], server.config),
      })
    )
    .decorate(
      'baseLibFetch',
      initRequest({
        ...pick(['nodeEnv', 'requestTimeout', 'traceIdHeader'], server.config),
        prefixUrl: server.config.libUrl,
      })
    )
    .register(Static, {
      root: path.join(__dirname, 'assets/public'),
      prefix: '/public',
      wildcard: false,
    })
    .register(validateCaoPlugin);
};

module.exports = { initServer };
