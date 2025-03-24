import VCLCredentialManifest from '../../../api/entities/VCLCredentialManifest';
import VCLCredentialManifestDescriptor from '../../../api/entities/VCLCredentialManifestDescriptor';
import VCLError from '../../../api/entities/error/VCLError';
import VCLPublicJwk from '../../../api/entities/VCLPublicJwk';
import VCLJwt from '../../../api/entities/VCLJwt';
import CredentialManifestRepository from '../../domain/repositories/CredentialManifestRepository';
import JwtServiceRepository from '../../domain/repositories/JwtServiceRepository';
import ResolveKidRepository from '../../domain/repositories/ResolveKidRepository';
import CredentialManifestUseCase from '../../domain/usecases/CredentialManifestUseCase';
import VCLVerifiedProfile from '../../../api/entities/VCLVerifiedProfile';
import CredentialManifestByDeepLinkVerifier from '../../domain/verifiers/CredentialManifestByDeepLinkVerifier';
import VCLLog from '../../utils/VCLLog';

export default class CredentialManifestUseCaseImpl
    implements CredentialManifestUseCase
{
    constructor(
        private readonly credentialManifestRepository: CredentialManifestRepository,
        private readonly resolveKidRepository: ResolveKidRepository,
        private readonly jwtServiceRepository: JwtServiceRepository,
        private readonly credentialManifestByDeepLinkVerifier: CredentialManifestByDeepLinkVerifier
    ) {}

    async getCredentialManifest(
        credentialManifestDescriptor: VCLCredentialManifestDescriptor,
        verifiedProfile: VCLVerifiedProfile
    ): Promise<VCLCredentialManifest> {
        try {
            const jwtStr =
                await this.credentialManifestRepository.getCredentialManifest(
                    credentialManifestDescriptor
                );
            if (jwtStr) {
                return this.onGetCredentialManifestSuccess(
                    new VCLCredentialManifest(
                        VCLJwt.fromEncodedJwt(jwtStr!),
                        credentialManifestDescriptor.vendorOriginContext,
                        verifiedProfile,
                        credentialManifestDescriptor.deepLink,
                        credentialManifestDescriptor.didJwk,
                        credentialManifestDescriptor.remoteCryptoServicesToken
                    )
                );
            }
            throw new VCLError('Empty jwtStr');
        } catch (error: any) {
            throw VCLError.fromError(error);
        }
    }

    async onGetCredentialManifestSuccess(
        credentialManifest: VCLCredentialManifest
    ): Promise<VCLCredentialManifest> {
        if (credentialManifest.deepLink !== null) {
            const isVerified =
                await this.credentialManifestByDeepLinkVerifier.verifyCredentialManifest(
                    credentialManifest,
                    credentialManifest.deepLink!
                );
            VCLLog.info(
                `Credential manifest deep link verification result: ${isVerified}`
            );
        } else {
            VCLLog.info('Deep link was not provided => nothing to verify');
        }
        return this.onCredentialManifestDidVerificationSuccess(
            credentialManifest
        );
    }

    async onCredentialManifestDidVerificationSuccess(
        credentialManifest: VCLCredentialManifest
    ): Promise<VCLCredentialManifest> {
        const kid = credentialManifest.jwt.kid?.replace(
            '#',
            encodeURIComponent('#')
        );
        if (!kid) {
            throw new VCLError('Empty kid');
        }
        const publicKey = await this.resolveKidRepository.getPublicKey(kid);

        return this.onResolvePublicKeySuccess(publicKey, credentialManifest);
    }

    async onResolvePublicKeySuccess(
        publicJwk: VCLPublicJwk,
        credentialManifest: VCLCredentialManifest
    ): Promise<VCLCredentialManifest> {
        const isVerified = await this.jwtServiceRepository.verifyJwt(
            credentialManifest.jwt,
            publicJwk,
            credentialManifest.remoteCryptoServicesToken
        );
        return this.onVerificationSuccess(isVerified, credentialManifest);
    }

    async onVerificationSuccess(
        isVerified: boolean,
        credentialManifest: VCLCredentialManifest
    ): Promise<VCLCredentialManifest> {
        if (isVerified) {
            return credentialManifest;
        }
        throw new VCLError(
            `Failed to verify credentialManifest jwt:\n${credentialManifest.jwt}`
        );
    }
}
