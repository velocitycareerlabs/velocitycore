/* eslint-disable max-len */

import VCLJwt from '../../../../src/api/entities/VCLJwt';

export default class TokenMocks {
    static readonly TokenStr =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJqdGkiOiI2NTg4MGY5ZThkMjY3NWE0NTBhZDVhYjgiLCJpc3MiOiJkaWQ6aW9uOkVpQXBNTGRNYjROUGI4c2FlOS1oWEdIUDc5VzFnaXNBcFZTRTgwVVNQRWJ0SkEiLCJhdWQiOiJkaWQ6aW9uOkVpQXBNTGRNYjROUGI4c2FlOS1oWEdIUDc5VzFnaXNBcFZTRTgwVVNQRWJ0SkEiLCJleHAiOjE3MDQwMjA1MTQsInN1YiI6IjYzODZmODI0ZTc3NDc4OWM0MDNjOTZhMCIsImlhdCI6MTcwMzQxNTcxNH0.AJwKvQ_YNviFTjcuoJUR7ZHFEIbKY9zLCJv4DfC_PPk3Q-15rwKucYy8GdlfKnHLioBA5X37lpG-js8EztEKDg';

    static readonly TokenJwt = VCLJwt.fromEncodedJwt(TokenMocks.TokenStr);
}
