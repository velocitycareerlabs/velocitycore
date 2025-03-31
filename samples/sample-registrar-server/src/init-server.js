const { pick } = require('lodash/fp');
const { validationPlugin } = require('@velocitycareerlabs/validation');
const {
  corsPlugin,
  requestPlugin,
} = require('@velocitycareerlabs/fastify-plugins');
const { sendEmailPlugin } = require('@velocitycareerlabs/aws-clients');
const {
  authenticateVnfClientPlugin,
  rpcProviderPlugin,
} = require('@velocitycareerlabs/base-contract-io');
const basicAuth = require('@fastify/basic-auth');
const {
  oauthPlugin,
  initBasicAuthValidate,
} = require('@velocitycareerlabs/auth');
const {
  credentialTypesRegistrarEndpoints,
} = require('@velocitycareerlabs/endpoints-credential-types-registrar');
const {
  organizationRegistrarEndpoints,
} = require('@velocitycareerlabs/endpoints-organizations-registrar');
const {
  eventProcessingEndpoints,
} = require('@velocitycareerlabs/endpoints-event-processing');

const initServer = (server) => {
  if (!server.config.isTest) {
    server
      .register(oauthPlugin, {
        domain: server.config.auth0Domain,
        audience: [
          server.config.registrarApiAudience,
          server.config.oauthAudienceTokenApi,
        ],
      })
      .register(authenticateVnfClientPlugin)
      .register(basicAuth, {
        validate: initBasicAuthValidate(
          server.config.basicAuthUsername,
          server.config.basicAuthPassword
        ),
      });
  }

  return server
    .register(rpcProviderPlugin)
    .register(corsPlugin, {
      wildcardRoutes: ['/api/v0.6/organizations/search-profiles'],
    })
    .register(sendEmailPlugin)
    .register(validationPlugin, {
      ajv: server.config.validationPluginAjvOptions,
    })
    .addHook('preValidation', async (req) => {
      req.getDocValidator = server.getDocValidator;
    })
    .register(requestPlugin, {
      name: 'fetch',
      options: pick(
        ['nodeEnv', 'requestTimeout', 'traceIdHeader'],
        server.config
      ),
    })
    .register(requestPlugin, {
      name: 'fineractFetch',
      options: {
        ...server.config,
        clientId: server.config.auth0ClientId,
        clientSecret: server.config.auth0ClientSecret,
        tokensEndpoint: server.config.vnfOAuthTokensEndpoint,
        audience: server.config.oauthAudienceFineractApi,
        scopes: server.config.oauthScopesFineractApi,
        prefixUrl: server.config.fineractUrl,
        customHeaders: {
          'fineract-platform-tenantid': 'default',
        },
      },
    })
    .register(requestPlugin, {
      name: 'secureMessagesFetch',
      options: {
        ...pick(['nodeEnv', 'traceIdHeader'], server.config),
        requestTimeout: 20000,
      },
    })
    .register(requestPlugin, {
      name: 'betterUptimeFetch',
      options: {
        ...server.config,
        requestTimeout: server.config.requestTimeoutBetterUptimeFetch,
        bearerToken: server.config.monitoringApiToken,
        prefixUrl: server.config.monitoringApiBaseUrl,
      },
    })
    .register(requestPlugin, {
      name: 'serviceVersionFetch',
      options: {
        ...server.config,
        requestTimeout: server.config.requestTimeoutBetterUptimeFetch,
      },
    })
    .register(credentialTypesRegistrarEndpoints)
    .register(organizationRegistrarEndpoints)
    .register(eventProcessingEndpoints);
};

module.exports = { initServer };
