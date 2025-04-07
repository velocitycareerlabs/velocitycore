/**
 * Created by Michael Avoyan on 14/07/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  VCLAuthToken,
  VCLExchangeDescriptor,
} from '@velocitycareerlabs/vnf-nodejs-wallet-sdk';
import {
  presentationRequestDescriptorFrom,
  presentationSubmissionFrom,
  submissionResultFrom,
} from '../utils/Converter';

export default async function inspectionRoutes(fastify) {
  fastify.post('/getPresentationRequest', async (req, reply) => {
    reply.send(
      await req.vclSdk.getPresentationRequest(
        presentationRequestDescriptorFrom(req.body)
      )
    );
  });
  fastify.post('/submitPresentation', async (req, reply) => {
    reply.send(
      await req.vclSdk.submitPresentation(
        presentationSubmissionFrom(req.body.presentationSubmission),
        new VCLAuthToken(req.body.authToken.payload)
      )
    );
  });
  fastify.post('/getExchangeProgress', async (req, reply) => {
    reply.send(
      await req.vclSdk.getExchangeProgress(
        new VCLExchangeDescriptor(
          presentationSubmissionFrom(req.body.presentationSubmission),
          submissionResultFrom(req.body.submissionResult)
        )
      )
    );
  });
}
