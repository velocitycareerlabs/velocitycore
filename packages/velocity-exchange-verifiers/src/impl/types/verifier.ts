/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { VerificationError } from './verification-error';
import { VerificationContext } from './verification-context';

/**
 * Represents a reusable validation rule that checks a value against a specific constraint.
 *
 * @remarks
 * A `Verifier<T>` is a pure function that accepts a `value` and a `context`, returning
 * a list of {@link VerificationError} objects representing any validation rule violations.
 * Verifiers are designed to be stateless, composable, and isolated, making them suitable
 * for custom rule engines or use within higher-order validation pipelines like `createVerifier(...)`.
 *
 * @template T - The type of data being validated (e.g., {@link CredentialJwt}).
 *
 * @param value - The value to be validated.
 * @param context - Shared validation context including metadata and optional path tracing.
 * @returns An array of {@link VerificationError} objects if validation fails, or an empty array if the value is valid.
 *
 * @example
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
 * @see {@link VerificationError}
 * @see {@link VerificationContext}
 */
export type Verifier<T> = (
  value: T,
  context: VerificationContext
) => VerificationError[];
