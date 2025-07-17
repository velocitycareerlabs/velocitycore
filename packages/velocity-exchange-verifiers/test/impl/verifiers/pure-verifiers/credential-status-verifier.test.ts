/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { credentialStatusVerifier } from 'impl/verifiers/pure-verifiers/credential-status-verifier';
import { ERROR_CODES } from 'impl/errors';
import { CredentialJwt, ValidationContext } from 'impl/types';

describe('credentialStatusVerifier', () => {
  const baseContext: ValidationContext = {
    path: [],
    credential_issuer_metadata: {
      iss: 'did:issuer:example',
      credential_issuer: 'https://issuer.example.com',
    },
  };

  const buildCredential = (
    statusValue: unknown = { id: 'https://status.example.com' }
  ): CredentialJwt => ({
    header: { alg: 'ES256' },
    payload: {
      iss: 'did:example',
      vc: {
        credentialStatus: statusValue,
      },
    },
  });

  it('should pass when credentialStatus is present', () => {
    const credential = buildCredential();
    const result = credentialStatusVerifier(credential, baseContext);
    expect(result).toEqual([]);
  });

  it('should fail when credentialStatus is undefined', () => {
    const credential: CredentialJwt = {
      header: { alg: 'ES256' },
      payload: {
        iss: 'did:example',
        vc: {}, // missing credentialStatus
      },
    };
    const result = credentialStatusVerifier(credential, baseContext);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: ERROR_CODES.MISSING_CREDENTIAL_STATUS,
      path: ['payload', 'vc', 'credentialStatus'],
    });
  });

  it('should fail when vc is missing', () => {
    const credential: CredentialJwt = {
      header: { alg: 'ES256' },
      payload: {
        iss: 'did:example',
        vc: {},
      },
    };
    const result = credentialStatusVerifier(credential, baseContext);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: ERROR_CODES.MISSING_CREDENTIAL_STATUS,
      path: ['payload', 'vc', 'credentialStatus'],
    });
  });

  it('should include full path when nested in a context', () => {
    const credential = {
      header: { alg: 'ES256' },
      payload: {
        iss: 'did:example',
        vc: {},
      },
    };
    const nestedContext: ValidationContext = {
      ...baseContext,
      path: ['credentials', 0],
    };
    const result = credentialStatusVerifier(
      credential as CredentialJwt,
      nestedContext
    );

    expect(result[0].path).toEqual([
      'credentials',
      0,
      'payload',
      'vc',
      'credentialStatus',
    ]);
  });
});
