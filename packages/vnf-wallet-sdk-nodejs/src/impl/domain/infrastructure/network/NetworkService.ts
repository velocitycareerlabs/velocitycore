import { Nullish } from '../../../../api/VCLTypes';
import Request, {
    HttpMethod,
} from '../../../data/infrastructure/network/Request';
import Response from '../../../data/infrastructure/network/Response';

type NetworkRequestParams = {
    endpoint: string;
    body: Nullish<any>;
    contentType: Nullish<string>;
    method: HttpMethod;
    headers: any;
    useCaches: boolean;
};

export default interface NetworkService {
    sendRequestRaw(params: Request): Promise<Response>;

    sendRequest(params: NetworkRequestParams): Promise<Response>;
}
