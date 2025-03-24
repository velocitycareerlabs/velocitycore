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
const path = require('path');
const {
  map,
  flow,
  zip,
  range,
  forEach,
  isEmpty,
  values,
} = require('lodash/fp');
const { nanoid } = require('nanoid');
const fastifyView = require('@fastify/view');
const { appendSearchParam } = require('@velocitycareerlabs/common-functions');
const handlebars = require('handlebars');
const Error = require('http-errors');

const { createDeepLinkUrl, EXCHANGE_TYPE } = require('../../entities');

const appRedirectController = async (fastify) => {
  fastify.register(fastifyView, {
    engine: {
      handlebars,
    },
    root: path.join(__dirname, '../../assets/templates'),
  });
  fastify
    .get(
      '/',
      {
        schema: {
          description: 'Healthcheck and version info',
          responses: {
            200: {
              description: 'Successful response',
              content: { 'text/plain': { schema: { type: 'string' } } },
            },
          },
          tags: ['utilities'],
        },
      },
      async (req, reply) => {
        reply
          .status(200)
          .send(
            `Welcome to Credential APIs\nHost: ${fastify.config.hostUrl}\nVersion: ${fastify.config.version}\n`
          );
      }
    )
    .get(
      '/app-redirect',
      {
        schema: fastify.autoSchema({
          querystring: {
            type: 'object',
            properties: {
              exchange_type: {
                type: 'string',
                enum: values(EXCHANGE_TYPE),
              },
              request_uri: {
                type: 'array',
                items: { type: 'string' },
              },
              vendorOriginContext: {
                type: 'array',
                items: { type: 'string' },
              },
              inspectorDid: { type: 'array', items: { type: 'string' } },
            },
            required: ['request_uri', 'exchange_type'],
          },
          response: {
            200: {
              description: 'deep link redirection page',
              content: {
                'text/html': { schema: { type: 'string' } },
              },
            },
          },
        }),
      },
      async (req, reply) => {
        const {
          query: { exchange_type: exchangeType, inspectorDid },
        } = req;

        validateInspectorDid({ exchangeType, inspectorDid });

        const { deeplink } = processingLinks(req);

        const { libUrl } = fastify.config;

        const scriptUrl = `${libUrl}/vnf-wallet-selection/index.js`;
        const styleSheetUrl = `${libUrl}/vnf-wallet-selection/site.css`;
        const resourceNonce = nanoid();

        const cspScriptSrc = `script-src 'nonce-${resourceNonce}';`;
        const cspStyleSrc = `style-src 'nonce-${resourceNonce}';`;
        const csp = `${cspStyleSrc} ${cspScriptSrc}`;
        reply.header('Content-Security-Policy', csp);
        return reply.view('app-redirect', {
          deeplink,
          scriptUrl,
          scriptNonce: resourceNonce,
          styleSheetUrl,
        });
      }
    );
};

const validateInspectorDid = ({ exchangeType, inspectorDid }) => {
  if (exchangeType === EXCHANGE_TYPE.inspect && isEmpty(inspectorDid)) {
    throw new Error.BadRequest(
      'inspectorDid should be present for exchange_type = "inspect"'
    );
  }
  if (exchangeType === EXCHANGE_TYPE.issue && !isEmpty(inspectorDid)) {
    throw new Error.BadRequest(
      'inspectorDid should not be present for exchange_type = "issue"'
    );
  }
};

const processingLinks = (context) => {
  const {
    query: {
      exchange_type: exchangeType,
      request_uri: requestUriItems,
      inspectorDid: inspectorDidItems = [],
      vendorOriginContext: vendorOriginContextItems = [],
    },
  } = context;

  const parsedLinks = flow(
    (items) => zip(items, range(0, items.length)),
    map(([value, index]) => ({
      requestUri: value,
      vendorOriginContext: vendorOriginContextItems[index],
      inspectorDid: inspectorDidItems[index],
    }))
  )(requestUriItems);

  const deeplink = createDeepLinkUrl(exchangeType, context);
  forEach(({ requestUri, inspectorDid, vendorOriginContext }) => {
    flow(
      appendSearchParam('request_uri', requestUri),
      appendSearchParam('inspectorDid', inspectorDid),
      appendSearchParam('vendorOriginContext', vendorOriginContext)
    )(deeplink);
  }, parsedLinks);

  return { deeplink };
};

// eslint-disable-next-line better-mutation/no-mutation
appRedirectController.prefixOverride = '';

module.exports = appRedirectController;
