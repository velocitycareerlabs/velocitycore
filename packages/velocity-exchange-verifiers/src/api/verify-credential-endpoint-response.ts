/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerificationError, VerificationContext } from 'impl/types';
import { verifyCredentialJwtPayloadStrict } from 'impl/rules';
import { withPath } from 'impl/utils';

/**
 * Verifies the structure and contents of a Credential Endpoint response.
 *
 * @param response - The JSON object returned by a Credential Issuer's Credential Endpoint.
 * @param context - Validation context containing issuer metadata and the current location path.
 * @returns An array of {@link VerificationError | VerificationError} objects describing all detected issues.
 *
 * @remarks
 * This validator is intended for **immediate issuance flows** defined by the
 * OpenID for Verifiable Credential Issuance (OpenID4VCI) specification.
 *
 * For each entry in `response.credentials[]`, this function delegates to
 * {@link verifyCredentialJwtPayloadStrict} to apply Velocity profile–level validation, including:
 *
 * - Supported signing algorithm (`alg`)
 * - Issuer consistency (`iss`)
 * - Key identifier prefix (`kid`)
 * - Subject binding (`sub` or `cnf`)
 * - Presence of `vc.credentialSchema`
 * - Presence of `vc.credentialStatus`
 *
 * All `VerificationError` objects produced by per-credential validation are flattened and returned.
 *
 * #### Behavior Notes
 * - If `response.credentials` is **missing or empty**, validation is a no-op and returns `[]`.
 * - `notification_id` is **not validated** yet. (TODO)
 * - Deferred issuance responses (`transaction_id`, `interval`) are **out of scope**; use a dedicated verifier.
 *
 * @example
 * ```ts
 * import { verifyCredentialEndpointResponse } from '...';
 *
 * const response = await fetchCredentialResponse();
 * const errors = verifyCredentialEndpointResponse(response, verificationContext);
 * if (errors.length > 0) {
 *   logAndReject(errors);
 * }
 * ```
 *
 * @see {@link verifyCredentialJwtPayloadStrict}
 * @see {@link VerificationError}
 * @see {@link VerificationContext}
 */
export const verifyCredentialEndpointResponse = (
  response: any,
  context: VerificationContext
): VerificationError[] => {
  const credentials = response.credentials ?? [];

  return credentials.flatMap((credential: any, i: number) =>
    verifyCredentialJwtPayloadStrict(
      credential,
      withPath(context, ['credentials', i])
    )
  );
};
