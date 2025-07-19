/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { VerificationError } from './verification-error';
import { ValidationContext } from './validation-context';

/**
 * Represents a reusable validation rule that checks a value against a specific constraint.
 *
 * A `Verifier<T>` is a pure function that receives:
 * - `value`: the target data to be validated (e.g., a parsed Credential JWT)
 * - `context`: additional metadata and path information used during validation
 *
 * The function returns a list of `VerificationError` objects describing any violations of the rule.
 * If the value is valid, it must return an empty array. Verifiers are designed to be
 * stateless, composable, and isolated — allowing them to be used in custom rule engines
 * or combined using `createVerifier(...)`.
 *
 * ### Usage Example
 * ```ts
 * const issVerifier: Verifier<CredentialJwt> = (credential, context) => {
 *   if (credential.payload.iss !== context.credential_issuer_metadata.iss) {
 *     return [
 *       buildError('UNEXPECTED_ISS', 'Issuer mismatch', ['payload', 'iss']),
 *     ];
 *   }
 *   return [];
 * };
 * ```
 *
 * @template T - The type of data being validated (e.g., CredentialJwt)
 * @param value - The value under validation
 * @param context - The shared context used for validation (includes path and metadata)
 * @returns An array of `VerificationError` objects, or an empty array if valid
 *
 * @see {@link VerificationError}
 * @see {@link ValidationContext}
 */
export type Verifier<T> = (
  value: T,
  context: ValidationContext
) => VerificationError[];
