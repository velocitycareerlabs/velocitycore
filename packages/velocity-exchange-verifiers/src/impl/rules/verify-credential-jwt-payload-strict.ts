/* eslint-disable max-len */
/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  algIsSupportedVerifier,
  createVerifier,
  credentialSchemaVerifier,
  credentialStatusVerifier,
  issClaimMatchesEitherMetadataOrCredentialIssuerVerifier,
  issClaimMatchesMetadataVerifier,
  kidClaimIsVelocityV2Verifier,
  subIsDidJwkOrCnfVerifier,
} from 'impl/verifiers/pure-verifiers';

/**
 * Validates a Credential JWT payload against the Velocity Profile and OpenID4VCI specification.
 *
 * This verifier applies a strict rule set, combining both **Velocity Profile Conformance** and
 * **spec-level issuer fallback logic**, to ensure maximum security and ecosystem compatibility.
 * Each rule is implemented as a modular, reusable verifier.
 *
 * ### What This Verifier Checks
 * - `header.alg` is one of: `ES256`, `ES256K`, `RS256` (via `algIsSupportedVerifier`)
 * - `payload.vc.credentialSchema` is defined (via `credentialSchemaVerifier`)
 * - `payload.vc.credentialStatus` is defined (via `credentialStatusVerifier`)
 * - `payload.iss` passes **both**:
 *   - `issClaimMatchesMetadataVerifier`: strictly matches `credential_issuer_metadata.iss` (Velocity Profile)
 *   - `issClaimMatchesEitherMetadataOrCredentialIssuerVerifier`: matches `credential_issuer_metadata.iss` **or** `credential_issuer_metadata.credential_issuer` (OpenID4VCI fallback)
 * - `payload.kid` starts with `did:velocity:v2` (via `kidClaimIsVelocityV2Verifier`)
 * - `payload.sub === "did:jwk"` **or** `payload.cnf` exists (via `subIsDidJwkOrCnfVerifier`)
 *
 * ### Error Handling
 * - Returns an array of `VerificationError` objects if validation fails.
 * - Each error includes a code, message, and hierarchical path to the failing field.
 *
 * ### Usage
 * @example
 * const errors = verifyCredentialJwtPayloadStrict(credentialJwt, validationContext);
 * if (errors.length > 0) {
 *   // Handle or report validation failures
 * }
 *
 * @param credential - A parsed Credential JWT containing `header` and `payload`
 * @param context - Validation context including issuer metadata and optional path
 * @returns An array of `VerificationError` objects, or an empty array if the credential is valid
 *
 * @see {@link CredentialJwt}
 * @see {@link VerificationError}
 */
export const verifyCredentialJwtPayloadStrict = createVerifier<any>([
  algIsSupportedVerifier,
  credentialSchemaVerifier,
  credentialStatusVerifier,
  issClaimMatchesEitherMetadataOrCredentialIssuerVerifier,
  issClaimMatchesMetadataVerifier,
  kidClaimIsVelocityV2Verifier,
  subIsDidJwkOrCnfVerifier,
]);
