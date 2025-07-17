/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a structured validation error produced by a credential verifier.
 *
 * Each `VerificationError` describes a specific rule violation encountered during
 * credential or response validation. It includes a machine-readable error code,
 * a human-readable message, and an optional path pointing to the exact location
 * of the issue within the data structure.
 *
 * Fields:
 * - `code`: A string identifier for the type of validation failure (e.g., "invalid_kid", "unexpected_credential_payload_iss").
 * - `message`: A human-readable description of the validation failure, suitable for logs or developer feedback.
 * - `path`: An optional JSON path (as an array) indicating the location of the invalid value within the input.
 *
 * This structure allows verifiers to produce consistent, traceable, and actionable error reports.
 *
 * @example
 * const error: VerificationError = {
 *   code: "invalid_alg",
 *   message: "Unsupported alg: 'HS256'",
 *   path: ["credentials", 0, "header", "alg"]
 * };
 */
export type VerificationError = {
  code: string;
  message: string;
  path?: (string | number)[];
};
