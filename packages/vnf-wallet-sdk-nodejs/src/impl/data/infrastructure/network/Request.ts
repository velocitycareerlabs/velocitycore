import { Nullish } from '../../../../api/VCLTypes';
import { HttpMethod } from './HttpMethod';

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
