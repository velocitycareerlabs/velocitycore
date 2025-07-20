/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { issClaimMatchesEitherMetadataOrCredentialIssuerVerifier } from 'impl/verifiers/pure-verifiers';
import { ERROR_CODES } from 'impl/errors';
import { CredentialJwt, VerificationContext } from 'impl/types';

describe('issClaimMatchesEitherMetadataOrCredentialIssuerVerifier', () => {
  const context: VerificationContext = {
    path: [],
    credential_issuer_metadata: {
      iss: 'did:example:issuer',
      credential_issuer: 'https://issuer.example.com',
    },
  };

  const makeCredential = (iss: string): CredentialJwt => ({
    header: { alg: 'ES256' },
    payload: {
      iss,
      vc: {},
    },
  });

  it('should pass if iss matches metadata.iss', () => {
    const credential = makeCredential('did:example:issuer');
    const errors = issClaimMatchesEitherMetadataOrCredentialIssuerVerifier(
      credential,
      context
    );
    expect(errors).toEqual([]);
  });

  it('should pass if iss matches metadata.credential_issuer', () => {
    const credential = makeCredential('https://issuer.example.com');
    const errors = issClaimMatchesEitherMetadataOrCredentialIssuerVerifier(
      credential,
      context
    );
    expect(errors).toEqual([]);
  });

  it('should fail if iss matches neither', () => {
    const credential = makeCredential('https://other.example.org');
    const errors = issClaimMatchesEitherMetadataOrCredentialIssuerVerifier(
      credential,
      context
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      code: ERROR_CODES.UNEXPECTED_CREDENTIAL_PAYLOAD_ISS,
      message: expect.stringContaining('https://other.example.org'),
      path: ['payload', 'iss'],
    });
  });

  it('should fail if iss is empty string ', () => {
    const credential = makeCredential('');
    const errors = issClaimMatchesEitherMetadataOrCredentialIssuerVerifier(
      credential,
      context
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      code: ERROR_CODES.UNEXPECTED_CREDENTIAL_PAYLOAD_ISS,
      message: expect.stringContaining(''),
      path: ['payload', 'iss'],
    });
  });
});
