/**
 * Created by Michael Avoyan on 03/06/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import VCLOffers from '../../../api/entities/VCLOffers';
import VCLDeepLink from '../../../api/entities/VCLDeepLink';
import OffersByDeepLinkVerifier from '../../domain/verifiers/OffersByDeepLinkVerifier';
import VCLErrorCode from '../../../api/entities/error/VCLErrorCode';
import VCLError from '../../../api/entities/error/VCLError';
import VCLLog from '../../utils/VCLLog';

export default class OffersByDeepLinkVerifierImpl
    implements OffersByDeepLinkVerifier
{
    async verifyOffers(
        offers: VCLOffers,
        deepLink: VCLDeepLink
    ): Promise<boolean> {
        const mismatchedOffer = offers.all.find(
            (offer) => offer.issuerId !== deepLink.did
        );

        if (mismatchedOffer) {
            const errorMsg = `mismatched offer: ${mismatchedOffer.payload} \ndeepLink: ${deepLink.value}`;
            VCLLog.error(errorMsg);
            throw new VCLError(errorMsg, VCLErrorCode.MismatchedOfferIssuerDid);
        } else {
            return true;
        }
    }
}
