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
 * Verifies the presence of the `vc.credentialStatus` field in the Credential JWT payload.
 *
 * This verifier enforces the requirement that the Verifiable Credential (VC) object
 * includes a `credentialStatus` property, which is essential for enabling revocation or suspension mechanisms.
 * Its presence is mandated by the Velocity profile conformance rules.
 *
 * ### Validation Rule
 * - `credential.payload.vc.credentialStatus` **must be defined**
 *
 * ### Error Raised
 * - `MISSING_CREDENTIAL_STATUS` — if `vc.credentialStatus` is missing from the credential payload
 *
 * @param credential - The Credential JWT object with `header` and `payload`
 * @param context - Validation context including metadata and hierarchical path
 * @returns A list containing a `VerificationError` if validation fails, or an empty list if valid
 *
 * @example
 * const errors = credentialStatusVerifier(credentialJwt, validationContext);
 *
 * @see {@link CredentialJwt}
 * @see {@link VerificationError}
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
