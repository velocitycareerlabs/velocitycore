/**
 * Created by Michael Avoyan on 03/06/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import VCLDeepLink from '../../../api/entities/VCLDeepLink';
import VCLJwt from '../../../api/entities/VCLJwt';

export default interface CredentialsByDeepLinkVerifier {
    verifyCredentials(
        jwtCredentials: VCLJwt[],
        deepLink: VCLDeepLink
    ): Promise<boolean>;
}
