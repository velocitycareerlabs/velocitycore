import axios, { AxiosResponse } from 'axios';
import { Nullish } from '../../../../api/VCLTypes';
import NetworkService from '../../../domain/infrastructure/network/NetworkService';
import VCLLog from '../../../utils/VCLLog';
import Response from './Response';
import Request from './Request';
import { HttpMethod } from './HttpMethod';
// TODO: implement response caching

export default class NetworkServiceImpl implements NetworkService {
    async sendRequestRaw(request: Request): Promise<Response> {
        let handler: () => Nullish<Promise<AxiosResponse<any, any>>> = () => {
            return null;
        };
        switch (request.method) {
            case HttpMethod.GET:
                handler = () =>
                    axios.create({ ...axios.defaults }).get(request.endpoint, {
                        headers: {
                            ...request.headers,
                        },
                    });
                break;
            case HttpMethod.POST:
                handler = () =>
                    axios
                        .create({ ...axios.defaults })
                        .post(request.endpoint, request.body, {
                            headers: {
                                ...request.headers,
                                'Content-Type': request.contentType,
                            },
                        });
                break;
            default:
                break;
        }
        try {
            const r = await handler();
            return new Response(r!.data, r!.status);
        } catch (error: any) {
            throw error.response?.data ?? error;
        }
    }

    async sendRequest(request: Request): Promise<Response> {
        this.logRequest(request);
        return this.sendRequestRaw(request);
    }

    logRequest(request: Request) {
        VCLLog.info(request, 'Network request');
    }
}
