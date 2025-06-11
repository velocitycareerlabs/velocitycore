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

import { Link } from 'react-router';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Box } from '@mui/material';
import AppBarOrganization from './AppBarOrganization.jsx';
import { useIsUserHasGroup } from './hooks/useIsUserHasGroup.jsx';

const CustomAppBar = (props) => {
  const { hasOrganisations, isLoading } = useIsUserHasGroup();
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

export default CustomAppBar;
