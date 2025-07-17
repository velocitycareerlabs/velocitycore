/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Verifier } from 'impl/types';

/**
 * Composes multiple single-purpose verifiers into a single compound verifier.
 *
 * Each individual verifier is applied to the same input `value` and shared `context`,
 * and their results (arrays of `VerificationError`s) are flattened into a single array.
 *
 * This utility allows you to define validation logic declaratively by assembling
 * reusable rules (verifiers) into a coherent validation pipeline.
 *
 * @typeParam T - The type of data the verifiers operate on (e.g., a credential JWT).
 *
 * @param rules - An array of `Verifier<T>` functions to be applied in sequence.
 * @returns A `Verifier<T>` that runs all rules and returns a combined list of validation errors.
 *
 * @example
 * const myVerifier = createVerifier([
 *   issClaimMatchesMetadata,
 *   kidClaimIsVelocityV2,
 *   algIsSupported
 * ]);
 *
 * const errors = myVerifier(credential, context);
 * if (errors.length > 0) {
 *   console.error("Validation failed:", errors);
 * }
 */
export const createVerifier =
  <T>(rules: Verifier<T>[]): Verifier<T> =>
  (value, context) => {
    return rules.flatMap((rule) => rule(value, context));
  };
