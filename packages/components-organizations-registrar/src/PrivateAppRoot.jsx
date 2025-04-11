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
// react admin
import { Admin } from 'react-admin';

import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { QueryClient } from '@tanstack/react-query';

// pages

import React from 'react';

// components
import Dashboard from './components/Dashboard.jsx';
import Loading from './components/Loading.jsx';
import Footer from './components/Footer.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import ConsentProvider from './components/ConsentProvider.jsx';
import initReactAdminAuthProvider from './utils/reactAdminAuthProvider';
import { useAuth } from './utils/auth/AuthContext';
import useSignupRedirect from './utils/auth/useSignupRedirect';
import theme from './theme/theme';
import remoteDataProvider from './utils/remoteDataProvider';
import { useConfig } from './utils/ConfigContext';

export const PrivateAppRoot = ({ children }) => {
  const auth = useAuth();
  const config = useConfig();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });
  const { isSignupProcess } = useSignupRedirect({ auth });

  if (!auth.isAuthenticated || auth.isLoading || isSignupProcess) {
    return <Loading sx={{ pt: '60px' }} />;
  }

  return (
    <ConsentProvider>
      <Admin
        theme={theme}
        authProvider={initReactAdminAuthProvider(auth)}
        dataProvider={remoteDataProvider(config, auth)}
        queryClient={queryClient}
        dashboard={Dashboard}
        requireAuth
        layout={MainLayout}
        title=""
        basename=""
      >
        {children}
      </Admin>
      <Footer />
    </ConsentProvider>
  );
};

// eslint-disable-next-line better-mutation/no-mutation
PrivateAppRoot.propTypes = {
  children: PropTypes.node.isRequired,
};
