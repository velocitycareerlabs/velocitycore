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

import InfoIcon from '@mui/icons-material/Info';
import {
  AutocompleteInput,
  Button,
  email,
  Form,
  maxLength,
  required,
  TextInput,
  useCreateController,
  useRedirect,
  ArrayInput,
  SimpleFormIterator,
  FormDataConsumer,
  useGetOne,
  useNotify,
} from 'react-admin';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useFormContext } from 'react-hook-form';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useQueryClient } from '@tanstack/react-query';
import { kebabCase } from 'lodash/string';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import mainConfig from '../../utils/mainConfig';
import {
  LINKEDIN_ORGANIZATION_ID,
  formatWebSiteUrl,
  formatRegistrationNumbers,
  SUPPORT_EMAIL_HINT,
  TECHNICAL_EMAIL_HINT,
  ADMINISTRATOR_DETAILS_HINT,
  SIGNATORY_DETAILS_HINT,
  parseJwt,
  ERRORS,
} from '../../utils';
import useCountryCodes from '../../utils/countryCodes';
import useSelectedOrganization from '../../state/selectedOrganizationState';
import Loading from '../../components/Loading';
import ServiceCreateFormContainer from './OrganizationAddService';
import { credentialTypesByServiceTypes } from '../../utils/serviceTypes';
import { dataResources } from '../../utils/remoteDataProvider';
import { authorityOptions, Authorities } from '../../constants/messageCodes';
import CustomImageInput from '../../components/common/CustomImageInput';
import OrganizationRegistrationNumbersField from './components/OrganizationRegistrationNumbersField';
import PlusButtonBlock from '../../components/common/PlusButtonBlock';
import OrganizationAuthorityRadioGroup from './components/OrganizationAuthorityRadioGroup';
import { validateWebsite } from '../../components/organisations/CreateOrganisation.utils';
import { getAccessToken } from '../../utils/auth/tokenService';
import { OrganizationRegistrationNumbers } from './components/OrganizationRegistrationNumbersContainer';
import { OrganizationBrand } from './components/OrganizationBrand';

const validateName = [required(), maxLength(100)];
const validateEmail = [required(), email()];
const initialRecord = { profile: { name: '' } };
export const defaultBrandValue = [
  {
    name: '',
  },
];
const getSellSizeIfLocalAuthority = (authority) => {
  if (authorityOptions[authority] === authorityOptions.NationalAuthority) {
    return 6;
  }
  return 12;
};

const OrganizationSubmitButton = () => {
  const form = useFormContext();

  return (
    <Button
      disabled={!form.formState.isValid}
      variant="outlined"
      color="primary"
      type="submit"
      size="large"
      sx={sx.submit}
    >
      Add Service
    </Button>
  );
};

const requestOptions = {
  retryOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
};

export const allBrandsFilled = (values) => values?.every((brand) => !!brand.name && brand.logo);
export const isAddBrandDisabled = (values) => {
  return values && !allBrandsFilled(values) && (values.length % 2 === 0 || values.length !== 1);
};

const organizationPlaceholder =
  'Add a few words describing your organization (boilerplate text) so that other Network participants can learn about it.';

const OrganizationCreate = () => {
  const queryClient = useQueryClient();
  const redirect = useRedirect();
  const { data: countryCodes, isLoading } = useCountryCodes();
  const [did, setDid] = useSelectedOrganization();
  const [organizationData, setOrganizationData] = useState(null);
  const [isServiceCreated, setServiceCreated] = useState(false);
  const [secretKeys, setSecretKeys] = useState(null);
  const [isCreateRequestLoading, setCreateRequestLoading] = useState(false);
  const [authority, setAuthority] = useState(Authorities.DunnAndBradstreet);
  const [hasOrganisations, setHasOrganisations] = useState(false);
  const notify = useNotify();

  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, getAccessTokenSilently } = useAuth0();
  const { data: userData, isLoading: isUserDataLoading } = useGetOne(
    dataResources.USERS,
    {
      id: user.sub,
    },
    {
      enabled: !!user.sub,
      ...requestOptions,
    },
  );

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
  });

  const handleAuthoryChange = (event) => {
    setAuthority(event.target.value);
  };

  const { save } = useCreateController({
    resource: 'organizations',
    mutationOptions: {
      onSuccess: async (resp) => {
        await queryClient.invalidateQueries(['organizations', 'getList']);
        setDid(resp.id);
        setSecretKeys({ keys: resp.keys, authClients: resp.authClients });
        setServiceCreated(true);
        setCreateRequestLoading(false);
        navigate(-1);
        getAccessTokenSilently({ cacheMode: 'off' });
      },
      onError: ({ body }) => {
        setCreateRequestLoading(false);
        if (body.errorCode === 'website_already_exists') {
          notify(ERRORS.websiteExists, { type: 'error' }, { autoHideDuration: 5000 });
        } else {
          notify(body.message || ERRORS.default, { type: 'error' }, { autoHideDuration: 5000 });
        }
        navigate(-1);
        setServiceCreated(false);
      },
    },
  });

  if (isLoading || isUserDataLoading) {
    return <Loading sx={{ pt: '60px' }} />;
  }

  const goToCreateServiceStep = (data) => {
    setOrganizationData(data);
    navigate('service');
  };

  const onClose = () => {
    if (isServiceCreated === true) {
      redirect('list', 'services');
    } else {
      navigate(-1);
      setOrganizationData(null);
      setServiceCreated(false);
    }
  };

  const onCreate = async (serviceData) => {
    setCreateRequestLoading(true);
    const organization = {
      ...organizationData,
      profile: {
        ...(organizationData?.profile || {}),
        website: formatWebSiteUrl(organizationData?.profile?.website),
        linkedInProfile: formatWebSiteUrl(organizationData?.profile?.linkedInProfile),
        registrationNumbers: formatRegistrationNumbers(
          organizationData?.profile?.registrationNumbers,
        ),
        commercialEntities: organizationData?.profile?.commercialEntities
          ?.filter((brand) => brand.logo)
          ?.map((commercial) => ({
            ...commercial,
            type: 'Brand',
          })),
      },
    };
    await save({
      ...organization,
      serviceEndpoints: serviceData
        ? [
            {
              id: `${did}#${kebabCase(serviceData.type)}-1`,
              serviceEndpoint: serviceData.serviceEndpoint,
              type: serviceData.type,
              credentialTypes: credentialTypesByServiceTypes[serviceData.type],
            },
          ]
        : [],
    });
  };

  // eslint-disable-next-line max-len
  const pageTitle = `Let’s get your organization registered on The Velocity Network™ ${mainConfig.chainName}.`;
  const pageSubtitle =
    'To start, fill in the form below to allow other Network participants to identify your organization.';
  return (
    <Box sx={sx.root}>
      <Stack sx={sx.content}>
        <Typography variant="h1" mb={2} textAlign="center">
          {pageTitle}
        </Typography>
        <Typography variant="pl" mb={6.5} textAlign="center">
          {pageSubtitle}
        </Typography>
        <Form record={initialRecord} onSubmit={goToCreateServiceStep} noValidate mode="onTouched">
          <FormDataConsumer>
            {({ formData }) => (
              <>
                <Grid container spacing={4} rowSpacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Stack container flex={1} flexDirection="column">
                      <Grid size={{ xs: 12 }}>
                        <Stack flexDirection="row" gap={1.75}>
                          <TextInput
                            fullWidth
                            label="Organization’s Legal Name"
                            source="profile.name"
                            validate={validateName}
                          />
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextInput
                          fullWidth
                          label="Organization’s website"
                          source="profile.website"
                          validate={[...validateWebsite, required()]}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextInput
                          fullWidth
                          label="Organization’s address"
                          source="profile.physicalAddress.line1"
                          validate={[required(), maxLength(1024)]}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <AutocompleteInput
                          label="Organization’s country"
                          source="profile.location.countryCode"
                          choices={countryCodes}
                          validate={required()}
                        />
                      </Grid>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }} pb={1}>
                    <CustomImageInput label={false} editMode addTo="profile" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextInput
                      fullWidth
                      label="Organization’s LinkedIn Page"
                      source="profile.linkedInProfile"
                      validate={[...validateWebsite, required()]}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <OrganizationRegistrationNumbersField
                        record={{ ...initialRecord, ...formData }}
                        fieldType="LinkedIn"
                        label="LinkedIn Company Page ID"
                        tooltip={LINKEDIN_ORGANIZATION_ID}
                        isRequired={false}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Support Email"
                        source="profile.contactEmail"
                        validate={validateEmail}
                      />
                      <Box mt={2}>
                        <Tooltip title={SUPPORT_EMAIL_HINT}>
                          <InfoIcon color="info" fontSize="small" cursor="pointer" />
                        </Tooltip>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Technical Contact Email"
                        source="profile.technicalEmail"
                        validate={validateEmail}
                      />
                      <Box mt={2}>
                        <Tooltip title={TECHNICAL_EMAIL_HINT}>
                          <InfoIcon color="info" fontSize="small" cursor="pointer" />
                        </Tooltip>
                      </Box>
                    </Stack>
                  </Grid>
                  <OrganizationAuthorityRadioGroup
                    authority={authority}
                    handleAuthoryChange={handleAuthoryChange}
                  />
                  {authorityOptions[authority] === authorityOptions.NationalAuthority && (
                    <Grid size={{ xs: 6 }}>
                      <Stack flexDirection="row">
                        <Box sx={sx.fullWidth}>
                          <OrganizationRegistrationNumbers
                            formData={formData}
                            authority={authority}
                            type="uri"
                            label="Local Country Registration Authority Website"
                          />
                        </Box>
                      </Stack>
                    </Grid>
                  )}
                  <Grid size={{ xs: getSellSizeIfLocalAuthority(authority) }}>
                    <Stack flexDirection="row">
                      <Box sx={sx.fullWidth}>
                        <OrganizationRegistrationNumbers
                          formData={formData}
                          authority={authority}
                          type="number"
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextInput
                      fullWidth
                      multiline
                      label="Short Description of the Organization"
                      placeholder={organizationPlaceholder}
                      source="profile.description"
                      validate={required()}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h5">Key individuals</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <Typography variant="body1" my={2} sx={sx.sectionTitle}>
                        Administrator’s Details
                      </Typography>
                      <Box mt={2}>
                        <Tooltip title={ADMINISTRATOR_DETAILS_HINT}>
                          <InfoIcon color="info" fontSize="small" cursor="pointer" />
                        </Tooltip>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <Typography variant="body1" my={2} sx={sx.sectionTitle}>
                        Signatory Authority’s Details
                      </Typography>
                      <Box mt={2}>
                        <Tooltip title={SIGNATORY_DETAILS_HINT}>
                          <InfoIcon color="info" fontSize="small" cursor="pointer" />
                        </Tooltip>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="First name"
                        source="profile.adminGivenName"
                        validate={[maxLength(1024), required()]}
                        defaultValue={userData ? userData.givenName : ''}
                      />
                    </Stack>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Last name"
                        source="profile.adminFamilyName"
                        validate={[maxLength(1024), required()]}
                        defaultValue={userData ? userData.familyName : ''}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="First name"
                        source="profile.signatoryGivenName"
                        validate={[maxLength(1024), required()]}
                      />
                    </Stack>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Last name"
                        source="profile.signatoryFamilyName"
                        validate={[maxLength(1024), required()]}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Job Title"
                        source="profile.adminTitle"
                        validate={[maxLength(1024), required()]}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Job Title"
                        source="profile.signatoryTitle"
                        validate={[maxLength(1024), required()]}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Email"
                        source="profile.adminEmail"
                        validate={validateEmail}
                        defaultValue={userData ? userData.email : ''}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Email"
                        source="profile.signatoryEmail"
                        validate={validateEmail}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h4" mb={2} mt={4}>
                      Commercial Names
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <ArrayInput
                      source="profile.commercialEntities"
                      defaultValue={defaultBrandValue}
                      sx={{ '& .RaArrayInput-label': { display: 'none' } }}
                    >
                      <SimpleFormIterator
                        addButton={
                          <PlusButtonBlock
                            style={sx.plusButtonBlock}
                            disabled={!allBrandsFilled(formData.profile.commercialEntities)}
                            position={formData.profile?.commercialEntities?.length}
                          />
                        }
                        disableAdd={isAddBrandDisabled(formData.profile.commercialEntities)}
                        fullWidth
                        sx={sx.brandList}
                      >
                        <FormDataConsumer>
                          {({ scopedFormData }) => {
                            return (
                              <OrganizationBrand
                                formData={formData}
                                scopedFormData={scopedFormData}
                              />
                            );
                          }}
                        </FormDataConsumer>
                      </SimpleFormIterator>
                    </ArrayInput>
                  </Grid>
                </Grid>
                <Box display="flex" justifyContent="center" pt={4}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    sx={sx.cancelButton}
                    onClick={() => (hasOrganisations ? navigate('/') : logout())}
                  >
                    Cancel
                  </Button>
                  <OrganizationSubmitButton />
                </Box>
                <ServiceCreateFormContainer
                  isModalOpened={/create\/service/.test(location.pathname) || isServiceCreated}
                  isSending={isCreateRequestLoading}
                  onClose={onClose}
                  onCreate={onCreate}
                  isCreated={isServiceCreated}
                  secretKeys={secretKeys}
                />
              </>
            )}
          </FormDataConsumer>
        </Form>
      </Stack>
    </Box>
  );
};

export default OrganizationCreate;

const sx = {
  root: {
    pt: 7.5,
    pb: 2,
    pl: 1,
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
  },
  content: {
    maxWidth: 886,
    alignItems: 'center',
  },
  submit: {
    minWidth: 196,
  },
  cancelButton: {
    minWidth: 160,
    mr: 2,
  },
  formValidationCustomMessage: { color: 'primary.main' },
  brandList: {
    display: 'flex',
    flexWrap: 'wrap',
    px: '0.5rem',
    gap: '2rem',
    justifyContent: 'space-between',
    '& .RaSimpleFormIterator-action': { display: 'none' },
    '& .RaSimpleFormIterator-buttons': { width: '48%' },
    '& .RaSimpleFormIterator-add': { width: '100%' },
    '& .RaSimpleFormIterator-clear': { display: 'none' },
    '& .RaSimpleFormIterator-list': {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: '2rem',
      flexGrow: '2',
      width: '100%',
      '&:has(li:only-child)': { width: '48%' },
    },
    '& .RaSimpleFormIterator-line': {
      width: '48%',
      '&:only-child': { width: '100%' },
    },
    '& .RaSimpleFormIterator-form': {
      width: '100%',
    },
  },
  brandLogoContainer: { width: '100%' },
  brandLogo: { minHeight: '272px' },
  plusButtonBlock: { height: '23.9rem' },
  sectionTitle: {
    fontSize: '14px',
    textTransform: 'uppercase',
  },
  errorMessage: {
    fontSize: '0.75rem',
    color: 'primary.main',
    marginLeft: '1.25em',
    height: '1.75em',
  },
  fullWidth: {
    width: '100%',
  },
};
