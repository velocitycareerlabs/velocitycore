/**
 * Copyright 2023 Velocity Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import authConfig from './authConfig';

export const registrarApiScopes = [
  'read:organizations',
  'write:organizations',
  'read:users',
  'write:users',
  'admin:users',
  'admin:organizations',
  'admin:credentialTypes',
  'write:credentialTypes',
].join(' ');

export const defaultAuth0Scope = ['openid', 'offline_access'].join(' ');

export const accessTokenOptions = {
  audience: authConfig.audience,
  scope: registrarApiScopes,
};
