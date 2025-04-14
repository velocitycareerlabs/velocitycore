import VCLExchange from '../../../api/entities/VCLExchange';
import VCLExchangeDescriptor from '../../../api/entities/VCLExchangeDescriptor';
import ExchangeProgressRepository from '../../domain/repositories/ExchangeProgressRepository';
import ExchangeProgressUseCase from '../../domain/usecases/ExchangeProgressUseCase';
import VCLError from '../../../api/entities/error/VCLError';
import { Nullish } from '../../../api/VCLTypes';
import VCLAuthToken from '../../../api/entities/VCLAuthToken';

export default class ExchangeProgressUseCaseImpl
    implements ExchangeProgressUseCase
{
    constructor(
        private exchangeProgressRepository: ExchangeProgressRepository
    ) {}

    async getExchangeProgress(
        exchangeDescriptor: VCLExchangeDescriptor,
        authToken?: Nullish<VCLAuthToken>
    ): Promise<VCLExchange> {
        try {
            return await this.exchangeProgressRepository.getExchangeProgress(
                exchangeDescriptor,
                authToken
            );
        } catch (error: any) {
            throw VCLError.fromError(error);
        }
    }
}
