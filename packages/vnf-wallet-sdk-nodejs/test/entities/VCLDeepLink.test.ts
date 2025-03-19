import VCLDeepLink from '../../src/api/entities/VCLDeepLink';
import { DeepLinkMocks } from '../infrastructure/resources/valid/DeepLinkMocks';

describe('VCLDeepLink Tests', () => {
    test('testOpenidInitiateIssuance', () => {
        const subject = new VCLDeepLink(
            DeepLinkMocks.OpenidInitiateIssuanceStrDev
        );

        expect(subject.value).toBe(DeepLinkMocks.OpenidInitiateIssuanceStrDev);
        expect(decodeURIComponent(subject.value)).toBe(
            decodeURIComponent(DeepLinkMocks.OpenidInitiateIssuanceStrDev)
        );
        expect(subject.requestUri).toBeFalsy();
        expect(subject.did).toBe(DeepLinkMocks.OIDIssuerDid);
    });

    test('testPresentationRequestDeepLinkDevNetValidAggregation', () => {
        const subject = new VCLDeepLink(
            DeepLinkMocks.PresentationRequestDeepLinkDevNetStr
        );

        expect(subject.value).toBe(
            DeepLinkMocks.PresentationRequestDeepLinkDevNetStr
        );
        expect(decodeURIComponent(subject.value)).toBe(
            decodeURIComponent(
                DeepLinkMocks.PresentationRequestDeepLinkDevNetStr
            )
        );
        expect(subject.requestUri!).toBe(
            DeepLinkMocks.PresentationRequestRequestDecodedUriStr
        );
        expect(subject.vendorOriginContext).toBe(
            DeepLinkMocks.PresentationRequestVendorOriginContext
        );
        expect(subject.did).toBe(DeepLinkMocks.InspectorDid);
    });

    test('testPresentationRequestDeepLinkTestNetValidAggregation', () => {
        const subject = new VCLDeepLink(
            DeepLinkMocks.PresentationRequestDeepLinkTestNetStr
        );

        expect(subject.value).toBe(
            DeepLinkMocks.PresentationRequestDeepLinkTestNetStr
        );

        expect(decodeURIComponent(subject.value)).toBe(
            decodeURIComponent(
                DeepLinkMocks.PresentationRequestDeepLinkTestNetStr
            )
        );
        expect(subject.requestUri!).toBe(
            DeepLinkMocks.PresentationRequestRequestDecodedUriStr
        );
        expect(subject.vendorOriginContext).toBe(
            DeepLinkMocks.PresentationRequestVendorOriginContext
        );
        expect(subject.did).toBe(DeepLinkMocks.InspectorDid);
    });

    test('testPresentationRequestDeepLinkMainNetValidAggregation', () => {
        const subject = new VCLDeepLink(
            DeepLinkMocks.PresentationRequestDeepLinkMainNetStr
        );

        expect(subject.value).toBe(
            DeepLinkMocks.PresentationRequestDeepLinkMainNetStr
        );
        expect(decodeURIComponent(subject.value)).toBe(
            decodeURIComponent(
                DeepLinkMocks.PresentationRequestDeepLinkMainNetStr
            )
        );
        expect(subject.requestUri!).toBe(
            DeepLinkMocks.PresentationRequestRequestDecodedUriStr
        );
        expect(subject.vendorOriginContext).toBe(
            DeepLinkMocks.PresentationRequestVendorOriginContext
        );
        expect(subject.did).toBe(DeepLinkMocks.InspectorDid);
    });

    test('testCredentialManifestDeepLinkDevNetValidAggregation', () => {
        const subject = new VCLDeepLink(
            DeepLinkMocks.CredentialManifestDeepLinkDevNetStr
        );

        expect(subject.value).toBe(
            DeepLinkMocks.CredentialManifestDeepLinkDevNetStr
        );
        expect(decodeURIComponent(subject.value)).toBe(
            decodeURIComponent(
                DeepLinkMocks.CredentialManifestDeepLinkDevNetStr
            )
        );
        expect(decodeURIComponent(subject.requestUri!)).toBe(
            DeepLinkMocks.CredentialManifestRequestDecodedUriStr
        );
        expect(subject.vendorOriginContext).toBeFalsy();
        expect(subject.did).toBe(DeepLinkMocks.IssuerDid);
    });

    test('testCredentialManifestDeepLinkTestNetValidAggregation', () => {
        const subject = new VCLDeepLink(
            DeepLinkMocks.CredentialManifestDeepLinkTestNetStr
        );

        expect(subject.value).toBe(
            DeepLinkMocks.CredentialManifestDeepLinkTestNetStr
        );
        expect(decodeURIComponent(subject.value)).toBe(
            decodeURIComponent(
                DeepLinkMocks.CredentialManifestDeepLinkTestNetStr
            )
        );
        expect(decodeURIComponent(subject.requestUri!)).toBe(
            DeepLinkMocks.CredentialManifestRequestDecodedUriStr
        );
        expect(subject.vendorOriginContext).toBeFalsy();
        expect(subject.did).toBe(DeepLinkMocks.IssuerDid);
    });

    test('testCredentialManifestDeepLinkMainNetValidAggregation', () => {
        const subject = new VCLDeepLink(
            DeepLinkMocks.CredentialManifestDeepLinkMainNetStr
        );

        expect(subject.value).toBe(
            DeepLinkMocks.CredentialManifestDeepLinkMainNetStr
        );
        expect(decodeURIComponent(subject.value)).toBe(
            decodeURIComponent(
                DeepLinkMocks.CredentialManifestDeepLinkMainNetStr
            )
        );
        expect(decodeURIComponent(subject.requestUri!)).toBe(
            DeepLinkMocks.CredentialManifestRequestDecodedUriStr
        );
        expect(subject.vendorOriginContext).toBeFalsy();
        expect(subject.did).toBe(DeepLinkMocks.IssuerDid);
    });
});
