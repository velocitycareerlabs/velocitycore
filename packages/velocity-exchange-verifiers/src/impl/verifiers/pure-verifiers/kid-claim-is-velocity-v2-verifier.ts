/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CredentialJwt, Verifier } from 'impl/types';
import { buildError, ERROR_CODES } from 'impl/errors';

/**
 * Verifies that the `kid` (Key ID) claim in the Credential JWT payload starts with the required Velocity prefix.
 *
 * This verifier enforces the **Velocity Profile Conformance** rule that mandates the issuer's key identifier
 * (i.e., `credential.payload.kid`) to be a DID beginning with the `did:velocity:v2` prefix.
 *
 * This ensures cryptographic key binding aligns with Velocity's identity framework and prevents the use
 * of unauthorized key namespaces.
 *
 * ### Validation Rule
 * - `credential.payload.kid` **must start with** `"did:velocity:v2"`
 *
 * ### Error Raised
 * - `INVALID_KID` — when the `kid` claim is missing or does not begin with the required prefix
 *
 * @param credential - Parsed Credential JWT object
 * @param context - Validation context including the current verification path
 * @returns A list with a single `VerificationError` if the check fails, or an empty list if valid
 *
 * @example
 * const errors = kidClaimIsVelocityV2Verifier(credentialJwt, context);
 *
 * @see {@link CredentialJwt}
 * @see {@link VerificationError}
 */
export const kidClaimIsVelocityV2Verifier: Verifier<CredentialJwt> = (
  credential,
  context
) => {
  const kid = credential.payload?.kid;
  if (!kid?.startsWith('did:velocity:v2')) {
    return [
      buildError(
        ERROR_CODES.INVALID_KID,
        `kid must start with 'did:velocity:v2', got '${kid}'`,
        [...(context.path ?? []), 'payload', 'kid']
      ),
    ];
  }
  return [];
};
