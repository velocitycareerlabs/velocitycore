/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a parsed Credential JWT (JWS) used in Verifiable Credential flows.
 *
 * @remarks
 * This type models the decoded structure of a signed credential in JWT format,
 * as defined by the OpenID for Verifiable Credential Issuance (OpenID4VCI) and
 * Velocity Profile specifications. It includes both the JOSE `header` and the
 * credential `payload`.
 *
 * @property header - A standard JWT header object, including the `alg` field specifying the signature algorithm.
 * @property payload - The JWT payload, including standard claims and Verifiable Credential claims.
 *
 * @example
 * ```ts
 * const credential: CredentialJwt = {
 *   header: { alg: "ES256K" },
 *   payload: {
 *     iss: "https://issuer.example.com",
 *     sub: "did:jwk",
 *     kid: "did:velocity:v2:issuer#key-1",
 *     vc: {
 *       credentialSchema: { ... },
 *       credentialStatus: { ... }
 *     }
 *   }
 * };
 * ```
 *
 * @see {@link verifyCredentialJwtPayloadStrict}
 */
export type CredentialJwt = {
  header: {
    /** The algorithm used to sign the JWT (e.g., ES256K, ES256, RS256) */
    alg: string;
    [key: string]: unknown;
  };
  payload: {
    /** The credential issuer (must match issuer metadata) */
    iss: string;
    /** Optional subject identifier (should be "did:jwk" or accompanied by `cnf`) */
    sub?: string;
    /** Optional Key ID (should start with `did:velocity:v2` for Velocity conformance) */
    kid?: string;
    /** Optional confirmation object used for subject binding */
    cnf?: unknown;
    /** Verifiable Credential object with required fields for validation */
    vc: {
      /** Optional credential schema (required by Velocity profile) */
      credentialSchema?: unknown;
      /** Optional credential status (required for revocation support) */
      credentialStatus?: unknown;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};
