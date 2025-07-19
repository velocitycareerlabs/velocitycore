/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { buildError, ERROR_CODES } from 'impl/errors';
import { CredentialJwt, Verifier } from 'impl/types';

/**
 * Verifies the presence of the `vc.credentialSchema` field in a Credential JWT payload.
 *
 * This verifier ensures that the `credentialSchema` property is present in the Verifiable Credential (VC) object,
 * as required by the Velocity profile conformance rules. Absence of this field indicates an invalid or non-compliant
 * credential under the profile’s expectations.
 *
 * ### Validation Rule
 * - `credential.payload.vc.credentialSchema` **must be defined**
 *
 * ### Error Raised
 * - `MISSING_CREDENTIAL_SCHEMA` — when `credentialSchema` is missing from `payload.vc`
 *
 * @param credential - Parsed JWT containing a `header` and `payload`
 * @param context - Validation context providing path tracing and issuer metadata
 * @returns An array with a single `VerificationError` if the check fails, or an empty array on success
 *
 * @example
 * const errors = credentialSchemaVerifier(credentialJwt, validationContext);
 *
 * @see {@link CredentialJwt}
 * @see {@link VerificationError}
 */
export const credentialSchemaVerifier: Verifier<CredentialJwt> = (
  credential,
  context
) => {
  if (!credential.payload?.vc?.credentialSchema) {
    return [
      buildError(
        ERROR_CODES.MISSING_CREDENTIAL_SCHEMA,
        'Expected credentialSchema in payload.vc?.credentialSchema got undefined',
        [...(context.path ?? []), 'payload', 'vc', 'credentialSchema']
      ),
    ];
  }

  return [];
};
