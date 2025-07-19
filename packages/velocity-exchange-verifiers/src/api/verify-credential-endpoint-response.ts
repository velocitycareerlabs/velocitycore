/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerificationError, ValidationContext } from 'impl/types';
import { verifyCredentialJwtPayloadStrict } from 'impl/rules';

/**
 * Verifies the structure and contents of a Credential Endpoint response.
 *
 * This function is intended to validate the full response body returned by a Credential Issuer
 * in immediate issuance flows, as defined by the OpenID for Verifiable Credential Issuance (OpenID4VCI) specification.
 * It delegates the verification of each credential inside the `credentials` array to
 * `verifyCredentialJwtPayloadStrict`, applying Velocity profile-level validation rules.
 *
 * ### What It Validates
 * - Iterates over `response.credentials[]`
 * - For each credential, applies strict JWT payload verification using:
 *   - `alg`, `iss`, `kid`, `sub/cnf`, `vc.credentialSchema`, `vc.credentialStatus`
 * - Collects all `VerificationError`s into a flat array
 *
 * ### Notes
 * - If `credentials` is missing or empty, the verifier behaves as a no-op.
 * - The `notification_id` field is not validated yet (see TODO).
 * - For deferred issuance flows (`transaction_id`, `interval`), use a separate verifier.
 *
 * @param response - The JSON response object from the credential endpoint
 * @param context - Validation context containing issuer metadata and path tracking
 * @returns An array of `VerificationError` objects from all credential verifications
 *
 * @example
 * const response = await fetchCredentialResponse();
 * const errors = verifyCredentialEndpointResponse(response, validationContext);
 * if (errors.length > 0) {
 *   logAndReject(errors);
 * }
 *
 * @see {@link verifyCredentialJwtPayloadStrict}
 * @see {@link VerificationError}
 * @see {@link ValidationContext}
 */
export const verifyCredentialEndpointResponse = (
  response: any,
  context: ValidationContext
): VerificationError[] => {
  const errors: VerificationError[] = [];

  const credentials = response.credentials ?? [];

  const credentialErrors = credentials.flatMap(
    (credential: any, i: string | number) =>
      verifyCredentialJwtPayloadStrict(credential, {
        ...context,
        path: ['credentials', i],
      })
  );

  errors.push(...credentialErrors);

  // TODO: Optionally validate notification_id here if needed

  return errors;
};
