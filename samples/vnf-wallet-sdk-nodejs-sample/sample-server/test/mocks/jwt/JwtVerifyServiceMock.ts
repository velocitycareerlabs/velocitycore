import {
  Nullish,
  VCLJwt,
  VCLJwtVerifyService,
  VCLPublicJwk,
} from '@velocitycareerlabs/vnf-nodejs-wallet-sdk/src';

export class JwtVerifyServiceMock implements VCLJwtVerifyService {
  async verify(
    jwt: VCLJwt,
    publicJwk: Nullish<VCLPublicJwk>
  ): Promise<boolean> {
    return true;
  }
}
