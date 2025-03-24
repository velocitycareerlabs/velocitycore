import { Nullish } from '../../../../api/VCLTypes';

// eslint-disable-next-line no-shadow
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
}

export default class Request {
    constructor(
        readonly endpoint: string,
        readonly method: HttpMethod,
        readonly body: Nullish<any> = null,
        readonly headers: { [key: string]: string } = {},
        readonly useCaches: boolean = true,
        readonly contentType: Nullish<string> = null
    ) {}

    static readonly ContentTypeApplicationJson = 'application/json';
}
