/**
 * Created by Michael Avoyan on 30/03/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Dictionary } from '../VCLTypes';
import VCLPresentationRequest from './VCLPresentationRequest';

// eslint-disable-next-line no-shadow
export enum GrantType {
    AuthorizationCode = 'authorization_code',
    RefreshToken = 'refresh_token',
}

export default class VCLAuthTokenDescriptor {
    public readonly authTokenUri: string;

    public readonly walletDid: string;

    public readonly relyingPartyDid: string;

    public readonly vendorOriginContext: string;

    public readonly refreshToken: string;

    constructor(
        authTokenUriOrPresentationRequest: string | VCLPresentationRequest,
        walletDid: string,
        relyingPartyDid: string,
        vendorOriginContext: string,
        refreshToken: string
    ) {
        if (
            authTokenUriOrPresentationRequest instanceof VCLPresentationRequest
        ) {
            // Called with a VCLPresentationRequest.
            this.authTokenUri = authTokenUriOrPresentationRequest.authTokenUri;
            this.walletDid = authTokenUriOrPresentationRequest.didJwk.did;
            this.relyingPartyDid = authTokenUriOrPresentationRequest.iss;
            this.vendorOriginContext =
                authTokenUriOrPresentationRequest.vendorOriginContext || '';
            this.refreshToken = refreshToken;
        } else {
            // Called with tokenUrl, walletDid, relyingPartyDid, etc.
            this.authTokenUri = authTokenUriOrPresentationRequest;
            this.walletDid = walletDid;
            this.relyingPartyDid = relyingPartyDid;
            this.vendorOriginContext = vendorOriginContext;
            this.refreshToken = refreshToken;
        }
    }

    generateRequestBody(): Dictionary<any> {
        return this.refreshToken
            ? {
                  [VCLAuthTokenDescriptor.KeyGrantType]:
                      GrantType.RefreshToken.toString(),
                  [VCLAuthTokenDescriptor.KeyClientId]: this.walletDid,
                  [GrantType.RefreshToken]: this.refreshToken,
                  [VCLAuthTokenDescriptor.KeyAudience]: this.relyingPartyDid,
              }
            : {
                  [VCLAuthTokenDescriptor.KeyGrantType]:
                      GrantType.AuthorizationCode.toString(),
                  [VCLAuthTokenDescriptor.KeyClientId]: this.walletDid,
                  [GrantType.AuthorizationCode.toString()]:
                      this.vendorOriginContext,
                  [VCLAuthTokenDescriptor.KeyAudience]: this.relyingPartyDid,
                  [VCLAuthTokenDescriptor.KeyTokenType]:
                      VCLAuthTokenDescriptor.KeyTokenTypeValue,
              };
    }

    static readonly KeyClientId = 'client_id';

    static readonly KeyAudience = 'audience';

    static readonly KeyGrantType = 'grant_type';

    static readonly KeyTokenType = 'token_type';

    static readonly KeyTokenTypeValue = 'Bearer';
}
