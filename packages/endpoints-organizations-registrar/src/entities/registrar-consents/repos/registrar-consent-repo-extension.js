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

const { castArray, map } = require('lodash/fp');
const { ObjectId } = require('mongodb');
const { nanoid } = require('nanoid');

const registrarConsentRepoExtension = (parent) => ({
  registerConsent: (consentParams, ...args) => {
    let consents = castArray(consentParams);
    consents = map((consent) => {
      const { userId, organization, type, version, ...rest } = consent;
      return {
        consentId: nanoid(),
        userId,
        organizationId: organization
          ? new ObjectId(organization._id)
          : undefined,
        version,
        type,
        createdAt: new Date(),
        ...rest,
      };
    }, consents);
    if (consents.length === 1) {
      return parent.insert(consents[0], ...args);
    }
    return parent.insertMany(consents, ...args);
  },
  extensions: parent.extensions.concat(['registrarConsentRepoExtension']),
});

module.exports = { registrarConsentRepoExtension };
