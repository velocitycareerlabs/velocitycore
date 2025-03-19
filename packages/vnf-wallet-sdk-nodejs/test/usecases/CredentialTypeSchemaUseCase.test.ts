import { expect } from '@jest/globals';
import NetworkServiceSuccess from '../NetworkServiceSuccess';
import CredentialTypeSchemasUseCaseImpl from '../../src/impl/data/usecases/CredentialTypeSchemasUseCaseImpl';
import CredentialTypeSchemaRepositoryImpl from '../../src/impl/data/repositories/CredentialTypeSchemaRepositoryImpl';
import { CredentialTypeSchemaMocks } from '../infrastructure/resources/valid/CredentialTypeSchemaMocks';

describe('CredentialTypeSchemaUseCase Tests', () => {
    const subject = new CredentialTypeSchemasUseCaseImpl(
        new CredentialTypeSchemaRepositoryImpl(
            new NetworkServiceSuccess(
                JSON.parse(CredentialTypeSchemaMocks.CredentialTypeSchemaJson)
            )
        ),
        CredentialTypeSchemaMocks.CredentialTypes
    );

    test('testGetCredentialTypeSchemas', async () => {
        const credTypeSchemas = await subject.getCredentialTypeSchemas();

        expect(
            credTypeSchemas.all[
                CredentialTypeSchemaMocks.CredentialType.schemaName
            ]?.payload
        ).toStrictEqual(
            JSON.parse(CredentialTypeSchemaMocks.CredentialTypeSchemaJson)
        );
    });
});
