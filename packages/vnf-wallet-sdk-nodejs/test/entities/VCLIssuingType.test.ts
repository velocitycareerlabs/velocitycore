import { issuingTypeFromString, VCLIssuingType } from '../../src';

describe('VCLIssuingType Tests', () => {
    test('testFromExactString', () => {
        expect(issuingTypeFromString('Career')).toBe(VCLIssuingType.Career);
        expect(issuingTypeFromString('Identity')).toBe(VCLIssuingType.Identity);
        expect(issuingTypeFromString('Refresh')).toBe(VCLIssuingType.Refresh);
        expect(issuingTypeFromString('Undefined')).toBe(
            VCLIssuingType.Undefined
        );
    });

    test('testFromNonExactString', () => {
        expect(issuingTypeFromString('11_Career6_2')).toBe(
            VCLIssuingType.Career
        );
        expect(issuingTypeFromString('hyre_8Identity09_nf')).toBe(
            VCLIssuingType.Identity
        );
        expect(issuingTypeFromString('hyrek_yRefresho89#l')).toBe(
            VCLIssuingType.Refresh
        );
        expect(issuingTypeFromString('')).toBe(VCLIssuingType.Undefined);
    });
});
