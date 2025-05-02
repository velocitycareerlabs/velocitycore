/* eslint-disable max-len */

import VCLJwt from '../../../../src/api/entities/VCLJwt';

export default class TokenMocks {
    static readonly TokenStr1 =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJqdGkiOiI2NTg4MGY5ZThkMjY3NWE0NTBhZDVhYjgiLCJpc3MiOiJkaWQ6aW9uOkVpQXBNTGRNYjROUGI4c2FlOS1oWEdIUDc5VzFnaXNBcFZTRTgwVVNQRWJ0SkEiLCJhdWQiOiJkaWQ6aW9uOkVpQXBNTGRNYjROUGI4c2FlOS1oWEdIUDc5VzFnaXNBcFZTRTgwVVNQRWJ0SkEiLCJleHAiOjE3MDQwMjA1MTQsInN1YiI6IjYzODZmODI0ZTc3NDc4OWM0MDNjOTZhMCIsImlhdCI6MTcwMzQxNTcxNH0.AJwKvQ_YNviFTjcuoJUR7ZHFEIbKY9zLCJv4DfC_PPk3Q-15rwKucYy8GdlfKnHLioBA5X37lpG-js8EztEKDg';

    static readonly TokenStr2 =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksiLCJraWQiOiIjZXhjaGFuZ2Uta2V5LTEifQ.eyJuYmYiOjE3NDQwMjMwODksImp0aSI6Im5OZEhWRktyaDk2ZjJWWXFzN29UZiIsImlzcyI6ImRpZDp3ZWI6ZGV2cmVnaXN0cmFyLnZlbG9jaXR5bmV0d29yay5mb3VuZGF0aW9uOmQ6ZXhhbXBsZS0yMS5jb20tOGI4MmNlOWEiLCJhdWQiOiJkaWQ6d2ViOmRldnJlZ2lzdHJhci52ZWxvY2l0eW5ldHdvcmsuZm91bmRhdGlvbjpkOmV4YW1wbGUtMjEuY29tLThiODJjZTlhIiwiZXhwIjoxNzQ0NjI3ODg5LCJzdWIiOiI2NjZhZTExODE5MjVmNmE0YTQ5N2RiYmMiLCJpYXQiOjE3NDQwMjMwODl9.j7Wp9DaHc6ZiFftfEf6sydy_LD73i6LW-oRoj_raOBEj4WVU3r4Qzpv8bgVUTd5_YGeZC_w2HHHRZOWOHLdJCg';

    static readonly TokenJwt1 = VCLJwt.fromEncodedJwt(TokenMocks.TokenStr1);

    static readonly TokenJwt2 = VCLJwt.fromEncodedJwt(TokenMocks.TokenStr2);

    static readonly AuthTokenStr = `{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksiLCJraWQiOiIjZXhjaGFuZ2Uta2V5LTEifQ.eyJuYmYiOjE3NDU3NDEwMDIsImp0aSI6IlE3aHZuM3BBXzJ5dUNIQl8tSEppWSIsImlzcyI6ImRpZDp3ZWI6ZGV2cmVnaXN0cmFyLnZlbG9jaXR5bmV0d29yay5mb3VuZGF0aW9uOmQ6ZXhhbXBsZS0yMS5jb20tOGI4MmNlOWEiLCJhdWQiOiJkaWQ6d2ViOmRldnJlZ2lzdHJhci52ZWxvY2l0eW5ldHdvcmsuZm91bmRhdGlvbjpkOmV4YW1wbGUtMjEuY29tLThiODJjZTlhIiwiZXhwIjoxNzQ1NzQxMDE3LCJzdWIiOiI2NjZhZTExODE5MjVmNmE0YTQ5N2RiYmMiLCJpYXQiOjE3NDU3NDEwMDJ9.awjYaf_2VqzNs_A3Ox3JlC8aNftGdW10oEkO5uoVEfklDlVBI_cXkH0vajeXF4EUXYWql2-c2lslIh94ASmVyg",
  "token_type": "Bearer",
  "refresh_token": "d9bb90b98fced3df74b7ec7cef1da44bf02bcd466688182178b798bb46a0195c5e1dd88bc57aa7085582ee686ffc968b31610807fd3158b41638484e4a68ef3d"
}`;

    static readonly AuthToken = {
        payload: JSON.parse(TokenMocks.AuthTokenStr),
        authTokenUri: 'auth token uri',
        walletDid: 'wallet did',
        relyingPartyDid: 'relying party did',
        accessToken: {
            value: JSON.parse(TokenMocks.AuthTokenStr).access_token,
        },
        refreshToken: {
            value: JSON.parse(TokenMocks.AuthTokenStr).refresh_token,
        },
    };
}
