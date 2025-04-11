/**
 * Created by Michael Avoyan on 30/03/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import VCLAuthToken from '../../../api/entities/VCLAuthToken';
import VCLAuthTokenDescriptor from '../../../api/entities/VCLAuthTokenDescriptor';
import NetworkService from '../../domain/infrastructure/network/NetworkService';
import AuthTokenRepository from '../../domain/repositories/AuthTokenRepository';
import VCLLog from '../../utils/VCLLog';
import Request, { HttpMethod } from '../infrastructure/network/Request';
import { HeaderKeys, HeaderValues } from './Urls';
import VCLError from '../../../api/entities/error/VCLError';

export default class AuthTokenRepositoryImpl implements AuthTokenRepository {
    constructor(private readonly networkService: NetworkService) {}

    async getAuthToken(
        authTokenDescriptor: VCLAuthTokenDescriptor
    ): Promise<VCLAuthToken> {
        const { authTokenUri } = authTokenDescriptor;
        if (!authTokenUri) {
            throw new VCLError('authTokenDescriptor.authTokenUri = null');
        }
        try {
            const authTokenResponse = await this.networkService.sendRequest({
                endpoint: authTokenUri,
                contentType: Request.ContentTypeApplicationJson,
                method: HttpMethod.POST,
                headers: {
                    [HeaderKeys.XVnfProtocolVersion]:
                        HeaderValues.XVnfProtocolVersion,
                },
                useCaches: true,
                body: authTokenDescriptor.generateRequestBody(),
            });
            return new VCLAuthToken(
                authTokenResponse.payload,
                authTokenUri,
                authTokenDescriptor.walletDid,
                authTokenDescriptor.relyingPartyDid
            );
        } catch (e) {
            VCLLog.error('AuthTokenRepositoryImpl.getAuthToken', e);
            throw e;
        }
    }
}
