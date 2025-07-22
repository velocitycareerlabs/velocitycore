/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Provides shared context passed to all verifiers during credential validation.
 *
 * @remarks
 * The `VerificationContext` includes global metadata and environmental state used
 * by verifier functions to perform rule-based checks. This context enables validators
 * to access issuer metadata, full response data, and JSON path tracking for accurate
 * error localization.
 *
 * @property credential_issuer_metadata - The issuer metadata used for issuer validation rules.
 * @property credential_issuer_metadata.iss - The expected `iss` (issuer identifier).
 * @property credential_issuer_metadata.credential_issuer - An optional alternate issuer URI (used for OpenID4VCI fallback).
 * @property response - (Optional) The full Credential Endpoint response object. Useful when a rule needs global context.
 * @property path - (Optional) A hierarchical path to the current value being validated (used for precise error reporting).
 *
 * @example
 * ```ts
 * const context: VerificationContext = {
 *   credential_issuer_metadata: {
 *     iss: "did:velocity:issuer",
 *     credential_issuer: "https://issuer.velocity.network"
 *   },
 *   path: ["credentials", 0]
 * };
 * ```
 */
export type CredentialIssuerMetadata = {
  iss: string;
  credential_issuer?: string;
};

export type VerificationContext = {
  credential_issuer_metadata: CredentialIssuerMetadata;
  response?: unknown;
  path?: Array<string | number>;
};
