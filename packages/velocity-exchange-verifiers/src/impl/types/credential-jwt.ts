/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a parsed Credential JWT (JWS) used in Verifiable Credential flows.
 *
 * This type models the decoded structure of a signed credential in JWT format,
 * including both the JOSE `header` and the credential `payload` according to
 * OpenID for Verifiable Credential Issuance (OpenID4VCI) and Velocity profile specifications.
 *
 * ### Structure
 * - `header`: Standard JWT header containing algorithm and optional fields.
 * - `payload`: Contains standard JWT claims and Verifiable Credential (`vc`) claims.
 *
 * ### Notable Fields
 * - `header.alg` — The algorithm used to sign the JWT (e.g., `ES256K`, `ES256`, `RS256`).
 * - `payload.iss` — Issuer identifier (must match expected metadata).
 * - `payload.sub` — Subject identifier (expected to be `"did:jwk"` or a confirmation key must be present).
 * - `payload.kid` — Key ID used to sign the JWT (Velocity profile expects a `did:velocity:v2` prefix).
 * - `payload.vc.credentialSchema` — Credential schema descriptor (must be present for strict profile compliance).
 * - `payload.vc.credentialStatus` — Credential status descriptor (must be present for revocation support).
 *
 * ### Usage
 * This type is used as the input for credential verification logic, including
 * `verifyCredentialJwtPayloadStrict`, to ensure conformance with spec and profile rules.
 */
export type CredentialJwt = {
  header: {
    alg: string;
    [key: string]: unknown;
  };
  payload: {
    iss: string;
    sub?: string;
    kid?: string;
    cnf?: unknown;
    vc: {
      credentialSchema?: unknown;
      credentialStatus?: unknown;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};
