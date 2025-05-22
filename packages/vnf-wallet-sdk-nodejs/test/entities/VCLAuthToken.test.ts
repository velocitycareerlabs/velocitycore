/**
 * Created by Michael Avoyan on 07/04/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import { expect } from 'expect';
import { VCLAuthToken } from '../../src';
import TokenMocks from '../infrastructure/resources/valid/TokenMocks';

const accessToken = TokenMocks.TokenJwt1;
const refreshToken = TokenMocks.TokenJwt2;

describe('VCLAuthToken', () => {
    const payload = {
        access_token: accessToken.encodedJwt,
        refresh_token: refreshToken.encodedJwt,
        token_type: 'Bearer',
        authTokenUri: 'https://default.uri',
        walletDid: 'did:wallet:default',
        relyingPartyDid: 'did:party:default',
    };

    it('should initialize with only payload', () => {
        const token = new VCLAuthToken(payload);

        expect(token.accessToken.value).toBe(accessToken.encodedJwt);
        expect(token.refreshToken.value).toBe(refreshToken.encodedJwt);
        expect(token.tokenType).toBe('Bearer');
        expect(token.authTokenUri).toBe('https://default.uri');
        expect(token.walletDid).toBe('did:wallet:default');
        expect(token.relyingPartyDid).toBe('did:party:default');
    });

    it('should override authTokenUri if passed in constructor', () => {
        const token = new VCLAuthToken(payload, 'https://override.uri');
        expect(token.authTokenUri).toBe('https://override.uri');
    });

    it('should override walletDid if passed in constructor', () => {
        const token = new VCLAuthToken(
            payload,
            undefined,
            'did:wallet:override'
        );
        expect(token.walletDid).toBe('did:wallet:override');
    });

    it('should override relyingPartyDid if passed in constructor', () => {
        const token = new VCLAuthToken(
            payload,
            undefined,
            undefined,
            'did:party:override'
        );
        expect(token.relyingPartyDid).toBe('did:party:override');
    });
});
