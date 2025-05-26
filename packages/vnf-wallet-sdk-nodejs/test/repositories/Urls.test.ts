/**
 * Created by Michael Avoyan on 03/06/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, test } from 'node:test';
import { expect } from 'expect';
import Urls, { HeaderValues } from '../../src/impl/data/repositories/Urls';
import GlobalConfig from '../../src/impl/GlobalConfig';
import VCLXVnfProtocolVersion from '../../src/api/VCLXVnfProtocolVersion';
import VCLEnvironment from '../../src/api/VCLEnvironment';

describe('UrlsTest', () => {
    test('testProdEnvironment', () => {
        const registrarPrefix = 'https://registrar.velocitynetwork.foundation';

        GlobalConfig.CurrentEnvironment = VCLEnvironment.Prod;

        verifyUrlsPrefix(registrarPrefix);
    });

    test('testStagingEnvironment', () => {
        const registrarPrefix =
            'https://stagingregistrar.velocitynetwork.foundation';

        GlobalConfig.CurrentEnvironment = VCLEnvironment.Staging;

        verifyUrlsPrefix(registrarPrefix);
    });

    test('testQaEnvironment', () => {
        const registrarPrefix =
            'https://qaregistrar.velocitynetwork.foundation';

        GlobalConfig.CurrentEnvironment = VCLEnvironment.Qa;

        verifyUrlsPrefix(registrarPrefix);
    });

    test('testDevEnvironment', () => {
        const registrarPrefix =
            'https://devregistrar.velocitynetwork.foundation';

        GlobalConfig.CurrentEnvironment = VCLEnvironment.Dev;

        verifyUrlsPrefix(registrarPrefix);
    });

    const verifyUrlsPrefix = (registrarPrefix: string) => {
        expect(Urls.CredentialTypes.startsWith(registrarPrefix)).toBe(true);
        expect(Urls.CredentialTypeSchemas.startsWith(registrarPrefix)).toBe(
            true
        );
        expect(Urls.Countries.startsWith(registrarPrefix)).toBe(true);
        expect(Urls.Organizations.startsWith(registrarPrefix)).toBe(true);
        expect(Urls.ResolveKid.startsWith(registrarPrefix)).toBe(true);
        expect(Urls.CredentialTypesFormSchema.startsWith(registrarPrefix)).toBe(
            true
        );
    };

    test('testXVnfProtocolVersion', () => {
        GlobalConfig.XVnfProtocolVersion =
            VCLXVnfProtocolVersion.XVnfProtocolVersion1;
        expect(HeaderValues.XVnfProtocolVersion).toBe('1.0');

        GlobalConfig.XVnfProtocolVersion =
            VCLXVnfProtocolVersion.XVnfProtocolVersion2;
        expect(HeaderValues.XVnfProtocolVersion).toBe('2.0');
    });
});
