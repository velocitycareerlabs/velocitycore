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

const initAuth0Provider = (user, auth0Logout) => ({
  // called when the user attempts to log in. Never called
  login: async () => {},
  // called when the user clicks on the logout button
  logout: () => {
    try {
      // In case of failed logout the previous stored did might be not cleared,
      // and would cause en error if the next user would have no access to organization with stored did.
      // So it is better to clear it manually before logout
      // eslint-disable-next-line no-undef
      localStorage.removeItem('RaStore.selectedOrganization');
      localStorage.removeItem('RaStore.agreedTermsAndConditionVersion');
    } catch (e) {
      // ...
    }
    auth0Logout({
      // eslint-disable-next-line no-undef
      redirect_uri: window.location.origin,
      federated: true, // have to be enabled to invalidate refresh token
    });
  },
  // called when the API returns an error
  checkError: async ({ status }) => {
    if (status === 401 || status === 403) {
      throw new Error(`Auth0 responded with an error ${status}`);
    }
  },
  // called when the user navigates to a new location, to check for authentication. Ignore calls
  checkAuth: async () => {},
  // called when the user navigates to a new location, to check for permissions / roles.  Ignore calls
  getPermissions: async () => {},
  // called when getting the user details. Ignore calls
  getIdentity: () => {
    return { id: user.sub, fullName: user.name, avatar: user.picture };
  },
});

export default initAuth0Provider;
