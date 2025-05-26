import { describe, test } from 'node:test';
import { expect } from 'expect';
import VCLServiceType, {
    serviceTypeFromString,
} from '../../src/api/entities/VCLServiceType';

describe('VCLServiceType Tests', () => {
    test('testFromExactString', () => {
        expect(serviceTypeFromString('Inspector')).toBe(
            VCLServiceType.Inspector
        );
        expect(serviceTypeFromString('CareerIssuer')).toBe(
            VCLServiceType.CareerIssuer
        );
        expect(serviceTypeFromString('NotaryIssuer')).toBe(
            VCLServiceType.NotaryIssuer
        );
        expect(serviceTypeFromString('IdentityIssuer')).toBe(
            VCLServiceType.IdentityIssuer
        );
        expect(serviceTypeFromString('CareerIssuer')).toBe(
            VCLServiceType.CareerIssuer
        );
        expect(serviceTypeFromString('IdDocumentIssuer')).toBe(
            VCLServiceType.IdDocumentIssuer
        );
        expect(serviceTypeFromString('NotaryIdDocumentIssuer')).toBe(
            VCLServiceType.NotaryIdDocumentIssuer
        );
        expect(serviceTypeFromString('NotaryContactIssuer')).toBe(
            VCLServiceType.NotaryContactIssuer
        );
        expect(serviceTypeFromString('ContactIssuer')).toBe(
            VCLServiceType.ContactIssuer
        );
        expect(serviceTypeFromString('Issuer')).toBe(VCLServiceType.Issuer);
        expect(serviceTypeFromString('OtherService')).toBe(
            VCLServiceType.Undefined
        );
        expect(serviceTypeFromString('Undefined')).toBe(
            VCLServiceType.Undefined
        );
    });

    test('testFromNonExactString', () => {
        expect(serviceTypeFromString(',dfm%InspectorGH*(T')).toBe(
            VCLServiceType.Inspector
        );
        expect(serviceTypeFromString('234CareerIssuer95R')).toBe(
            VCLServiceType.CareerIssuer
        );
        expect(serviceTypeFromString('*%$NotaryIssuer3k42j2n4')).toBe(
            VCLServiceType.NotaryIssuer
        );
        expect(serviceTypeFromString('9834RFIdentityIssuer^3&^')).toBe(
            VCLServiceType.IdentityIssuer
        );
        expect(serviceTypeFromString('iu34CareerIssuer^#4f')).toBe(
            VCLServiceType.CareerIssuer
        );
        expect(serviceTypeFromString('398%IdDocumentIssuer^DDd3')).toBe(
            VCLServiceType.IdDocumentIssuer
        );
        expect(serviceTypeFromString('3kjnke9@NotaryIdDocumentIssuer@%^')).toBe(
            VCLServiceType.NotaryIdDocumentIssuer
        );
        expect(serviceTypeFromString('03fNotaryContactIssuer04gvd')).toBe(
            VCLServiceType.NotaryContactIssuer
        );
        expect(serviceTypeFromString('0fhe3ContactIssuer43f')).toBe(
            VCLServiceType.ContactIssuer
        );
        expect(serviceTypeFromString('eskld#Issuerdkdf')).toBe(
            VCLServiceType.Issuer
        );
        expect(serviceTypeFromString('ksdjhkD#OtherService959)%')).toBe(
            VCLServiceType.Undefined
        );
        expect(serviceTypeFromString('#Wfg85$Undefined)%dgsc')).toBe(
            VCLServiceType.Undefined
        );
        expect(serviceTypeFromString('')).toBe(VCLServiceType.Undefined);
    });
});
