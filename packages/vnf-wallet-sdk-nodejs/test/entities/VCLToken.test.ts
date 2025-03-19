import VCLToken from '../../src/api/entities/VCLToken';
import TokenMocks from '../infrastructure/resources/valid/TokenMocks';

describe('VCLToken Tests', () => {
    let subject: VCLToken;

    test('testToken1', () => {
        subject = new VCLToken(TokenMocks.TokenStr);

        expect(subject.value).toBe(TokenMocks.TokenStr);
        expect(subject.jwtValue.encodedJwt).toBe(TokenMocks.TokenStr);
        expect(subject.expiresIn).toBe(BigInt(1704020514));
    });

    test('testToken2', () => {
        subject = new VCLToken(TokenMocks.TokenJwt);

        expect(subject.value).toBe(TokenMocks.TokenJwt.encodedJwt);
        expect(subject.jwtValue.encodedJwt).toBe(
            TokenMocks.TokenJwt.encodedJwt
        );
        expect(subject.expiresIn).toBe(BigInt(1704020514));
    });
});
