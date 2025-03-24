import { Dictionary, Nullish } from '../VCLTypes';
import VCLToken from './VCLToken';
import { VCLOffer } from './VCLOffer';

export default class VCLOffers {
    constructor(
        public readonly payload: Dictionary<any>,
        public readonly all: VCLOffer[],
        public readonly responseCode: number,
        public readonly sessionToken: VCLToken,
        public readonly challenge: Nullish<string> = null
    ) {}

    static readonly fromPayload = (
        payload: Dictionary<any>,
        responseCode: number,
        sessionToken: VCLToken
    ): VCLOffers => {
        if (payload) {
            if (Array.isArray(payload)) {
                return new VCLOffers(
                    { [VCLOffers.CodingKeys.KeyOffers]: payload },
                    VCLOffers.offersFromJsonArray(payload),
                    responseCode,
                    sessionToken
                );
            }
            return new VCLOffers(
                payload,
                VCLOffers.offersFromJsonArray(
                    payload[VCLOffers.CodingKeys.KeyOffers] || []
                ),
                responseCode,
                sessionToken,
                payload[VCLOffers.CodingKeys.KeyChallenge]
            );
        }
        return new VCLOffers({}, [], responseCode, sessionToken);
    };

    private static readonly offersFromJsonArray = (
        offersJsonArray: Dictionary<any>[]
    ): VCLOffer[] => {
        const allOffers: VCLOffer[] = [];
        for (let i = 0; i < offersJsonArray.length; i++) {
            const offerJsonObject = offersJsonArray[i];
            if (offerJsonObject) {
                allOffers.push(new VCLOffer(offerJsonObject));
            }
        }
        return allOffers;
    };

    static CodingKeys = {
        KeyOffers: 'offers',
        KeyChallenge: 'challenge',
    };
}
