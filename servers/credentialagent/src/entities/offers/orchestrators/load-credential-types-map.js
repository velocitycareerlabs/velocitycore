/*
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
 *
 */

const {
  getCredentialTypeMetadata,
} = require('@velocitycareerlabs/common-fetchers');
const { flow, keyBy, map, uniq } = require('lodash/fp');
const { extractCredentialType } = require('@velocitycareerlabs/vc-checks');

/** @import { VelocityOffer, Context, CredentialTypeMetadata } from "@velocitycareerlabs/velocity-issuing" */

/**
 * Gets credential metadata from the Velocity Network registrar
 * @param {VelocityOffer[]} offers The offers that need metadata
 * @param {Context} context the context
 * @returns {Promise<{[Name: string]: CredentialTypeMetadata}>} the map of types to metadata
 */
const loadCredentialTypesMap = async (offers, context) => {
  const offerCredentialTypes = flow(
    map((offer) => extractCredentialType(offer)),
    uniq
  )(offers);
  const credentialTypeMetadataList = await getCredentialTypeMetadata(
    offerCredentialTypes,
    context
  );
  return keyBy('credentialType', credentialTypeMetadataList);
};

module.exports = {
  loadCredentialTypesMap,
};
