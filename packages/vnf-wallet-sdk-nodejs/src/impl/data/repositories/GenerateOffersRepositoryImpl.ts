import VCLError from '../../../api/entities/error/VCLError';
import VCLGenerateOffersDescriptor from '../../../api/entities/VCLGenerateOffersDescriptor';
import VCLOffers from '../../../api/entities/VCLOffers';
import VCLToken from '../../../api/entities/VCLToken';
import NetworkService from '../../domain/infrastructure/network/NetworkService';
import GenerateOffersRepository from '../../domain/repositories/GenerateOffersRepository';
import { HttpMethod } from '../infrastructure/network/Request';
import { HeaderKeys, HeaderValues } from './Urls';

export default class GenerateOffersRepositoryImpl
    implements GenerateOffersRepository
{
    constructor(private networkService: NetworkService) {}

    async generateOffers(
        generateOffersDescriptor: VCLGenerateOffersDescriptor,
        sessionToken: VCLToken
    ): Promise<VCLOffers> {
        const offersResponse = await this.networkService.sendRequest({
            useCaches: false,
            endpoint: generateOffersDescriptor.checkOffersUri,
            headers: {
                [HeaderKeys.Authorization]: `${HeaderValues.PrefixBearer} ${sessionToken.value}`,
                [HeaderKeys.XVnfProtocolVersion]:
                    HeaderValues.XVnfProtocolVersion,
            },
            body: generateOffersDescriptor.payload,
            method: HttpMethod.POST,
            contentType: 'application/json',
        });
        if (offersResponse) {
            return VCLOffers.fromPayload(
                offersResponse.payload,
                offersResponse.code,
                sessionToken
            );
        }
        throw new VCLError('Offers did not returned.');
    }
}
