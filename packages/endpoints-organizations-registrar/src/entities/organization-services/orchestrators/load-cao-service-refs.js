/*
 * Copyright 2025 Velocity Team
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
 *
 */

const { isEmpty, flow, map, find, fromPairs } = require('lodash/fp');
const { splitDidUrlWithFragment } = require('@velocitycareerlabs/did-doc');
const { extractCaoServiceRefs } = require('../domains');

const loadCaoServiceRefs = async (services, { repos }) => {
  const caoServiceIds = extractCaoServiceRefs(services);
  const caoOrganizations = await repos.organizations.findCaos(caoServiceIds);
  return buildReferenceCaoServices({
    caoServiceIds,
    caoOrganizations,
  });
};

const buildReferenceCaoServices = ({ caoServiceIds, caoOrganizations }) => {
  if (isEmpty(caoOrganizations) || isEmpty(caoServiceIds)) {
    return {};
  }
  return flow(
    map((caoServiceId) => {
      const [caoDid, serviceFragment] = splitDidUrlWithFragment(caoServiceId);
      const caoOrganization = find(
        (org) => org.didDoc.id === caoDid,
        caoOrganizations
      );
      const caoService = find(
        { id: serviceFragment },
        caoOrganization?.services
      );
      return [caoServiceId, { caoOrganization, caoService }];
    }),
    fromPairs
  )(caoServiceIds);
};

module.exports = {
  loadCaoServiceRefs,
  buildReferenceCaoServices,
};
