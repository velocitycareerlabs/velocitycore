/**
 * Created by Michael Avoyan on 14/07/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  organizationsSearchDescriptorFrom,
  verifiedProfileDescriptorFrom,
} from '../utils/Converter';

export default async function otherRoutes(fastify) {
  fastify.post('/searchForOrganizations', async (req, reply) => {
    reply.send(
      await req.vclSdk.searchForOrganizations(
        organizationsSearchDescriptorFrom(req.body)
      )
    );
  });
  fastify.post('/getVerifiedProfile', async (req, reply) => {
    reply.send(
      await req.vclSdk.getVerifiedProfile(
        verifiedProfileDescriptorFrom(req.body)
      )
    );
  });
}
