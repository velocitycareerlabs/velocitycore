/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A constant object defining all supported error codes used by credential validation verifiers.
 *
 * @remarks
 * Each error code represents a specific type of validation failure.
 *
 * @example
 * ```ts
 * if (error.code === ERROR_CODES.MISSING_CREDENTIAL_SCHEMA) {
 *   // Handle missing schema case
 * }
 * ```
 *
 * @see {@link VerificationError.code}
 */
export const ERROR_CODES = {
  INVALID_ALG: 'invalid_alg',
  INVALID_KID: 'invalid_kid',
  SUB_OR_CNF_MISSING: 'sub_or_cnf_missing',
  UNEXPECTED_CREDENTIAL_PAYLOAD_ISS: 'unexpected_credential_payload_iss',
  UNEXPECTED_CREDENTIAL_ISSUER_METADATA:
    'unexpected_credential_credential_issuer_metadata',
  MISSING_CREDENTIAL_STATUS: 'missing_credential_status',
  MISSING_CREDENTIAL_SCHEMA: 'missing_credential_schema',
} as const;

/**
 * A strict union type of all known error code values from `ERROR_CODES`.
 *
 * Can be used to type-check the `code` field in a `VerificationError` object,
 * ensuring only known codes are allowed.
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
