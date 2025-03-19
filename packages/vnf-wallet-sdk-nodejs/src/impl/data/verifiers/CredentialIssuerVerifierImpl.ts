/**
 * Created by Michael Avoyan on 03/06/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { verifyIssuerForCredentialType } from '@velocitycareerlabs/vc-checks';
import VCLJwt from '../../../api/entities/VCLJwt';
import VCLFinalizeOffersDescriptor from '../../../api/entities/VCLFinalizeOffersDescriptor';
import CredentialIssuerVerifier from '../../domain/verifiers/CredentialIssuerVerifier';
import { loadJsonldContext } from '../../utils/LoadJsonldContext';
import NetworkService from '../../domain/infrastructure/network/NetworkService';
import CredentialTypesModel from '../../domain/models/CredentialTypesModel';

export default class CredentialIssuerVerifierImpl
    implements CredentialIssuerVerifier
{
    constructor(
        private credentialTypesModel: CredentialTypesModel,
        private networkService: NetworkService
    ) {}

    async verifyCredentials(
        jwtCredentials: VCLJwt[],
        finalizeOffersDescriptor: VCLFinalizeOffersDescriptor
    ): Promise<boolean> {
        const verifiedPromises = jwtCredentials.map(async (jwtCredential) => {
            const jsonLdContext = await loadJsonldContext(
                jwtCredential.payload.vc,
                this.networkService
            );
            return verifyIssuerForCredentialType(
                jwtCredential.payload.vc,
                finalizeOffersDescriptor.credentialManifest.issuerId,
                {
                    issuerAccreditation:
                        finalizeOffersDescriptor.credentialManifest
                            .verifiedProfile.credentialSubject,
                    credentialTypeMetadata:
                        this.credentialTypesModel.data?.payload,
                    jsonLdContext,
                },
                {
                    log: console,
                    config: {},
                }
            );
        });
        const verified = await Promise.all(verifiedPromises);
        return verified.every((v) => v);
    }
}
