import VCLJwtSignService from '../../jwt/VCLJwtSignService';
import VCLJwtVerifyService from '../../jwt/VCLJwtVerifyService';
import VCLKeyService from '../../keys/VCLKeyService';

export default class VCLCryptoServicesDescriptor {
    constructor(
        public readonly keyService: VCLKeyService,
        public readonly jwtSignService: VCLJwtSignService,
        public readonly jwtVerifyService: VCLJwtVerifyService
    ) {}
}
