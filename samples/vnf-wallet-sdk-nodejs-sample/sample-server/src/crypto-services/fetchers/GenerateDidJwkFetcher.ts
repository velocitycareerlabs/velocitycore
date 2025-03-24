/**
 * Created by Michael Avoyan on 24/06/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Dictionary,
  VCLDidJwkDescriptor,
} from '@velocitycareerlabs/vnf-nodejs-wallet-sdk/src';
import { getCreateDidKeyServiceUrl } from './Urls';
import { CurrentEnvironment } from '../../GlobalConfig';
import fetcher from './Fetcher';

export const generateDidJwkFetcher = async (
  didJwkDescriptor: VCLDidJwkDescriptor
): Promise<Dictionary<any>> => {
  const config = {
    url: getCreateDidKeyServiceUrl(CurrentEnvironment),
    method: 'POST',
    data: {
      crv: `${didJwkDescriptor.signatureAlgorithm}`,
      didMethod: 'did:jwk',
    },
  };
  return fetcher(config);
};
