/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CredentialJwt, Verifier } from 'impl/types';
import { buildError, ERROR_CODES } from 'impl/errors';

/**
 * Verifies that the Credential JWT payload contains a valid subject declaration via either `sub` or `cnf`.
 *
 * According to the OpenID4VCI specification and Velocity profile requirements, a credential must:
 * - Either have the `sub` (subject) claim set to `"did:jwk"`
 * - Or include a `cnf` (confirmation) object representing key binding
 *
 * This verifier ensures that one of these two valid identity-binding mechanisms is present.
 *
 * ### Validation Rule
 * - `payload.sub === "did:jwk"` **OR** `payload.cnf` must be defined
 *
 * ### Error Raised
 * - `SUB_OR_CNF_MISSING` — if neither `sub` equals `"did:jwk"` nor `cnf` exists in the payload
 *
 * @param credential - A parsed Credential JWT object
 * @param context - The validation context, used to track the error location path
 * @returns An array containing a `VerificationError` if validation fails, or an empty array if valid
 *
 * @example
 * const errors = subIsDidJwkOrCnfVerifier(credentialJwt, context);
 *
 * @see {@link CredentialJwt}
 * @see {@link VerificationError}
 */
export const subIsDidJwkOrCnfVerifier: Verifier<CredentialJwt> = (
  credential,
  context
) => {
  const sub = credential.payload?.sub;
  const cnf = credential.payload?.cnf;

  if (sub !== 'did:jwk' && !cnf) {
    return [
      buildError(
        ERROR_CODES.SUB_OR_CNF_MISSING,
        `Expected sub to be 'did:jwk' or cnf to be present. Got sub=${sub}, cnf=${JSON.stringify(
          cnf
        )}`,
        [...(context.path ?? []), 'payload']
      ),
    ];
  }

  return [];
};
