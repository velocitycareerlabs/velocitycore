/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a structured validation error produced by a credential verifier.
 *
 * @remarks
 * Each `VerificationError` indicates a specific rule violation encountered during
 * credential or response validation. It includes a machine-readable `code`, a
 * human-readable `message`, and an optional `path` that identifies the exact
 * location of the issue in the data structure.
 *
 * This structure enables verifiers to generate consistent, traceable, and actionable
 * error reports for both developers and consumers of the library.
 *
 * @property code - A string identifier for the validation failure (e.g., `"invalid_alg"`, `"unexpected_credential_payload_iss"`).
 * @property message - A human-readable explanation of the failure, suitable for logging or user feedback.
 * @property path - (Optional) A JSON path (as an array of strings/numbers) pointing to the exact field in error.
 *
 * @example
 * ```ts
 * const error: VerificationError = {
 *   code: "invalid_alg",
 *   message: "Unsupported alg: 'HS256'",
 *   path: ["credentials", 0, "header", "alg"]
 * };
 * ```
 */
export type VerificationError = {
  code: string;
  message: string;
  path?: Array<string | number>;
};
