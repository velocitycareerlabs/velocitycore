import { expect } from '@jest/globals';
import NetworkServiceSuccess from '../infrastructure/resources/network/NetworkServiceSuccess';
import JwtServiceRepositoryImpl from '../../src/impl/data/repositories/JwtServiceRepositoryImpl';
import { JwtSignServiceMock } from '../infrastructure/resources/jwt/JwtSignServiceMock';
import { JwtVerifyServiceMock } from '../infrastructure/resources/jwt/JwtVerifyServiceMock';
import {
    VCLDeepLink,
    VCLPresentationRequest,
    VCLPresentationSubmission,
    VCLVerifiedProfile,
} from '../../src';
import { DidJwkMocks } from '../infrastructure/resources/valid/DidJwkMocks';
import PresentationSubmissionUseCaseImpl from '../../src/impl/data/usecases/PresentationSubmissionUseCaseImpl';
import { PresentationSubmissionMocks } from '../infrastructure/resources/valid/PresentationSubmissionMocks';
import SubmissionRepositoryImpl from '../../src/impl/data/repositories/SubmissionRepositoryImpl';
import { CommonMocks } from '../infrastructure/resources/CommonMocks';
import { generatePresentationSubmissionResult } from '../infrastructure/resources/utils/Utils';
import TokenMocks from '../infrastructure/resources/valid/TokenMocks';

describe('PresentationSubmission Tests', () => {
    const subject = new PresentationSubmissionUseCaseImpl(
        new SubmissionRepositoryImpl(
            new NetworkServiceSuccess(
                PresentationSubmissionMocks.PresentationSubmissionResultJson
            )
        ),
        new JwtServiceRepositoryImpl(
            new JwtSignServiceMock(
                PresentationSubmissionMocks.JwtEncodedSubmission
            ),
            new JwtVerifyServiceMock()
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

    test('testSubmitPresentationSuccess', async () => {
        const presentationSubmissionResult = await subject.submit(
            presentationSubmission
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
    });

    test('testSubmitPresentationTypeFeedSuccess', async () => {
        const presentationSubmissionResult = await subject.submit(
            presentationSubmission,
            authToken
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
    });
});
