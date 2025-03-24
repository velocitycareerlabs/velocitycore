/**
 * Copyright 2024 Velocity Team
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
const { split, flow, map, join, compact } = require('lodash/fp');

const uriToDidWeb = (uri) => {
  const url = new URL(uri);
  const did = `did:web:${encodeURIComponent(url.host)}`;
  if (url.pathname == null || url.pathname === '/') {
    return did;
  }
  const path = flow(
    split('/'),
    compact,
    map(encodeURIComponent),
    join(':')
  )(url.pathname);
  return `${did}:${path}`;
};

module.exports = { uriToDidWeb };
