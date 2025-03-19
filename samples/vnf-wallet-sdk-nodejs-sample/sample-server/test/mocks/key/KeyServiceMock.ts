/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  VCLDidJwk,
  VCLDidJwkDescriptor,
  VCLKeyService,
} from '@velocitycareerlabs/vnf-nodejs-wallet-sdk/src';
import { DidJwkMocks } from '../DidJwkMocks';

export class KeyServiceMock implements VCLKeyService {
  async generateDidJwk(
    didJwkDescriptor: VCLDidJwkDescriptor
  ): Promise<VCLDidJwk> {
    return DidJwkMocks.DidJwk;
  }
}
