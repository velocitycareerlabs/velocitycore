/**
 * Created by Michael Avoyan on 30/03/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { authTokenDescriptorFrom } from '../utils/Converter';

export default async function authTokenRoutes(fastify) {
  fastify.post('/getAuthToken', async (req, reply) => {
    reply.send(
      await req.vclSdk.getAuthToken(authTokenDescriptorFrom(req.body))
    );
  });
}
