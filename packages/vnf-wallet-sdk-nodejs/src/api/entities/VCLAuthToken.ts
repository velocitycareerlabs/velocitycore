/**
 * Created by Michael Avoyan on 30/03/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import VCLToken from './VCLToken';
import { Dictionary } from '../VCLTypes';

export class VCLAuthToken {
    private accessToken: VCLToken;

    private refreshToken: VCLToken;

    private tokenType: string;

    constructor(private readonly payload: Dictionary<any>) {
        this.accessToken = new VCLToken(payload.access_token);
        this.refreshToken = new VCLToken(payload.refresh_token);
        this.tokenType = payload.token_type;
    }
}
