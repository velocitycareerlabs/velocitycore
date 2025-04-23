/**
 * Created by Michael Avoyan on 23/04/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */

export const verifyToken = (token) => {
  return token?.accessToken?.jwtValue?.payload?.exp >= Date.now() / 1000;
};
