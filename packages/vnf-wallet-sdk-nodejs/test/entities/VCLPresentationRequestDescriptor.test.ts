import VCLPresentationRequestDescriptor from '../../src/api/entities/VCLPresentationRequestDescriptor';
import { PresentationRequestDescriptorMocks } from '../infrastructure/resources/valid/PresentationRequestDescriptorMocks';
import { DidJwkMocks } from '../infrastructure/resources/valid/DidJwkMocks';

describe('VCLPresentationRequestDescriptor Tests', () => {
    let subject: VCLPresentationRequestDescriptor;

    test('testPresentationRequestDescriptorWithPushDelegateSuccess', () => {
        subject = new VCLPresentationRequestDescriptor(
            PresentationRequestDescriptorMocks.DeepLink,
            PresentationRequestDescriptorMocks.PushDelegate,
            DidJwkMocks.DidJwk
        );

        const queryParams =
            `${
                VCLPresentationRequestDescriptor.KeyPushDelegatePushUrl
            }=${encodeURIComponent(
                PresentationRequestDescriptorMocks.PushDelegate.pushUrl
            )}` +
            `&${
                VCLPresentationRequestDescriptor.KeyPushDelegatePushToken
            }=${encodeURIComponent(
                PresentationRequestDescriptorMocks.PushDelegate.pushToken
            )}`;
        const mockEndpoint = `${decodeURIComponent(
            PresentationRequestDescriptorMocks.RequestUri
        )}?${queryParams}`;

        expect(subject.endpoint).toEqual(mockEndpoint);
        expect(subject.pushDelegate?.pushUrl).toEqual(
            PresentationRequestDescriptorMocks.PushDelegate.pushUrl
        );
        expect(subject.pushDelegate?.pushToken).toEqual(
            PresentationRequestDescriptorMocks.PushDelegate.pushToken
        );
        expect(subject.did).toEqual(
            PresentationRequestDescriptorMocks.InspectorDid
        );
    });

    test('testPresentationRequestDescriptorWithoutPushDelegateOnlySuccess', () => {
        subject = new VCLPresentationRequestDescriptor(
            PresentationRequestDescriptorMocks.DeepLink,
            null,
            DidJwkMocks.DidJwk
        );

        expect(subject.endpoint).toEqual(
            decodeURIComponent(PresentationRequestDescriptorMocks.RequestUri)
        );
        expect(subject.pushDelegate).toBeNull();
        expect(subject.did).toEqual(
            PresentationRequestDescriptorMocks.InspectorDid
        );
    });

    test('testPresentationRequestDescriptorWithQParamsWithPushDelegateSuccess', () => {
        subject = new VCLPresentationRequestDescriptor(
            PresentationRequestDescriptorMocks.DeepLinkWithQParams,
            PresentationRequestDescriptorMocks.PushDelegate,
            DidJwkMocks.DidJwk
        );

        const queryParams =
            `${
                VCLPresentationRequestDescriptor.KeyPushDelegatePushUrl
            }=${encodeURIComponent(
                PresentationRequestDescriptorMocks.PushDelegate.pushUrl
            )}` +
            `&${
                VCLPresentationRequestDescriptor.KeyPushDelegatePushToken
            }=${encodeURIComponent(
                PresentationRequestDescriptorMocks.PushDelegate.pushToken
            )}`;
        const mockEndpoint = `${decodeURIComponent(
            PresentationRequestDescriptorMocks.RequestUri
        )}?${PresentationRequestDescriptorMocks.QParms}&${queryParams}`;

        expect(subject.endpoint).toEqual(mockEndpoint);
        expect(subject.pushDelegate?.pushUrl).toEqual(
            PresentationRequestDescriptorMocks.PushDelegate.pushUrl
        );
        expect(subject.pushDelegate?.pushToken).toEqual(
            PresentationRequestDescriptorMocks.PushDelegate.pushToken
        );
        expect(subject.did).toEqual(
            PresentationRequestDescriptorMocks.InspectorDid
        );
    });

    test('testPresentationRequestDescriptorWithQParamsWithoutPushDelegateOnlySuccess', () => {
        subject = new VCLPresentationRequestDescriptor(
            PresentationRequestDescriptorMocks.DeepLinkWithQParams,
            null,
            DidJwkMocks.DidJwk
        );

        const mockEndpoint = `${decodeURIComponent(
            PresentationRequestDescriptorMocks.RequestUri
        )}?${PresentationRequestDescriptorMocks.QParms}`;

        expect(subject.endpoint).toEqual(mockEndpoint);
        expect(subject.pushDelegate).toBeNull();
        expect(subject.did).toEqual(
            PresentationRequestDescriptorMocks.InspectorDid
        );
    });
});
