/**
 * Created by Michael Avoyan on 27/05/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { expect } from '@jest/globals';
import SubmissionRepositoryImpl from '../../src/impl/data/repositories/SubmissionRepositoryImpl';
import NetworkServiceSuccess from '../infrastructure/resources/network/NetworkServiceSuccess';
import { PresentationSubmissionMocks } from '../infrastructure/resources/valid/PresentationSubmissionMocks';
import { DidJwkMocks } from '../infrastructure/resources/valid/DidJwkMocks';
import TokenMocks from '../infrastructure/resources/valid/TokenMocks';
import {
    VCLDeepLink,
    VCLPresentationRequest,
    VCLPresentationSubmission,
    VCLVerifiedProfile,
} from '../../src';
import { CommonMocks } from '../infrastructure/resources/CommonMocks';
import { generatePresentationSubmissionResult } from '../infrastructure/resources/utils/Utils';
import {
    HeaderKeys,
    HeaderValues,
} from '../../src/impl/data/repositories/Urls';

describe('SubmissionRepositoryTest', () => {
    const subject = new SubmissionRepositoryImpl(
        new NetworkServiceSuccess(
            PresentationSubmissionMocks.PresentationSubmissionResultJson
        )
    );
    const didJwk = DidJwkMocks.DidJwk;
    const authToken = TokenMocks.AuthToken;
    const presentationSubmission = new VCLPresentationSubmission(
        new VCLPresentationRequest(
            CommonMocks.JWT,
            new VCLVerifiedProfile({}),
            new VCLDeepLink(''),
            null,
            didJwk
        ),
        []
    );
    const expectedSubmissionResult = generatePresentationSubmissionResult(
        PresentationSubmissionMocks.PresentationSubmissionResultJson,
        presentationSubmission.jti,
        presentationSubmission.submissionId
    );

    beforeEach(() => {
        jest.spyOn(subject, 'generateHeader');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('testSubmitPresentationSuccess', async () => {
        const presentationSubmissionResult = await subject.submit(
            presentationSubmission,
            CommonMocks.JWT,
            null
        );

        expect(presentationSubmissionResult?.sessionToken.value).toBe(
            expectedSubmissionResult.sessionToken.value
        );
        expect(presentationSubmissionResult?.exchange.id).toBe(
            expectedSubmissionResult.exchange.id
        );
        expect(presentationSubmissionResult?.jti).toBe(
            expectedSubmissionResult.jti
        );
        expect(presentationSubmissionResult?.submissionId).toBe(
            expectedSubmissionResult.submissionId
        );

        expect(subject.generateHeader).toHaveBeenCalledTimes(1);
        expect(subject.generateHeader).toHaveBeenCalledWith(null);
    });

    test('testSubmitPresentationTypeFeedSuccess', async () => {
        const presentationSubmissionResult = await subject.submit(
            presentationSubmission,
            CommonMocks.JWT,
            authToken.accessToken
        );

        expect(presentationSubmissionResult?.sessionToken.value).toBe(
            expectedSubmissionResult.sessionToken.value
        );
        expect(presentationSubmissionResult?.exchange.id).toBe(
            expectedSubmissionResult.exchange.id
        );
        expect(presentationSubmissionResult?.jti).toBe(
            expectedSubmissionResult.jti
        );
        expect(presentationSubmissionResult?.submissionId).toBe(
            expectedSubmissionResult.submissionId
        );

        expect(subject.generateHeader).toHaveBeenCalledTimes(1);
        expect(subject.generateHeader).toHaveBeenCalledWith(
            authToken.accessToken
        );
    });

    test('testGenerateHeaderWithAuthToken', async () => {
        const header = subject.generateHeader(authToken.accessToken);

        expect(header[HeaderKeys.XVnfProtocolVersion]).toBe(
            HeaderValues.XVnfProtocolVersion
        );
        expect(header[HeaderKeys.Authorization]).toBe(
            `${HeaderValues.PrefixBearer} ${authToken.accessToken.value}`
        );
    });

    test('testGenerateHeaderWithoutAuthToken', async () => {
        const header = subject.generateHeader();

        expect(header[HeaderKeys.XVnfProtocolVersion]).toBe(
            HeaderValues.XVnfProtocolVersion
        );
        expect(header[HeaderKeys.Authorization]).toBeUndefined();
    });
});
