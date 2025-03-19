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
import { Link, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Box } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useRedirect } from 'react-admin';
import AppBarOrganization from './AppBarOrganization';
import useSelectedOrganization from '../../state/selectedOrganizationState';
import { getAccessToken } from '../../utils/auth/tokenService';
import { accessTokenOptions } from '../../utils/auth/authProviderOptions';
import { parseJwt } from '../../utils';
import mainConfig, { chainNames } from '../../utils/mainConfig';

const CustomAppBar = (props) => {
  const { getAccessTokenWithPopup } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);
  const [hasOrganisations, setHasOrganisations] = useState(false);
  const [, setDid] = useSelectedOrganization();
  const redirect = useRedirect();
  const location = useLocation();

  useEffect(() => {
    const getAccessTokenRequest = async () => {
      setIsLoading(true);
      try {
        const token = await getAccessToken();
        const tokenDecoded = parseJwt(token);
        const userHasGroup = Boolean(
          tokenDecoded['http://velocitynetwork.foundation/groupId'] ||
            tokenDecoded.scope.includes('admin') ||
            mainConfig.chainName === chainNames.localnet,
        );
        setHasOrganisations(userHasGroup);
        const isCreateServicePage = /organizations\/create\/service/.test(location.pathname);
        if (!userHasGroup) {
          setDid('');
        }
        if (!userHasGroup && !isCreateServicePage) {
          redirect('create', 'organizations', undefined, undefined, { userHasGroup });
        }
      } catch (e) {
        if (e.error === 'consent_required') {
          await getAccessTokenWithPopup(accessTokenOptions);
        }
        throw e;
      } finally {
        setIsLoading(false);
      }
    };
    getAccessTokenRequest();
  }, [getAccessTokenWithPopup, location, redirect, setDid]);

  const isLogoDisabled = isLoading || !hasOrganisations;

  return (
    <AppBar {...props} elevation={0}>
      <Toolbar>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
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

export default CustomAppBar;
