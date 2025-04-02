/**
 * Created by Michael Avoyan on 27/06/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import initializationRoutes from './Initialization';
import inspectionRoutes from './Inspection';
import issuingRoutes from './Issuing';
import cryptoServicesRoutes from './CryptoServices';
import selfReportRoutes from './SelfReport';
import otherRoutes from './Other';

export default async function routes(fastify) {
  initializationRoutes(fastify);
  inspectionRoutes(fastify);
  issuingRoutes(fastify);
  cryptoServicesRoutes(fastify);
  selfReportRoutes(fastify);
  otherRoutes(fastify);
}
