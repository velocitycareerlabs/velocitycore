import VCLError from '../../src/api/entities/error/VCLError';
import { ErrorMocks } from '../infrastructure/resources/valid/ErrorMocks';

describe('VCLError Tests', () => {
    test('testErrorFromPayload', () => {
        const error = VCLError.fromPayload(ErrorMocks.Payload);

        expect(error.payload).toBe(ErrorMocks.Payload);
        expect(error.error).toBe(ErrorMocks.Error);
        expect(error.errorCode).toBe(ErrorMocks.ErrorCode);
        expect(error.message).toBe(ErrorMocks.Message);
        expect(error.statusCode).toBe(ErrorMocks.StatusCode);
    });

    test('testErrorFromProperties', () => {
        const error = new VCLError(
            ErrorMocks.Error,
            ErrorMocks.ErrorCode,
            ErrorMocks.RequestId,
            ErrorMocks.Message,
            ErrorMocks.StatusCode
        );

        expect(error.error).toBe(ErrorMocks.Error);
        expect(error.errorCode).toBe(ErrorMocks.ErrorCode);
        expect(error.requestId).toBe(ErrorMocks.RequestId);
        expect(error.message).toBe(ErrorMocks.Message);
        expect(error.statusCode).toBe(ErrorMocks.StatusCode);
    });

    test('testErrorToJsonFromPayload', () => {
        const error = VCLError.fromPayload(ErrorMocks.Payload);
        const errorJsonObject = error.jsonObject;

        expect(errorJsonObject[VCLError.KeyPayload]).toBe(ErrorMocks.Payload);
        expect(errorJsonObject[VCLError.KeyError]).toBe(ErrorMocks.Error);
        expect(errorJsonObject[VCLError.KeyErrorCode]).toBe(
            ErrorMocks.ErrorCode
        );
        expect(errorJsonObject[VCLError.KeyRequestId]).toBe(
            ErrorMocks.RequestId
        );
        expect(errorJsonObject[VCLError.KeyMessage]).toBe(ErrorMocks.Message);
        expect(errorJsonObject[VCLError.KeyStatusCode]).toBe(
            ErrorMocks.StatusCode
        );
    });

    test('testErrorToJsonFromProperties', () => {
        const error = new VCLError(
            ErrorMocks.Error,
            ErrorMocks.ErrorCode,
            ErrorMocks.RequestId,
            ErrorMocks.Message,
            ErrorMocks.StatusCode
        );
        const errorJsonObject = error.jsonObject;

        expect(errorJsonObject[VCLError.KeyError]).toBe(ErrorMocks.Error);
        expect(errorJsonObject[VCLError.KeyErrorCode]).toBe(
            ErrorMocks.ErrorCode
        );
        expect(errorJsonObject[VCLError.KeyRequestId]).toBe(
            ErrorMocks.RequestId
        );
        expect(errorJsonObject[VCLError.KeyMessage]).toBe(ErrorMocks.Message);
        expect(errorJsonObject[VCLError.KeyStatusCode]).toBe(
            ErrorMocks.StatusCode
        );
    });

    test('testErrorFromSomeError', () => {
        const error = VCLError.fromJson(ErrorMocks.SomeErrorJson);

        expect(JSON.parse(error.payload ?? '{}')).toStrictEqual(
            ErrorMocks.SomeErrorJson
        );
        expect(error.error).toBe(ErrorMocks.SomeErrorJson.error);
        expect(error.errorCode).toBe(ErrorMocks.SomeErrorJson.errorCode);
        expect(error.requestId).toBe(ErrorMocks.SomeErrorJson.requestId);
        expect(error.message).toBe(ErrorMocks.SomeErrorJson.message);
        expect(error.statusCode).toBe(ErrorMocks.SomeErrorJson.statusCode);
    });
});
