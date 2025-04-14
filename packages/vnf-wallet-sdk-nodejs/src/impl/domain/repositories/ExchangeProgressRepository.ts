import VCLExchange from '../../../api/entities/VCLExchange';
import VCLExchangeDescriptor from '../../../api/entities/VCLExchangeDescriptor';
import { Nullish } from '../../../api/VCLTypes';
import VCLAuthToken from '../../../api/entities/VCLAuthToken';

export default interface ExchangeProgressRepository {
    getExchangeProgress(
        exchangeDescriptor: VCLExchangeDescriptor,
        authToken?: Nullish<VCLAuthToken>
    ): Promise<VCLExchange>;
}
