import NetworkService from '../src/impl/domain/infrastructure/network/NetworkService';
import Response from '../src/impl/data/infrastructure/network/Response';

export default class NetworkServiceSuccess implements NetworkService {
    constructor(private readonly validResponse: any) {}

    async sendRequestRaw(): Promise<Response> {
        throw new Error('not implemented');
    }

    async sendRequest(): Promise<Response> {
        return new Response(this.validResponse, 0);
    }
}
