/* eslint-disable max-len */
import { expect } from '@jest/globals';
import {
    VCLCredentialManifest,
    VCLDeepLink,
    VCLJwt,
    VCLVerifiedProfile,
} from '../../src';
import { CredentialManifestMocks } from '../infrastructure/resources/valid/CredentialManifestMocks';
import { DidJwkMocks } from '../infrastructure/resources/valid/DidJwkMocks';

describe('VCLCredentialManifest Tests', () => {
    const subject: VCLCredentialManifest = new VCLCredentialManifest(
        VCLJwt.fromEncodedJwt(CredentialManifestMocks.JwtCredentialManifest1),
        null,
        new VCLVerifiedProfile({}),
        new VCLDeepLink(''),
        DidJwkMocks.DidJwk
    );
    test('VCLCredentialManifest props', () => {
        expect(subject.iss).toBe(
            'did:ion:EiApMLdMb4NPb8sae9-hXGHP79W1gisApVSE80USPEbtJA'
        );
        expect(subject.did).toBe(
            'did:ion:EiApMLdMb4NPb8sae9-hXGHP79W1gisApVSE80USPEbtJA'
        );
        expect(subject.issuerId).toBe(
            'did:ion:EiApMLdMb4NPb8sae9-hXGHP79W1gisApVSE80USPEbtJA'
        );
        expect(subject.aud).toBe(
            'https://devagent.velocitycareerlabs.io/api/holder/v0.6/org/did:ion:EiApMLdMb4NPb8sae9-hXGHP79W1gisApVSE80USPEbtJA'
        );
        expect(subject.exchangeId).toBe('645e315309237c760ac022b1');
        expect(subject.presentationDefinitionId).toBe(
            '645e315309237c760ac022b1.6384a3ad148b1991687f67c9'
        );
        expect(subject.finalizeOffersUri).toBe(
            'https://devagent.velocitycareerlabs.io/api/holder/v0.6/org/did:ion:EiApMLdMb4NPb8sae9-hXGHP79W1gisApVSE80USPEbtJA/issue/finalize-offers'
        );
        expect(subject.checkOffersUri).toBe(
            'https://devagent.velocitycareerlabs.io/api/holder/v0.6/org/did:ion:EiApMLdMb4NPb8sae9-hXGHP79W1gisApVSE80USPEbtJA/issue/credential-offers'
        );
        expect(subject.submitPresentationUri).toBe(
            'https://devagent.velocitycareerlabs.io/api/holder/v0.6/org/did:ion:EiApMLdMb4NPb8sae9-hXGHP79W1gisApVSE80USPEbtJA/issue/submit-identification'
        );
    });
});
