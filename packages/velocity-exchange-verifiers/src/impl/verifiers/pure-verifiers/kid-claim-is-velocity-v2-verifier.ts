/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CredentialJwt, Verifier } from 'impl/types';
import { buildError, ERROR_CODES } from 'impl/errors';

/**
 * Verifies that the Credential JWT's `kid` (Key ID) claim starts with the required Velocity DID prefix.
 *
 * @remarks
 * This verifier enforces the Velocity Profile Conformance rule that mandates the issuer's `kid`
 * to begin with `"did:velocity:v2"`, ensuring that the key used for signing is anchored in the expected
 * namespace. This is essential for enforcing trust boundaries and key provenance.
 *
 * @param credential - A parsed {@link CredentialJwt} containing a `header` with the `kid` field.
 * @param context - The {@link VerificationContext} used to track the current JSON path for precise error reporting.
 *
 * @returns An array containing a {@link VerificationError} if the `kid` is missing or invalid, or an empty array if valid.
 *
 * @example
 * ```ts
 * const errors = kidClaimIsVelocityV2Verifier(credentialJwt, context);
 * if (errors.length > 0) {
 *   console.error(errors);
 * }
 * ```
 *
 * @validationRule `credential.header.kid` must start with `"did:velocity:v2"`.
 * @errorCode `INVALID_KID` — when `kid` is missing or does not begin with the required prefix.
 *
 * @see {@link CredentialJwt}
 * @see {@link VerificationError}
 * @see {@link VerificationContext}
 */
export const kidClaimIsVelocityV2Verifier: Verifier<CredentialJwt> = (
  credential,
  context
) => {
  const kid = credential.header?.kid;
  if (typeof kid !== 'string' || !kid.startsWith('did:velocity:v2')) {
    return [
      buildError(
        ERROR_CODES.INVALID_KID,
        `kid must start with 'did:velocity:v2', got '${kid}'`,
        [...(context.path ?? []), 'header', 'kid']
      ),
    ];
  }
  return [];
};
