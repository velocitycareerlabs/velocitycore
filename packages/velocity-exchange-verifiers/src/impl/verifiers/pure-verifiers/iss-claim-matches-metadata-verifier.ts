/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { CredentialJwt, Verifier } from 'impl/types';
import { buildError, ERROR_CODES } from 'impl/errors';

/**
 * Verifies that the Credential JWT's `iss` claim exactly matches the `iss` field in the issuer's metadata.
 *
 * This verifier enforces the **Velocity Profile Conformance** requirement that the `iss` field in the
 * credential payload must strictly match the `credential_issuer_metadata.iss` value.
 *
 * Use this verifier when profile-level strictness is required. It does not support fallback to
 * `credential_issuer_metadata.credential_issuer`, which is allowed by the base OpenID4VCI spec but
 * not by the Velocity profile.
 *
 * ### Validation Rule
 * - `credential.payload.iss` **must equal** `credential_issuer_metadata.iss`
 *
 * ### Error Raised
 * - `UNEXPECTED_CREDENTIAL_PAYLOAD_ISS` — when `payload.iss` does not match the expected issuer
 *
 * @param credential - A parsed Credential JWT object
 * @param context - Validation context containing `credential_issuer_metadata`
 * @returns A single `VerificationError` if the `iss` does not match, or an empty array if valid
 *
 * @example
 * const errors = issClaimMatchesMetadataVerifier(credentialJwt, context);
 *
 * @see {@link CredentialJwt}
 * @see {@link VerificationError}
 */
export const issClaimMatchesMetadataVerifier: Verifier<CredentialJwt> = (
  credential,
  context
) => {
  const actual = credential.payload?.iss;
  const expected = context.credential_issuer_metadata?.iss;

  if (actual !== expected) {
    return [
      buildError(
        ERROR_CODES.UNEXPECTED_CREDENTIAL_PAYLOAD_ISS,
        `Expected iss to be exactly '${expected}', but got '${actual}'`,
        [...(context.path ?? []), 'payload', 'iss']
      ),
    ];
  }

  return [];
};
