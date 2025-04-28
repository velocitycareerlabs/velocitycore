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

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Box } from '@mui/material';
import { useRedirect } from 'react-admin';
import AppBarOrganization from './AppBarOrganization.jsx';
import useSelectedOrganization from '../../state/selectedOrganizationState';
import { parseJwt } from '../../utils/index.jsx';
import chainNames from '../../utils/chainNames';
import { useAuth } from '../../utils/auth/AuthContext';
import { useConfig } from '../../utils/ConfigContext';

const CustomAppBar = (props) => {
  const { getAccessTokenWithPopup, getAccessToken } = useAuth();
  const { chainName } = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [hasOrganisations, setHasOrganisations] = useState(false);
  const [, setDid] = useSelectedOrganization();
  const redirect = useRedirect();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const token = await getAccessToken();
        const userHasGroup = Boolean(doesUserHaveGroup(parseJwt(token), chainName));
        setHasOrganisations(userHasGroup);
        if (userHasGroup) {
          return;
        }

        setDid('');
        if (!/organizations\/create/.test(location.pathname)) {
          redirect('create', 'organizations', undefined, undefined, { userHasGroup });
        }
      } catch (e) {
        if (e.error === 'consent_required') {
          await getAccessTokenWithPopup();
        }
        throw e;
      } finally {
        setIsLoading(false);
      }
    })();
  }, [
    getAccessToken,
    getAccessTokenWithPopup,
    location,
    redirect,
    setDid,
    chainName,
    setIsLoading,
  ]);

  const isLogoDisabled = isLoading || !hasOrganisations;

  return (
    <AppBar {...props} elevation={0}>
      <Toolbar>
        <Link
          to={isLogoDisabled ? undefined : '/'}
          style={{ display: 'flex', ...(isLogoDisabled ? { pointerEvents: 'none' } : {}) }}
          aria-disabled={isLogoDisabled}
          disabled={isLogoDisabled}
          role="link"
        >
          <img src="/assets/images/logo.svg" alt="Velocity" />
        </Link>
        <Box flex={1} />
        {hasOrganisations && <AppBarOrganization />}
      </Toolbar>
    </AppBar>
  );
};

const doesUserHaveGroup = (decodedToken, chainName) =>
  decodedToken['http://velocitynetwork.foundation/groupId'] ||
  decodedToken.scope.includes('admin') ||
  chainName === chainNames.localnet;

export default CustomAppBar;
