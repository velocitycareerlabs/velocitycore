/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { credentialSchemaVerifier } from 'impl/verifiers/pure-verifiers/credential-schema-verifier';
import { ERROR_CODES } from 'impl/errors';
import { CredentialJwt, VerificationContext } from 'impl/types';

describe('credentialSchemaVerifier', () => {
  const baseContext: VerificationContext = {
    path: [],
    credential_issuer_metadata: {
      iss: 'did:issuer:example',
      credential_issuer: 'https://issuer.example.com',
    },
  };

  const buildCredential = (
    schema?: unknown,
    vcOverride: any = {}
  ): CredentialJwt => ({
    header: { alg: 'ES256' },
    payload: {
      iss: 'did:example',
      vc: {
        ...vcOverride,
        credentialSchema: schema,
      },
    },
  });

  it('should pass when credentialSchema is present', () => {
    const credential = buildCredential({
      id: 'https://schema.org',
      type: 'JsonSchema',
    });
    const result = credentialSchemaVerifier(credential, baseContext);
    expect(result).toEqual([]);
  });

  it('should fail when credentialSchema is missing', () => {
    const credential = buildCredential(undefined, {}); // no credentialSchema
    const result = credentialSchemaVerifier(credential, baseContext);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: ERROR_CODES.MISSING_CREDENTIAL_SCHEMA,
      path: ['payload', 'vc', 'credentialSchema'],
    });
    expect(result[0].message).toContain('Expected credentialSchema');
  });

  it('should fail when vc is undefined', () => {
    const credential: CredentialJwt = {
      header: { alg: 'ES256' },
      payload: {
        iss: 'did:example',
        // @ts-expect-error: testing invalid structure
        vc: undefined,
      },
    };

    const result = credentialSchemaVerifier(credential, baseContext);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: ERROR_CODES.MISSING_CREDENTIAL_SCHEMA,
      path: ['payload', 'vc', 'credentialSchema'],
    });
  });
});
