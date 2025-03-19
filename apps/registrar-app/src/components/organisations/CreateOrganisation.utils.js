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

import { email, maxLength, required, regex } from 'react-admin';
import { validUrlRegexp, secureUrlRegexp, webSiteRegexp, webSiteHttpsRegexp } from '../../utils';

const urlValidation = (value) => {
  if (!(value && validUrlRegexp.test(value.trim()))) {
    return 'Please type in a valid URL';
  }
  if (!(value && secureUrlRegexp.test(value.trim()))) {
    return `Invalid service endpoint url '${value}'. https is required`;
  }
  return undefined;
};

export const validateUrl = [regex(secureUrlRegexp, 'Please type in a valid URL'), maxLength(1024)];
export const validateWebsite = [
  regex(webSiteRegexp, 'Please type in a valid URL'),
  regex(webSiteHttpsRegexp, 'Https is required'),
  maxLength(1024),
];
export const validateName = [required(), maxLength(100)];
export const validateServiceEndpoint = [urlValidation, maxLength(1024)];
export const validateEmail = [email()];

const getYearsFounded = () => {
  let currentYear = new Date().getFullYear();
  const earliestYear = 1900;
  const years = [];

  while (currentYear >= earliestYear) {
    years.push({ id: currentYear, name: currentYear });
    // eslint-disable-next-line better-mutation/no-mutation
    currentYear -= 1;
  }

  return years;
};
export const yearsFounded = getYearsFounded();
