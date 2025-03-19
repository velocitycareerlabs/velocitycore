import VCLSubmission from '../../src/api/entities/VCLSubmission';
import VCLPresentationSubmission from '../../src/api/entities/VCLPresentationSubmission';
import { PresentationSubmissionMocks } from '../infrastructure/resources/valid/PresentationSubmissionMocks';
import { JwtMocks } from '../infrastructure/resources/valid/JwtMocks';
import VCLPushDelegate from '../../src/api/entities/VCLPushDelegate';

describe('VCLSubmission Tests', () => {
    let subject: VCLSubmission;

    beforeEach(() => {
        subject = new VCLPresentationSubmission(
            PresentationSubmissionMocks.PresentationRequest,
            PresentationSubmissionMocks.SelectionsList
        );
    });

    test('testPayload', () => {
        const payload = subject.generatePayload();
        expect(payload[VCLSubmission.KeyJti]).toBe(subject.jti);
    });

    test('testPushDelegate', () => {
        expect(subject.pushDelegate?.pushUrl).toBe(
            PresentationSubmissionMocks.PushDelegate.pushUrl
        );
        expect(subject.pushDelegate?.pushToken).toBe(
            PresentationSubmissionMocks.PushDelegate.pushToken
        );
    });

    test('testRequestBody', () => {
        const requestBodyJsonObj = subject.generateRequestBody(JwtMocks.JWT);
        expect(requestBodyJsonObj[VCLSubmission.KeyExchangeId]).toBe(
            subject.exchangeId
        );
        expect(requestBodyJsonObj[VCLSubmission.KeyContext]).toEqual(
            VCLSubmission.ValueContextList
        );

        const pushDelegateBodyJsonObj =
            requestBodyJsonObj[VCLSubmission.KeyPushDelegate];

        expect(pushDelegateBodyJsonObj[VCLPushDelegate.KeyPushUrl]).toBe(
            PresentationSubmissionMocks.PushDelegate.pushUrl
        );
        expect(pushDelegateBodyJsonObj[VCLPushDelegate.KeyPushToken]).toBe(
            PresentationSubmissionMocks.PushDelegate.pushToken
        );

        expect(pushDelegateBodyJsonObj[VCLPushDelegate.KeyPushUrl]).toBe(
            subject.pushDelegate?.pushUrl
        );
        expect(pushDelegateBodyJsonObj[VCLPushDelegate.KeyPushToken]).toBe(
            subject.pushDelegate?.pushToken
        );
    });
});
