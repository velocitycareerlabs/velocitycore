/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Defines a fixed set of error codes used across credential validation verifiers.
 *
 * Each code corresponds to a specific validation failure condition, and is intended
 * to be machine-readable and stable for use in error handling, logging, or client-facing
 * messages.
 */
export const ERROR_CODES = {
  INVALID_ALG: 'invalid_alg',
  INVALID_KID: 'invalid_kid',
  SUB_OR_CNF_MISSING: 'sub_or_cnf_missing',
  UNEXPECTED_CREDENTIAL_PAYLOAD_ISS: 'unexpected_credential_payload_iss',
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
