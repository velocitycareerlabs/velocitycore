/**
 * Created by Michael Avoyan on 03/06/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import VCLDeepLink from '../../../api/entities/VCLDeepLink';
import CredentialsByDeepLinkVerifier from '../../domain/verifiers/CredentialsByDeepLinkVerifier';
import VCLJwt from '../../../api/entities/VCLJwt';
import VCLLog from '../../utils/VCLLog';
import VCLError from '../../../api/entities/error/VCLError';
import VCLErrorCode from '../../../api/entities/error/VCLErrorCode';

export default class CredentialsByDeepLinkVerifierImpl
    implements CredentialsByDeepLinkVerifier
{
    async verifyCredentials(
        jwtCredentials: VCLJwt[],
        deepLink: VCLDeepLink
    ): Promise<boolean> {
        const mismatchedCredential = jwtCredentials.find(
            (credential) => credential.iss !== deepLink.did
        );

        if (mismatchedCredential) {
            const errorMsg = `mismatched credential: ${mismatchedCredential.encodedJwt} \ndeepLink: ${deepLink.value}`;
            VCLLog.error(errorMsg);
            throw new VCLError(
                errorMsg,
                VCLErrorCode.MismatchedCredentialIssuerDid
            );
        } else {
            return true;
        }
    }
}
