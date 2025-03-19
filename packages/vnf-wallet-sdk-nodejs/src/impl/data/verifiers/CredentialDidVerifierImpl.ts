/**
 * Created by Michael Avoyan on 03/06/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import CredentialDidVerifier from '../../domain/verifiers/CredentialDidVerifier';
import VCLJwtVerifiableCredentials from '../../../api/entities/VCLJwtVerifiableCredentials';
import VCLJwt from '../../../api/entities/VCLJwt';
import VCLFinalizeOffersDescriptor from '../../../api/entities/VCLFinalizeOffersDescriptor';

export default class CredentialDidVerifierImpl
    implements CredentialDidVerifier
{
    async verifyCredentials(
        jwtCredentials: VCLJwt[],
        finalizeOffersDescriptor: VCLFinalizeOffersDescriptor
    ): Promise<VCLJwtVerifiableCredentials> {
        const passedCredentials: VCLJwt[] = [];
        const failedCredentials: VCLJwt[] = [];

        jwtCredentials.forEach((jwtCredential: VCLJwt) => {
            if (
                this.verifyCredential(
                    jwtCredential,
                    finalizeOffersDescriptor.issuerId
                )
            ) {
                passedCredentials.push(jwtCredential);
            } else {
                failedCredentials.push(jwtCredential);
            }
        });
        return new VCLJwtVerifiableCredentials(
            passedCredentials,
            failedCredentials
        );
    }

    verifyCredential(jwtCredential: VCLJwt, issuerId: string): boolean {
        return jwtCredential.payload.iss === issuerId;
    }
}
