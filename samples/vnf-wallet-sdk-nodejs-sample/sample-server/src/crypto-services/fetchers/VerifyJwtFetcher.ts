/**
 * Created by Michael Avoyan on 24/06/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  VCLPublicJwk,
  VCLJwt,
  Nullish,
  Dictionary,
} from '@velocitycareerlabs/vnf-nodejs-wallet-sdk/src';
import { getJwtVerifyServiceUrl } from './Urls';
import { CurrentEnvironment } from '../../GlobalConfig';
import fetcher from './Fetcher';

export const verifyJwtFetcher = async (
  jwt: VCLJwt,
  publicJwk: Nullish<VCLPublicJwk>
): Promise<Dictionary<any>> => {
  const config = {
    url: getJwtVerifyServiceUrl(CurrentEnvironment),
    method: 'POST',
    data: {
      jwt: jwt.encodedJwt,
      publicKey: publicJwk?.valueJson || {},
    },
  };
  return fetcher(config);
};
