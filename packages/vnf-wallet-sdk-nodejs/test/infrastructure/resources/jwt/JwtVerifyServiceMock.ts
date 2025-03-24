/* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars,unused-imports/no-unused-vars */
import {
    Nullish,
    VCLJwt,
    VCLJwtVerifyService,
    VCLPublicJwk,
} from '../../../../src';

export class JwtVerifyServiceMock implements VCLJwtVerifyService {
    async verify(
        jwt: VCLJwt,
        publicJwk: Nullish<VCLPublicJwk>
    ): Promise<boolean> {
        return true;
    }
}
