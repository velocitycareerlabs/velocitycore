/**
 * Created by Michael Avoyan on 03/06/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import VCLCredentialManifest from '../../../api/entities/VCLCredentialManifest';
import VCLDeepLink from '../../../api/entities/VCLDeepLink';
import CredentialManifestByDeepLinkVerifier from '../../domain/verifiers/CredentialManifestByDeepLinkVerifier';
import VCLLog from '../../utils/VCLLog';
import VCLError from '../../../api/entities/error/VCLError';
import VCLErrorCode from '../../../api/entities/error/VCLErrorCode';

export default class CredentialManifestByDeepLinkVerifierImpl
    implements CredentialManifestByDeepLinkVerifier
{
    async verifyCredentialManifest(
        credentialManifest: VCLCredentialManifest,
        deepLink: VCLDeepLink
    ): Promise<boolean> {
        if (credentialManifest.issuerId === deepLink.did) {
            return true;
        }
        const errorMsg = `mismatched credential manifest: ${credentialManifest.jwt.encodedJwt} \ndeepLink: ${deepLink.value}`;
        VCLLog.error(errorMsg);
        throw new VCLError(errorMsg, VCLErrorCode.MismatchedRequestIssuerDid);
    }
}
