/**
 * Created by Michael Avoyan on 27/04/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import TokenMocks from '../infrastructure/resources/valid/TokenMocks';
import AuthTokenUseCase from '../../src/impl/domain/usecases/AuthTokenUseCase';
import AuthTokenUseCaseImpl from '../../src/impl/data/usecases/AuthTokenUseCaseImpl';
import AuthTokenRepositoryImpl from '../../src/impl/data/repositories/AuthTokenRepositoryImpl';
import NetworkServiceSuccess from '../infrastructure/resources/network/NetworkServiceSuccess';
import { VCLAuthTokenDescriptor, VCLErrorCode } from '../../src';

describe('AuthTokenUseCaseTest', () => {
    let subject!: AuthTokenUseCase;

    const expectedAuthToken = TokenMocks.AuthToken;

    test('testGetAuthTokenSuccess', async () => {
        subject = new AuthTokenUseCaseImpl(
            new AuthTokenRepositoryImpl(
                new NetworkServiceSuccess(expectedAuthToken.payload)
            )
        );
        try {
            const authToken = await subject.getAuthToken(
                new VCLAuthTokenDescriptor(
                    'token uri',
                    'wallet did',
                    'wallet did',
                    'relying party did'
                )
            );
            expect(authToken.payload).toEqual(TokenMocks.AuthToken.payload);
            expect(authToken.accessToken.value).toEqual(
                expectedAuthToken.accessToken.value
            );
            expect(authToken.refreshToken.value).toEqual(
                expectedAuthToken.refreshToken.value
            );
            expect(authToken.walletDid).toEqual(expectedAuthToken.walletDid);
            expect(authToken.relyingPartyDid).toEqual(
                expectedAuthToken.relyingPartyDid
            );
        } catch (error) {
            expect(true).toBeFalsy();
        }
    });

    test('testGetAuthTokenFailure', async () => {
        subject = new AuthTokenUseCaseImpl(
            new AuthTokenRepositoryImpl(
                new NetworkServiceSuccess({ payload: 'Wrong payload' })
            )
        );

        try {
            await subject.getAuthToken(new VCLAuthTokenDescriptor(''));
            expect(true).toBeFalsy();
        } catch (error: any) {
            expect(error?.errorCode).toBe(VCLErrorCode.SdkError.toString());
        }
    });
});
