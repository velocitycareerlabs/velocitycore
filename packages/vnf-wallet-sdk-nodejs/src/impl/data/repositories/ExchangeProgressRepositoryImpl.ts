import { Dictionary, Nullish } from '../../../api/VCLTypes';
import VCLExchange from '../../../api/entities/VCLExchange';
import VCLExchangeDescriptor from '../../../api/entities/VCLExchangeDescriptor';
import NetworkService from '../../domain/infrastructure/network/NetworkService';
import ExchangeProgressRepository from '../../domain/repositories/ExchangeProgressRepository';
import { HttpMethod } from '../infrastructure/network/Request';
import { HeaderKeys, HeaderValues } from './Urls';
import VCLAuthToken from '../../../api/entities/VCLAuthToken';

export default class ExchangeProgressRepositoryImpl
    implements ExchangeProgressRepository
{
    constructor(private networkService: NetworkService) {}

    async getExchangeProgress(
        exchangeDescriptor: VCLExchangeDescriptor,
        authToken?: Nullish<VCLAuthToken>
    ): Promise<VCLExchange> {
        const exchangeProgressResponse = await this.networkService.sendRequest({
            useCaches: false,
            method: HttpMethod.GET,
            endpoint: `${exchangeDescriptor.processUri}?${
                VCLExchangeDescriptor.KeyExchangeId
            }=${encodeURIComponent(exchangeDescriptor.exchangeId)}`,
            headers: this.generateHeader(exchangeDescriptor, authToken),
            body: null,
            contentType: null,
        });

        return this.parseExchange(exchangeProgressResponse.payload);
    }

    private generateHeader = (
        exchangeDescriptor: VCLExchangeDescriptor,
        authToken?: Nullish<VCLAuthToken>
    ) => {
        return authToken
            ? {
                  // eslint-disable-next-line max-len
                  [HeaderKeys.HeaderKeyAuthorization]: `${HeaderKeys.HeaderValuePrefixBearer} ${exchangeDescriptor.sessionToken.value}, ${HeaderKeys.HeaderValuePrefixBearer} ${authToken?.accessToken.value}`,
                  [HeaderKeys.XVnfProtocolVersion]:
                      HeaderValues.XVnfProtocolVersion,
              }
            : {
                  [HeaderKeys.HeaderKeyAuthorization]: `${HeaderKeys.HeaderValuePrefixBearer} ${exchangeDescriptor.sessionToken.value}`,
                  [HeaderKeys.XVnfProtocolVersion]:
                      HeaderValues.XVnfProtocolVersion,
              };
    };

    private parseExchange(exchangeJsonObj: Dictionary<any>) {
        return new VCLExchange(
            exchangeJsonObj[VCLExchange.KeyId],
            exchangeJsonObj[VCLExchange.KeyType],
            exchangeJsonObj[VCLExchange.KeyDisclosureComplete],
            exchangeJsonObj[VCLExchange.KeyExchangeComplete]
        );
    }
}
