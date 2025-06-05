/**
 * Created by Michael Avoyan on 03/06/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import VCLPresentationRequest from '../../../api/entities/VCLPresentationRequest';
import VCLDeepLink from '../../../api/entities/VCLDeepLink';
import PresentationRequestByDeepLinkVerifier from '../../domain/verifiers/PresentationRequestByDeepLinkVerifier';
import VCLLog from '../../utils/VCLLog';
import VCLErrorCode from '../../../api/entities/error/VCLErrorCode';
import VCLError from '../../../api/entities/error/VCLError';
import VCLDidDocument from '../../../api/entities/VCLDidDocument';
import ResolveDidDocumentRepository from '../../domain/repositories/ResolveDidDocumentRepository';

export default class PresentationRequestByDeepLinkVerifierImpl
    implements PresentationRequestByDeepLinkVerifier
{
    constructor(
        private readonly resolveDidDocumentRepository: ResolveDidDocumentRepository
    ) {}

    async verifyPresentationRequest(
        presentationRequest: VCLPresentationRequest,
        deepLink: VCLDeepLink
    ): Promise<boolean> {
        if (deepLink.did === null) {
            await this.onError(`DID not found in deep link: ${deepLink.value}`);
            return false;
        }
        const didDocument =
            await this.resolveDidDocumentRepository.resolveDidDocument(
                deepLink.did!
            );
        return this.verify(presentationRequest, didDocument);
    }

    private async verify(
        presentationRequest: VCLPresentationRequest,
        didDocument: VCLDidDocument
    ): Promise<boolean> {
        if (
            didDocument.id === presentationRequest.iss ||
            didDocument.alsoKnownAs.includes(presentationRequest.iss)
        ) {
            return true;
        }
        await this.onError(
            `mismatched presentation request: ${presentationRequest.jwt.encodedJwt} \ndidDocument: ${didDocument}`,
            VCLErrorCode.MismatchedPresentationRequestInspectorDid
        );
        return false;
    }

    private async onError(
        errorMessage: string,
        errorCode: VCLErrorCode = VCLErrorCode.SdkError
    ) {
        VCLLog.error(errorMessage);
        throw new VCLError(null, errorCode, null, errorMessage);
    }
}
