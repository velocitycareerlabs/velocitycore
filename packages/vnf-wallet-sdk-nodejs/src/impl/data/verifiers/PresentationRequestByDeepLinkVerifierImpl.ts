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

export default class PresentationRequestByDeepLinkVerifierImpl
    implements PresentationRequestByDeepLinkVerifier
{
    async verifyPresentationRequest(
        presentationRequest: VCLPresentationRequest,
        deepLink: VCLDeepLink
    ): Promise<boolean> {
        if (presentationRequest.iss === deepLink.did) {
            return true;
        }
        const errorMsg = `mismatched presentation request: ${presentationRequest.jwt.encodedJwt} \ndeepLink: ${deepLink.value}`;
        VCLLog.error(errorMsg);
        throw new VCLError(
            errorMsg,
            VCLErrorCode.MismatchedPresentationRequestInspectorDid
        );
    }
}
