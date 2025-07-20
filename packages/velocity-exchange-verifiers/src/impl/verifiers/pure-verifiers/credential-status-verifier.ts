/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import _ from 'lodash';
import { buildError, ERROR_CODES } from 'impl/errors';
import { CredentialJwt, Verifier } from 'impl/types';

/**
 * Verifies that the `vc.credentialStatus` field exists in the Credential JWT payload.
 *
 * @remarks
 * This verifier ensures that the `credentialStatus` property is present within the Verifiable Credential (VC)
 * section of the JWT payload. This field is critical for enabling status checks like revocation or suspension,
 * and is required by the Velocity Profile conformance rules.
 *
 * @param credential - The {@link CredentialJwt} object containing both `header` and `payload`.
 * @param context - The {@link ValidationContext} used for issuer metadata and error path tracking.
 *
 * @returns An array of {@link VerificationError} with a single entry if the field is missing,
 * or an empty array if the credential is valid.
 *
 * @example
 * ```ts
 * const errors = credentialStatusVerifier(credentialJwt, validationContext);
 * if (errors.length > 0) {
 *   handleValidationErrors(errors);
 * }
 * ```
 *
 * @validationRule `credential.payload.vc.credentialStatus` must be defined.
 * @errorCode `MISSING_CREDENTIAL_STATUS` — if `vc.credentialStatus` is missing.
 *
 * @see {@link CredentialJwt}
 * @see {@link VerificationError}
 * @see {@link ValidationContext}
 */
export const credentialStatusVerifier: Verifier<CredentialJwt> = (
  credential,
  context
) => {
  const path = [...(context.path ?? []), 'payload', 'vc', 'credentialStatus'];

  if (!_.has(credential.payload, 'vc.credentialStatus')) {
    return [
      buildError(
        ERROR_CODES.MISSING_CREDENTIAL_STATUS,
        `Expected vc.credentialStatus to exist at path: ${path.join('.')}`,
        path
      ),
    ];
  }

  return [];
};
