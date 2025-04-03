/**
 * Created by Michael Avoyan on 30/03/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { VCLAuthToken } from 'src/api/entities/VCLAuthToken';
import { VCLAuthTokenDescriptor } from 'src/api/entities/VCLAuthTokenDescriptor';
import NetworkService from '../../domain/infrastructure/network/NetworkService';
import AuthTokenRepository from '../../domain/repositories/AuthTokenRepository';
import VCLLog from '../../utils/VCLLog';

export default class AuthTokenRepositoryImpl implements AuthTokenRepository {
    constructor(private readonly networkService: NetworkService) {}

    async getAuthToken(
        authTokenDescriptor: VCLAuthTokenDescriptor
    ): Promise<VCLAuthToken> {
        VCLLog.info('Getting auth token', authTokenDescriptor);
        throw new Error('Method not implemented.');
    }
}
