/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CredentialJwt, Verifier } from 'impl/types';
import { buildError, ERROR_CODES } from 'impl/errors';

/**
 * Verifies that the JWT's `header.alg` value is one of the supported algorithms.
 *
 * This verifier ensures that the credential is signed using an approved algorithm,
 * as required by the Velocity profile and JOSE (JSON Object Signing and Encryption) standards.
 * Supported algorithms are:
 * - `ES256`
 * - `ES256K`
 * - `RS256`
 *
 * ### Validation Rule
 * - `credential.header.alg` **must be one of** `["ES256", "ES256K", "RS256"]`
 *
 * ### Error Raised
 * - `INVALID_ALG` — when the algorithm is missing or not in the allowlist
 *
 * @param credential - The Credential JWT, including header and payload
 * @param context - The validation context, used to track field path
 * @returns An array with a single `VerificationError` if the algorithm is unsupported, or an empty array otherwise
 *
 * @example
 * const errors = algIsSupportedVerifier(credentialJwt, validationContext);
 *
 * @see {@link CredentialJwt}
 * @see {@link VerificationError}
 */
export const algIsSupportedVerifier: Verifier<CredentialJwt> = (
  credential,
  context
) => {
  const alg = credential.header?.alg;
  if (!supportedAlgs.includes(alg)) {
    return [
      buildError(ERROR_CODES.INVALID_ALG, `Unsupported alg: '${alg}'`, [
        ...(context.path ?? []),
        'header',
        'alg',
      ]),
    ];
  }
  return [];
};

const supportedAlgs = ['ES256', 'ES256K', 'RS256'];
