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

import { useAuth0, Auth0Provider } from '@auth0/auth0-react';

// material
import OrganizationIcon from '@mui/icons-material/Business';

// react-router-dom
import { Route, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

// react admin
import { Admin, Resource, CustomRoutes, useStore } from 'react-admin';

import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { QueryClient } from '@tanstack/react-query';

// pages
// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import OrganizationShow from './pages/organizations/OrganizationShow';
import OrganizationEdit from './pages/organizations/OrganizationEdit';
import OrganizationCreate from './pages/organizations/OrganizationCreate';
import IndividualsShow from './pages/individuals/IndividualsShow';
import IndividualsEdit from './pages/individuals/IndividualsEdit';
import IndividualsDashboard from './pages/individuals/IndividualsDashboard';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CreateOrganisationFromInvitation from './pages/invitations/CreateOrganisationFromInvitation';
import ServicesList from './pages/services/ServicesList';
import InvitationsList from './pages/invitations/InvitationsList';
import SignatoryLanding from './pages/SignatoryLanding';

import { defaultAuth0Scope, registrarApiScopes } from './utils/auth/authProviderOptions';
import authConfig from './utils/auth/authConfig';

// components
import Dashboard from './components/Dashboard';
import Loading from './components/Loading';
import Footer from './components/Footer';
import authProvider from './utils/skeletonAuthProvider';
import MainLayout from './layouts/MainLayout';
import { tokenService } from './utils/auth/tokenService';
import dataProvider from './utils/remoteDataProvider';
import theme from './theme/theme';
import ConsentProvider from './components/ConsentProvider';

const publicRoutes = ['/privacy-policy', '/terms-and-conditions', /^\/signatories\/[^/]+$/];

const isPublicRoute = (pathname) =>
  publicRoutes.some((route) =>
    typeof route === 'string' ? route === pathname : route.test(pathname),
  );

const App = () => {
  const location = useLocation();

  if (isPublicRoute(location.pathname)) {
    return <AppAuth0Disabled />;
  }

  return (
    <AuthProvider>
      <AppAuth0Enabled />
    </AuthProvider>
  );
};

const AppAuth0Disabled = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });
  return (
    <>
      <Admin
        theme={theme}
        dataProvider={dataProvider}
        queryClient={queryClient}
        dashboard={Dashboard}
        requireAuth
        layout={MainLayout}
        title=""
        basename=""
      >
        <CustomRoutes noLayout>
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/signatories/:response" element={<SignatoryLanding />} />
        </CustomRoutes>
      </Admin>
      <Footer />
    </>
  );
};

const AppAuth0Enabled = () => {
  const { user, getAccessTokenSilently, logout, isAuthenticated, isLoading, loginWithRedirect } =
    useAuth0();
  tokenService.setAccessTokenSilently(getAccessTokenSilently);

  const [searchParams] = useSearchParams();
  const signUpUrl = searchParams.get('signup_url');
  const [isSignUpProccess, setIsSignUpProccess] = useStore('isSignUpProccess');
  const isReadyToAuth = !isLoading && !isAuthenticated;
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  useEffect(() => {
    setIsSignUpProccess(!!signUpUrl && localStorage.getItem('signUpUrl') !== signUpUrl);
  }, [setIsSignUpProccess, signUpUrl]);

  useEffect(() => {
    if (isSignUpProccess) {
      localStorage.setItem('signUpUrl', signUpUrl);
      localStorage.setItem('createInvitationURL', window.location.pathname);

      logout().then(() => {
        window.location.replace(decodeURI(signUpUrl));
      });
    } else {
      const savedURLToRedirectAfterPasswordSet = localStorage.getItem('createInvitationURL');

      if (isReadyToAuth && !isSignUpProccess) {
        loginWithRedirect({
          appState: {
            returnTo: savedURLToRedirectAfterPasswordSet || window.location.pathname,
          },
        }).then(() => {
          if (savedURLToRedirectAfterPasswordSet) {
            localStorage.removeItem('createInvitationURL');
          }
        });
      }
    }
  }, [isReadyToAuth, loginWithRedirect, isSignUpProccess, signUpUrl, logout]);

  if (isLoading || !isAuthenticated || isSignUpProccess) {
    return <Loading sx={{ pt: '60px' }} />;
  }

  return (
    <ConsentProvider>
      <Admin
        theme={theme}
        authProvider={authProvider(user, () => {
          logout({
            clientId: authConfig.clientId,
            logoutParams: {
              federated: true,
              returnTo: window.location.origin,
            },
          });
        })}
        dataProvider={dataProvider}
        queryClient={queryClient}
        dashboard={Dashboard}
        requireAuth
        layout={MainLayout}
        title=""
        basename=""
      >
        <Resource
          name="organizations"
          icon={OrganizationIcon}
          show={OrganizationShow}
          list={Dashboard}
          edit={OrganizationEdit}
          create={OrganizationCreate}
        />
        <Resource
          name="individuals"
          list={IndividualsDashboard}
          show={IndividualsShow}
          edit={IndividualsEdit}
        />
        <Resource name="services" list={ServicesList} create={ServicesList} />
        <Resource name="users" />
        <Resource name="invitations" list={InvitationsList} create={InvitationsList} />
        <CustomRoutes noLayout>
          <Route exact path="/invitations/:code" element={<CreateOrganisationFromInvitation />} />
        </CustomRoutes>
      </Admin>
      <Footer />
    </ConsentProvider>
  );
};

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      useRefreshTokens
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        audience: authConfig.audience,
        scope: `${registrarApiScopes} ${defaultAuth0Scope}`,
        redirect_uri: authConfig.redirectUri,
        connection: authConfig.connection,
      }}
    >
      {children}
    </Auth0Provider>
  );
};

// eslint-disable-next-line better-mutation/no-mutation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default App;
