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

export class VCLAuthTokenDescriptor {
    private readonly tokenUrl: string;

    private readonly walletDid: string;

    private readonly relyingPartyDid: string;

    private readonly vendorOriginContext?: string;

    private readonly refreshToken?: string;

    // Overload signatures:
    constructor(
        tokenUrl: string,
        walletDid: string,
        relyingPartyDid: string,
        vendorOriginContext?: string,
        refreshToken?: string
    );

    constructor(
        presentationRequest: VCLPresentationRequest,
        vendorOriginContext?: string,
        refreshToken?: string
    );

    constructor(
        tokenUrlOrPresentationRequest: string | VCLPresentationRequest,
        walletDidOrVendorOriginContext?: string,
        relyingPartyDidOrRefreshToken?: string,
        vendorOriginContext?: string,
        refreshToken?: string
    ) {
        if (typeof tokenUrlOrPresentationRequest === 'string') {
            // Called with tokenUrl, walletDid, relyingPartyDid, etc.
            this.tokenUrl = tokenUrlOrPresentationRequest;
            this.walletDid = walletDidOrVendorOriginContext as string;
            this.relyingPartyDid = relyingPartyDidOrRefreshToken as string;
            this.vendorOriginContext = vendorOriginContext;
            this.refreshToken = refreshToken;
        } else {
            // Called with a VCLPresentationRequest.
            this.tokenUrl = tokenUrlOrPresentationRequest.tokenUrl;
            this.walletDid = tokenUrlOrPresentationRequest.didJwk.did;
            this.relyingPartyDid = tokenUrlOrPresentationRequest.iss;
            this.vendorOriginContext = walletDidOrVendorOriginContext;
            this.refreshToken = relyingPartyDidOrRefreshToken;
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

    static readonly KeyClientId: 'client_id';

    static readonly KeyAudience: 'audience';

    static readonly KeyGrantType: 'grant_type';

    static readonly KeyTokenType: 'token_type';

    static readonly KeyTokenTypeValue: 'Bearer';
}
