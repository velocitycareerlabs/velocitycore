/**
 * Created by Michael Avoyan on 14/07/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

export default async function initializationRoutes(fastify) {
  fastify.get('/getCountries', (req, reply) => {
    reply.send(req.vclSdk.countries);
  });
  fastify.get('/getCredentialTypes', (req, reply) => {
    reply.send(req.vclSdk.credentialTypes);
  });
  fastify.get('/getCredentialTypeSchemas', (req, reply) => {
    reply.send(req.vclSdk.credentialTypeSchemas);
  });
}
