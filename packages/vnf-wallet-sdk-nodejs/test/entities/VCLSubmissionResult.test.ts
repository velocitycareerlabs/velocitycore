import VCLExchange from '../../src/api/entities/VCLExchange';
import VCLSubmissionResult from '../../src/api/entities/VCLSubmissionResult';
import VCLToken from '../../src/api/entities/VCLToken';

describe('VCLSubmissionResult Tests', () => {
    let subject: VCLSubmissionResult;

    beforeEach(() => {
        subject = new VCLSubmissionResult(
            new VCLToken('token123'),
            new VCLExchange('id123', 'type123', true, true),
            'jti123',
            'submissionId123'
        );
    });

    test('testProps', () => {
        expect(subject.sessionToken.value).toBe('token123');
        expect(subject.exchange.id).toBe('id123');
        expect(subject.exchange.type).toBe('type123');
        expect(subject.exchange.exchangeComplete).toBeTruthy();
        expect(subject.exchange.disclosureComplete).toBeTruthy();
        expect(subject.jti).toBe('jti123');
        expect(subject.submissionId).toBe('submissionId123');
    });
});
