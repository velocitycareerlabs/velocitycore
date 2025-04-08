/**
 * Created by Michael Avoyan on 31/03/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import VCLAuthTokenDescriptor, {
    GrantType,
} from '../../src/api/entities/VCLAuthTokenDescriptor';
import { PresentationRequestMocks } from '../infrastructure/resources/valid/PresentationRequestMocks';

const authTokenUri =
    // eslint-disable-next-line max-len
    'https://devagent.velocitycareerlabs.io/api/holder/v0.6/org/did:web:devregistrar.velocitynetwork.foundation:d:example-21.com-8b82ce9a/oauth/token';
const walletDid =
    // eslint-disable-next-line max-len
    'did:jwk:eyJjcnYiOiJQLTI1NiIsImt0eSI6IkVDIiwieCI6InI5ZnlhNTJJbG1UbzN5YlMwd19HZWZlUV9SWDJFSF9ISm1TV3FZWU8ySlkiLCJ5IjoicFFUUmE3R2txYzVrajZvZGVNcXBnVjVUNExqYlphNEY1S1R1MkpEclduYyJ9';
const relyingPartyDid =
    'did:web:devregistrar.velocitynetwork.foundation:d:example-21.com-8b82ce9a';
const vendorOriginContext = 'vendor-context';
const refreshToken = 'refresh-token-789';

describe('VCLAuthTokenDescriptor', () => {
    describe('VCLAuthTokenDescriptor Constructors', () => {
        it('should correctly assign properties when constructed with a VCLPresentationRequest and optional parameters', () => {
            const descriptor = new VCLAuthTokenDescriptor(
                PresentationRequestMocks.PresentationRequestFeed,
                refreshToken
            );

            expect((descriptor as any).authTokenUri).toBe(authTokenUri);
            expect((descriptor as any).walletDid).toBe(walletDid);
            expect((descriptor as any).relyingPartyDid).toBe(relyingPartyDid);
            expect((descriptor as any).vendorOriginContext).toBeUndefined();
            expect((descriptor as any).refreshToken).toBe(refreshToken);
        });

        it('should correctly assign properties when constructed with a VCLPresentationRequest without optional parameters', () => {
            const descriptor = new VCLAuthTokenDescriptor(
                PresentationRequestMocks.PresentationRequestFeed
            );

            expect((descriptor as any).authTokenUri).toBe(authTokenUri);
            expect((descriptor as any).walletDid).toBe(walletDid);
            expect((descriptor as any).relyingPartyDid).toBe(relyingPartyDid);
            expect((descriptor as any).vendorOriginContext).toBeUndefined();
            expect((descriptor as any).refreshToken).toBeUndefined();
        });

        // eslint-disable-next-line max-len
        it('should correctly assign properties when constructed with authTokenUri, walletDid, relyingPartyDid, vendorOriginContext, and refreshToken', () => {
            const descriptor = new VCLAuthTokenDescriptor(
                authTokenUri,
                refreshToken,
                walletDid,
                relyingPartyDid,
                vendorOriginContext
            );

            expect((descriptor as any).authTokenUri).toBe(authTokenUri);
            expect((descriptor as any).walletDid).toBe(walletDid);
            expect((descriptor as any).relyingPartyDid).toBe(relyingPartyDid);
            expect((descriptor as any).vendorOriginContext).toBe(
                vendorOriginContext
            );
            expect((descriptor as any).refreshToken).toBe(refreshToken);
        });
    });

    describe('generateRequestBody', () => {
        it('should generate request body for refreshToken flow when refreshToken only is provided', () => {
            const descriptor = new VCLAuthTokenDescriptor(
                authTokenUri,
                refreshToken,
                walletDid,
                relyingPartyDid,
                null
            );
            const expectedResult = {
                [VCLAuthTokenDescriptor.KeyGrantType]:
                    GrantType.RefreshToken.toString(),
                [VCLAuthTokenDescriptor.KeyClientId]: walletDid,
                [GrantType.RefreshToken]: refreshToken,
                [VCLAuthTokenDescriptor.KeyAudience]: relyingPartyDid,
            };

            const result = descriptor.generateRequestBody();

            expect(result).toEqual(expectedResult);
        });

        it('should generate request body for vendorOriginContext flow when vendorOriginContext only is provided', () => {
            const descriptor = new VCLAuthTokenDescriptor(
                authTokenUri,
                null,
                walletDid,
                relyingPartyDid,
                vendorOriginContext
            );
            const expectedResult = {
                [VCLAuthTokenDescriptor.KeyGrantType]:
                    GrantType.AuthorizationCode.toString(),
                [VCLAuthTokenDescriptor.KeyClientId]: walletDid,
                [GrantType.AuthorizationCode.toString()]: vendorOriginContext,
                [VCLAuthTokenDescriptor.KeyAudience]: relyingPartyDid,
                [VCLAuthTokenDescriptor.KeyTokenType]:
                    VCLAuthTokenDescriptor.KeyTokenTypeValue,
            };

            const result = descriptor.generateRequestBody();

            expect(result).toEqual(expectedResult);
        });

        it('should generate request body for refreshToken flow when both vendorOriginContext and refreshToken are provided', () => {
            const descriptor = new VCLAuthTokenDescriptor(
                authTokenUri,
                refreshToken,
                walletDid,
                relyingPartyDid,
                vendorOriginContext
            );
            const expectedResult = {
                [VCLAuthTokenDescriptor.KeyGrantType]:
                    GrantType.RefreshToken.toString(),
                [VCLAuthTokenDescriptor.KeyClientId]: walletDid,
                [GrantType.RefreshToken]: refreshToken,
                [VCLAuthTokenDescriptor.KeyAudience]: relyingPartyDid,
            };

            const result = descriptor.generateRequestBody();

            expect(result).toEqual(expectedResult);
        });
    });
});
