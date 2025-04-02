/**
 * Created by Michael Avoyan on 14/07/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  credentialManifestDescriptorFrom,
  finalizeOffersDescriptorFrom,
  generateOffersDescriptorFrom,
  tokenFrom,
} from '../utils/Converter';

export default async function issuingRoutes(fastify) {
  fastify.post('/getCredentialManifest', async (req, reply) => {
    reply.send(
      await req.vclSdk.getCredentialManifest(
        credentialManifestDescriptorFrom(req.body)
      )
    );
  });
  fastify.post('/generateOffers', async (req, reply) => {
    reply.send(
      await req.vclSdk.generateOffers(generateOffersDescriptorFrom(req.body))
    );
  });
  fastify.post('/checkOffers', async (req, reply) => {
    reply.send(
      await req.vclSdk.checkForOffers(
        generateOffersDescriptorFrom(req.body),
        tokenFrom(req.body.sessionToken)
      )
    );
  });
  fastify.post('/finalizeOffers', async (req, reply) => {
    reply.send(
      await req.vclSdk.finalizeOffers(
        finalizeOffersDescriptorFrom(req.body.finalizeOffersDescriptor),
        tokenFrom(req.body.sessionToken)
      )
    );
  });
}
