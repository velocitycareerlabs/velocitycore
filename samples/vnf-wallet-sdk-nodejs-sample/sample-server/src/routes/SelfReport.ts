/**
 * Created by Michael Avoyan on 14/07/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { credentialTypesUIFormSchemaDescriptorFrom } from '../utils/Converter';

export default async function selfReportRoutes(fastify) {
  fastify.post('/getCredentialTypesUIFormSchema', async (req, reply) => {
    reply.send(
      await req.vclSdk.getCredentialTypesUIFormSchema(
        credentialTypesUIFormSchemaDescriptorFrom(req.body)
      )
    );
  });
}
