/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Shared context passed to all verifiers during credential validation.
 *
 * The `ValidationContext` contains metadata and environmental information
 * that verifiers use to perform rule-based checks on a credential or response.
 *
 * Fields:
 * - `credential_issuer_metadata.iss`: The expected issuer identifier (`iss`) from the credential issuer metadata.
 * - `credential_issuer_metadata.credential_issuer`: Optional alternate issuer reference (used in some spec contexts).
 * - `response`: Optional full credential endpoint response object, in case verifiers need to cross-reference it.
 * - `path`: Optional JSON path to the current value being validated. Used to generate precise and traceable error locations.
 *
 * This context is passed alongside each value to be verified, and is useful for
 * rules that require global or parent-level knowledge beyond the local credential structure.
 *
 * @example
 * const context: ValidationContext = {
 *   credential_issuer_metadata: { iss: "did:velocity:issuer" },
 *   path: ["credentials", 0]
 * };
 */
export type ValidationContext = {
  credential_issuer_metadata: {
    iss: string;
    credential_issuer?: string;
  };
  response?: any;
  path?: (string | number)[];
};
