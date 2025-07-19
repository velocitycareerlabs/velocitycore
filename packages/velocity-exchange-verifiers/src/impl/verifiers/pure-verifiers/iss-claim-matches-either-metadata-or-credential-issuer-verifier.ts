/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { CredentialJwt, Verifier } from 'impl/types';
import { buildError, ERROR_CODES } from 'impl/errors';

/**
 * Verifies that the Credential JWT's `iss` claim matches either the `iss` or `credential_issuer`
 * field in the issuer's metadata.
 *
 * This verifier implements the **OpenID4VCI specification fallback behavior**, where the credential's
 * `iss` claim may be validated against either:
 * - `credential_issuer_metadata.iss`
 * - `credential_issuer_metadata.credential_issuer`
 *
 * Use this verifier when implementing spec-compliant fallback behavior in addition to (or instead of)
 * Velocity profile conformance.
 *
 * ### Validation Rule
 * - `credential.payload.iss` **must equal** `credential_issuer_metadata.iss`
 *   **OR** `credential_issuer_metadata.credential_issuer`
 *
 * ### Error Raised
 * - `UNEXPECTED_CREDENTIAL_PAYLOAD_ISS` — when `payload.iss` matches neither of the allowed values
 *
 * @param credential - A parsed Credential JWT object
 * @param context - Validation context containing issuer metadata
 * @returns A single `VerificationError` if no match is found, or an empty array if valid
 *
 * @example
 * const errors = issClaimMatchesEitherMetadataOrCredentialIssuerVerifier(credentialJwt, context);
 *
 * @see {@link CredentialJwt}
 * @see {@link VerificationError}
 */
export const issClaimMatchesEitherMetadataOrCredentialIssuerVerifier: Verifier<
  CredentialJwt
> = (credential, context) => {
  const actual = credential.payload?.iss;
  const allowed = [
    context.credential_issuer_metadata?.iss,
    context.credential_issuer_metadata?.credential_issuer,
  ];

  if (!actual || !allowed.includes(actual)) {
    return [
      buildError(
        ERROR_CODES.UNEXPECTED_CREDENTIAL_PAYLOAD_ISS,
        `Expected iss to be one of [${allowed.join(
          ', '
        )}], but got '${actual}'`,
        [...(context.path ?? []), 'payload', 'iss']
      ),
    ];
  }

  return [];
};
