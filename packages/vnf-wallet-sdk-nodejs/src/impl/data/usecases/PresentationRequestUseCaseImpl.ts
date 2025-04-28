import VCLError from '../../../api/entities/error/VCLError';
import VCLPublicJwk from '../../../api/entities/VCLPublicJwk';
import VCLJwt from '../../../api/entities/VCLJwt';
import VCLPresentationRequest from '../../../api/entities/VCLPresentationRequest';
import VCLPresentationRequestDescriptor from '../../../api/entities/VCLPresentationRequestDescriptor';
import JwtServiceRepository from '../../domain/repositories/JwtServiceRepository';
import PresentationRequestRepository from '../../domain/repositories/PresentationRequestRepository';
import ResolveKidRepository from '../../domain/repositories/ResolveKidRepository';
import PresentationRequestUseCase from '../../domain/usecases/PresentationRequestUseCase';
import VCLVerifiedProfile from '../../../api/entities/VCLVerifiedProfile';
import PresentationRequestByDeepLinkVerifier from '../../domain/verifiers/PresentationRequestByDeepLinkVerifier';

export default class PresentationRequestUseCaseImpl
    implements PresentationRequestUseCase
{
    constructor(
        private presentationRequestRepository: PresentationRequestRepository,
        private resolveKidRepository: ResolveKidRepository,
        private jwtServiceRepository: JwtServiceRepository,
        private presentationRequestByDeepLinkVerifier: PresentationRequestByDeepLinkVerifier
    ) {}

    async getPresentationRequest(
        presentationRequestDescriptor: VCLPresentationRequestDescriptor,
        verifiedProfile: VCLVerifiedProfile
    ): Promise<VCLPresentationRequest> {
        try {
            const encodedJwtStr =
                await this.presentationRequestRepository.getPresentationRequest(
                    presentationRequestDescriptor
                );
            const jwt = await this.jwtServiceRepository.decode(encodedJwtStr);
            return this.onGetPresentationRequestSuccess(
                new VCLPresentationRequest(
                    jwt,
                    verifiedProfile,
                    presentationRequestDescriptor.deepLink,
                    presentationRequestDescriptor.pushDelegate,
                    presentationRequestDescriptor.didJwk,
                    presentationRequestDescriptor.remoteCryptoServicesToken
                )
            );
        } catch (error: any) {
            throw VCLError.fromError(error);
        }
    }

    async onGetPresentationRequestSuccess(
        presentationRequest: VCLPresentationRequest
    ): Promise<VCLPresentationRequest> {
        const kid = presentationRequest.jwt.kid?.replace(
            '#',
            encodeURIComponent('#')
        );
        if (!kid) {
            throw new VCLError('Empty kid');
        }
        const publicJwk = await this.resolveKidRepository.getPublicKey(kid);
        return this.onResolvePublicKeySuccess(publicJwk, presentationRequest);
    }

    async onResolvePublicKeySuccess(
        publicJwk: VCLPublicJwk,
        presentationRequest: VCLPresentationRequest
    ): Promise<VCLPresentationRequest> {
        const isVerified =
            (await this.jwtServiceRepository.verifyJwt(
                presentationRequest.jwt,
                publicJwk,
                presentationRequest.remoteCryptoServicesToken
            )) &&
            (await this.presentationRequestByDeepLinkVerifier.verifyPresentationRequest(
                presentationRequest,
                presentationRequest.deepLink
            ));
        return this.onVerificationSuccess(isVerified, presentationRequest);
    }

    async onVerificationSuccess(
        isVerified: boolean,
        presentationRequest: VCLPresentationRequest
    ): Promise<VCLPresentationRequest> {
        if (isVerified) {
            return presentationRequest;
        }
        throw new VCLError(
            `Failed  to verify: ${presentationRequest.jwt.payload}`
        );
    }
}
