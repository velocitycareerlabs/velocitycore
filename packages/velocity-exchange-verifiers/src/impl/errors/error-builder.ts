/**
 * Created by Michael Avoyan on 17/07/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { VerificationError } from '../types';
import { ErrorCode } from './error-codes';

/**
 * Constructs a `VerificationError` object with the specified code, message, and error path.
 *
 * This utility function standardizes error creation across verifiers, ensuring a consistent
 * structure for all validation errors returned by the verification framework.
 *
 * @param code - A known `ErrorCode` indicating the type of validation failure.
 * @param message - A human-readable description of the error.
 * @param path - An optional array representing the JSON path to the offending field,
 *               useful for pinpointing the exact location in nested structures.
 * @returns A `VerificationError` object conforming to the framework's expected shape.
 */
export const buildError = (
  code: ErrorCode,
  message: string,
  path: (string | number)[] = []
): VerificationError => ({ code, message, path });
