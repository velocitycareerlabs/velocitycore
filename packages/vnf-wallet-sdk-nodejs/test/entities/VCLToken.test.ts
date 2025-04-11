import VCLToken from '../../src/api/entities/VCLToken';
import TokenMocks from '../infrastructure/resources/valid/TokenMocks';

describe('VCLToken Tests', () => {
    let subject: VCLToken;

    test('testToken1', () => {
        subject = new VCLToken(TokenMocks.TokenStr1);

        expect(subject.value).toBe(TokenMocks.TokenStr1);
        expect(subject.jwtValue.encodedJwt).toBe(TokenMocks.TokenStr1);
        expect(subject.expiresIn).toBe(BigInt(1704020514));
    });

    test('testToken2', () => {
        subject = new VCLToken(TokenMocks.TokenJwt1);

        expect(subject.value).toBe(TokenMocks.TokenJwt1.encodedJwt);
        expect(subject.jwtValue.encodedJwt).toBe(
            TokenMocks.TokenJwt1.encodedJwt
        );
        expect(subject.expiresIn).toBe(BigInt(1704020514));
    });
});
