/**
 * Created by Michael Avoyan on 03/06/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { VCLEnvironment, VCLLogService, VCLXVnfProtocolVersion } from '../src';
import GlobalConfig from '../src/impl/GlobalConfig';
import VCLLog from '../src/impl/utils/VCLLog';

describe('GlobalConfig', () => {
    let mockLogService: VCLLogService;

    beforeEach(() => {
        mockLogService = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
    });

    test('should initialize with default values', () => {
        GlobalConfig.init(
            false,
            VCLEnvironment.Prod,
            VCLXVnfProtocolVersion.XVnfProtocolVersion1,
            mockLogService,
            true
        );

        expect(GlobalConfig.IsDebugOn).toBe(false);
        expect(GlobalConfig.CurrentEnvironment).toBe(VCLEnvironment.Prod);
        expect(GlobalConfig.XVnfProtocolVersion).toBe(
            VCLXVnfProtocolVersion.XVnfProtocolVersion1
        );
        expect(GlobalConfig.IsDirectIssuerOn).toBe(true);
    });

    test('should set custom values during initialization', () => {
        GlobalConfig.init(
            true,
            VCLEnvironment.Staging,
            VCLXVnfProtocolVersion.XVnfProtocolVersion2,
            mockLogService,
            false
        );

        expect(GlobalConfig.IsDebugOn).toBe(true);
        expect(GlobalConfig.CurrentEnvironment).toBe(VCLEnvironment.Staging);
        expect(GlobalConfig.XVnfProtocolVersion).toBe(
            VCLXVnfProtocolVersion.XVnfProtocolVersion2
        );
        expect(GlobalConfig.IsDirectIssuerOn).toBe(false);
    });

    test('should correctly determine if logger is on', () => {
        GlobalConfig.init(
            false,
            VCLEnvironment.Prod,
            VCLXVnfProtocolVersion.XVnfProtocolVersion1,
            mockLogService,
            true
        );
        expect(GlobalConfig.IsLoggerOn).toBe(false);

        GlobalConfig.init(
            true,
            VCLEnvironment.Dev,
            VCLXVnfProtocolVersion.XVnfProtocolVersion1,
            mockLogService,
            true
        );
        expect(GlobalConfig.IsLoggerOn).toBe(true);
    });

    test('should initialize logger with VCLLogService', () => {
        GlobalConfig.init(
            true,
            VCLEnvironment.Prod,
            VCLXVnfProtocolVersion.XVnfProtocolVersion1,
            mockLogService,
            true
        );

        expect(VCLLog.LoggerService).toBe(mockLogService);
        expect(VCLLog.IsLoggerOn).toBe(true);
    });
});
