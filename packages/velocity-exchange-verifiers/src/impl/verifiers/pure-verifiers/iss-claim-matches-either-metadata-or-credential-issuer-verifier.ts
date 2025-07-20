/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { CredentialJwt, Verifier } from 'impl/types';
import { buildError, ERROR_CODES } from 'impl/errors';

/**
 * Verifies that the Credential JWT's `iss` claim matches the expected issuer metadata.
 *
 * @remarks
 * This verifier implements the OpenID4VCI specification fallback behavior by validating that
 * the `payload.iss` field in the Credential JWT matches **either**:
 *
 * - `credential_issuer_metadata.iss`
 * - `credential_issuer_metadata.credential_issuer`
 *
 * This ensures conformance with OpenID4VCI while enabling broader ecosystem compatibility.
 *
 * @param credential - A parsed {@link CredentialJwt} object.
 * @param context - The {@link ValidationContext} containing issuer metadata and optional path.
 *
 * @returns An array containing a {@link VerificationError} if validation fails, or an empty array if valid.
 *
 * @example
 * ```ts
 * const errors = issClaimMatchesEitherMetadataOrCredentialIssuerVerifier(credentialJwt, context);
 * if (errors.length > 0) {
 *   handleValidationErrors(errors);
 * }
 * ```
 *
 * @validationRule `credential.payload.iss` must equal `credential_issuer_metadata.iss` or `credential_issuer_metadata.credential_issuer`.
 * @errorCode `UNEXPECTED_CREDENTIAL_PAYLOAD_ISS` — if the issuer does not match either expected value.
 *
 * @see {@link CredentialJwt}
 * @see {@link VerificationError}
 * @see {@link ValidationContext}
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
