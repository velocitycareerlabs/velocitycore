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

import { Stack, Typography } from '@mui/material';
import { Link as ReactRouterLink, useParams } from 'react-router-dom';
import { useCreateController, useGetOne, useRedirect, useLogout } from 'react-admin';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import CreateOrganisation from '../../components/organizations/CreateOrganization.jsx';
import useCountryCodes from '../../utils/countryCodes';
import Loading from '../../components/Loading.jsx';
import useSelectedOrganization from '../../state/selectedOrganizationState';
import SecretKeysPopup from './SecretKeysPopup.jsx';
import WarningSecretKeysPopup from '../../components/common/WarningSecretKeysPopup.jsx';
import InvitationServiceInfo from '../../components/invitations/InvitationServiceInfo.jsx';
import { FOOTER_HEIGHT } from '../../theme/theme';
import Popup from '../../components/common/Popup.jsx';
import { MESSAGE_CODES } from '../../constants/messageCodes';
import { formatWebSiteUrl, formatRegistrationNumbers, parseJwt } from '../../utils/index.jsx';
import { dataResources } from '../../utils/remoteDataProvider';
import { useAuth } from '../../utils/auth/AuthContext';

const CreateOrganisationFromInvitation = () => {
  const { code } = useParams();
  const queryClient = useQueryClient();
  const redirect = useRedirect();
  const [, setDid] = useSelectedOrganization();
  const [isLoader, setIsLoader] = useState(false);
  const [secretKeys, setSecretKeys] = useState(null);
  const [messageCode, setMessageCode] = useState(null);
  const [isOpenSecretPopup, setIsOpenSecretPopup] = useState(false);
  const [isOpenWarningSecretPopup, setIsOpenWarningSecretPopup] = useState(false);
  const [isOpenNotExistingPopup, setIsOpenNotExistingPopup] = useState(false);
  const [isOpenExpiredPopup, setIsOpenExpiredPopup] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [isLoadingKeysError, setIsLoadingKeysError] = useState(false);
  const { data: countryCodes, isLoading } = useCountryCodes();
  const [hasOrganisations, setHasOrganisations] = useState(false);
  const auth = useAuth();
  const { user, getAccessToken } = auth;
  const { data: userData, isLoading: isUserDataLoading } = useGetOne(dataResources.USERS, {
    id: user.sub,
  });
  const { data: invitationData, isLoading: invitationIsLoading } = useGetOne(
    'invitations',
    {
      id: code,
    },
    {
      onError: (error) => {
        if (error?.body?.statusCode === 404) {
          setIsOpenNotExistingPopup(true);
        }
        if (
          error?.body?.statusCode === 400 &&
          error?.body?.errorCode === MESSAGE_CODES.INVITATION_EXPIRED
        ) {
          setIsOpenExpiredPopup(true);
        }
      },
    },
  );

  const { data: inviterInfo = { credentialSubject: { name: '' } }, isLoading: isLoadingOrgData } =
    useGetOne(
      dataResources.VERIFIED_PROFILE,
      { id: invitationData?.inviterDid },
      { enabled: !!invitationData?.inviterDid },
    );

  const handleWarningSecretKeyPopupClose = useCallback(() => {
    setIsOpenWarningSecretPopup(false);
    redirect('/');
  }, [redirect]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        const tokenDecoded = parseJwt(token);
        setHasOrganisations(
          Boolean(
            tokenDecoded['http://velocitynetwork.foundation/groupId'] ||
              tokenDecoded.scope.includes('admin'),
          ),
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const { save, saving: creatingIsLoading } = useCreateController({
    resource: 'organizations',
    mutationOptions: {
      onSuccess: async (resp) => {
        await queryClient.invalidateQueries(['organizations', 'getList']);
        setDid(resp.id);
        setSecretKeys({ keys: resp.keys, authClients: resp.authClients });
        setMessageCode(resp.messageCode && resp.messageCode === MESSAGE_CODES.KEY_TRANFER_SUCCESS);
        setIsOpenSecretPopup(true);
        getAccessToken({ cacheMode: 'off' });
      },
    },
  });

  const logout = useLogout();

  useEffect(() => {
    const inviteeEmail = invitationData?.inviteeEmail;
    const userEmail = userData?.email;

    if (inviteeEmail && userEmail && userEmail !== inviteeEmail) {
      localStorage.setItem('createInvitationURL', window.location.pathname);
      logout(auth, window.location.href, true);
    }
  }, [userData, invitationData, logout, auth]);

  useEffect(() => {
    if (isOpenWarningSecretPopup && !isLoadingKeys && !isLoadingKeysError && isDownloaded) {
      handleWarningSecretKeyPopupClose();
    }
  }, [
    isOpenWarningSecretPopup,
    isLoadingKeys,
    isLoadingKeysError,
    isDownloaded,
    handleWarningSecretKeyPopupClose,
  ]);

  const handleSubmit = async (formData) => {
    await save({
      profile: {
        ...formData,
        website: formatWebSiteUrl(formData.website),
        linkedInProfile: formatWebSiteUrl(formData.linkedInProfile),
        registrationNumbers: formatRegistrationNumbers(formData.registrationNumbers),
      },
      serviceEndpoints: invitationData?.inviteeService,
      invitationCode: code,
    });
  };

  useEffect(() => {
    setIsLoader(isLoading || invitationIsLoading || isLoadingOrgData || isUserDataLoading);
  }, [isLoading, invitationIsLoading, isLoadingOrgData, isUserDataLoading]);

  return (
    <Stack sx={sxStyles.root}>
      <AppBar position="static" sx={sxStyles.appBar}>
        <Toolbar>
          <ReactRouterLink to="/" style={{ display: 'flex' }} role="link">
            <img src="/assets/images/logo.svg" alt="Velocity" />
          </ReactRouterLink>
        </Toolbar>
      </AppBar>
      <Stack sx={{ flexGrow: 1 }}>
        {isLoader ? (
          <Loading sx={sxStyles.loader} />
        ) : (
          <CreateOrganisation
            buttonTitle="Save"
            userData={userData}
            isLoading={creatingIsLoading}
            title="Welcome"
            subTitle={`${inviterInfo.credentialSubject.name} has invited you to join Velocity Network™. Complete/edit your organization
            profile below and click SAVE to complete your registration.`}
            onSubmit={handleSubmit}
            defaultValues={{
              ...invitationData?.inviteeProfile,
              ...invitationData?.keyIndividuals,
            }}
            countryCodes={countryCodes}
            hasOrganisations={hasOrganisations}
          >
            <InvitationServiceInfo inviteeService={invitationData?.inviteeService} />
          </CreateOrganisation>
        )}
        <SecretKeysPopup
          isModalOpened={isOpenSecretPopup}
          onClose={() => setIsOpenSecretPopup(false)}
          secretKeys={secretKeys}
          isTransferConfirmed={messageCode}
          onShowWarning={() => setIsOpenWarningSecretPopup(true)}
        />
        <WarningSecretKeysPopup
          isModalOpened={isOpenWarningSecretPopup}
          onClose={handleWarningSecretKeyPopupClose}
          secretKeys={secretKeys}
          onLoading={(loading) => setIsLoadingKeys(loading)}
          onClick={(isClicked) => setIsDownloaded(isClicked)}
          isLoading={isLoadingKeys}
          onError={(isError) => setIsLoadingKeysError(isError)}
        />
        <Popup
          onClose={() => {
            setIsOpenNotExistingPopup(false);
            redirect('/');
          }}
          title="That invitation link either has been deleted or doesn’t exist"
          isOpen={isOpenNotExistingPopup}
          mainContainerStyles={sxStyles.errorPopupContainer}
          titleStyles={{ ...sxStyles.errorTitle, ...sxStyles.noInvitation }}
        />
        <Popup
          onClose={() => {
            setIsOpenExpiredPopup(false);
            redirect('/');
          }}
          title="This invitation link either has expired"
          isOpen={isOpenExpiredPopup}
          mainContainerStyles={sxStyles.errorPopupContainer}
          titleStyles={sxStyles.errorTitle}
        >
          <Stack flexDirection="row" justifyContent="center">
            <Typography variant="pl">Ask your service provider to resend the invitation</Typography>
          </Stack>
        </Popup>
      </Stack>
    </Stack>
  );
};

export default CreateOrganisationFromInvitation;

const sxStyles = {
  root: { minHeight: '100vh' },
  loader: { flexGrow: 1, pb: FOOTER_HEIGHT },
  appBar: {
    boxShadow: 'none',
    backgroundColor: 'transparent',
    minHeight: '79px',
    display: 'flex',
    justifyContent: 'center',
  },
  serviceContainer: {
    backgroundColor: (theme) => theme.customColors.grey1,
    borderRadius: '12px',
    p: '32px 40px',
    mt: '25px',
  },
  agreement: {
    color: (theme) => theme.customColors.grey2,
    textAlign: 'center',
    mt: 5,
    display: 'block',
  },
  errorPopupContainer: {
    px: '50px',
  },
  errorTitle: { textAlign: 'center' },
  noInvitation: { p: 0 },
};
