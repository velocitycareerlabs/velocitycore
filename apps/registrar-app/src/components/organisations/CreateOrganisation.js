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

import { Box, Stack, Tooltip, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  AutocompleteInput,
  Form,
  maxLength,
  required,
  TextInput,
  FormDataConsumer,
} from 'react-admin';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import InfoIcon from '@mui/icons-material/Info';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FOOTER_HEIGHT } from '../../theme/theme';
import { validateEmail, validateName, validateWebsite } from './CreateOrganisation.utils';
import OrganizationSubmitButton from './OrganisationSubmitButton';
import CustomImageInput from '../common/CustomImageInput';
import OrganizationRegistrationNumbersField from '../../pages/organizations/components/OrganizationRegistrationNumbersField';
import {
  ADMINISTRATOR_DETAILS_HINT,
  LINKEDIN_ORGANIZATION_ID,
  SIGNATORY_DETAILS_HINT,
  SUPPORT_EMAIL_HINT,
  TECHNICAL_EMAIL_HINT,
} from '../../utils';
import OrganizationAuthorityRadioGroup from '../../pages/organizations/components/OrganizationAuthorityRadioGroup';
import { OrganizationRegistrationNumbers } from '../../pages/organizations/components/OrganizationRegistrationNumbersContainer';
import { Authorities, authorityOptions } from '../../constants/messageCodes';

const getSellSizeIfLocalAuthority = (authority) => {
  if (authorityOptions[authority] === authorityOptions.NationalAuthority) {
    return 6;
  }
  return 12;
};

const getDefaultAuthority = (registrationNumbers) => {
  return (
    registrationNumbers?.find(
      (item) => item.authority !== Authorities.LinkedIn && item.number && item.number !== '',
    )?.authority || Authorities.DunnAndBradstreet
  );
};

const CreateOrganisation = ({
  children,
  title,
  subTitle,
  buttonTitle,
  onSubmit,
  defaultValues,
  countryCodes,
  isLoading,
  hasOrganisations,
  userData,
}) => {
  const { logout } = useAuth0();
  const navigate = useNavigate();
  const [authority, setAuthority] = useState(
    getDefaultAuthority(defaultValues?.registrationNumbers),
  );
  const handleAuthoryChange = (event) => {
    setAuthority(event.target.value);
  };

  return (
    <Box sx={sxStyles.root}>
      <Stack sx={sxStyles.content}>
        <Typography variant="h1" mb={2}>
          {title}
        </Typography>
        <Typography variant="pl" mb={6.5} textAlign="center">
          {subTitle}
        </Typography>
        <Form defaultValues={defaultValues} onSubmit={onSubmit} noValidate mode="onTouched">
          <FormDataConsumer>
            {({ formData }) => (
              <>
                <Grid container spacing={4} rowSpacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Stack container flex={1} flexDirection="column">
                      <Grid size={{ xs: 12 }}>
                        <TextInput
                          fullWidth
                          label="Organization’s Legal Name"
                          source="name"
                          validate={validateName}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextInput
                          fullWidth
                          label="Organization’s website"
                          source="website"
                          validate={[required(), ...validateWebsite]}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextInput
                          fullWidth
                          label="Organization’s address"
                          source="physicalAddress.line1"
                          validate={[required(), maxLength(1024)]}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <AutocompleteInput
                          label="Organization’s Country"
                          source="location.countryCode"
                          choices={countryCodes}
                          validate={required()}
                        />
                      </Grid>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 6 }} pb={1}>
                    <CustomImageInput
                      label={false}
                      editMode={!defaultValues.logo}
                      source="logo"
                      imgSrc={defaultValues?.logo}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Organization’s LinkedIn Page"
                        source="linkedInProfile"
                        validate={[...validateWebsite, required()]}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <OrganizationRegistrationNumbersField
                        record={{ ...formData, ...defaultValues }}
                        fieldType="LinkedIn"
                        label="LinkedIn Company Page ID"
                        tooltip={LINKEDIN_ORGANIZATION_ID}
                        source="registrationNumbers"
                        type="number"
                        isRequired={false}
                      />
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Support Email"
                        source="contactEmail"
                        validate={[required(), ...validateEmail]}
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
                        source="technicalEmail"
                        validate={[required(), ...validateEmail]}
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
                        <Box sx={sxStyles.fullWidth}>
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
                      <Box sx={sxStyles.fullWidth}>
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
                      placeholder="Description (a boilerplate for other Network participants to read about the organization)"
                      source="description"
                      validate={required()}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <Typography variant="h4" my={2}>
                        Administrator’s Details
                      </Typography>
                      <Box mt={2.25}>
                        <Tooltip title={ADMINISTRATOR_DETAILS_HINT}>
                          <InfoIcon color="info" fontSize="small" cursor="pointer" />
                        </Tooltip>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <Typography variant="h4" my={2}>
                        Signatory Authority’s Details
                      </Typography>
                      <Box mt={2.25}>
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
                        source="adminGivenName"
                        validate={[maxLength(1024), required()]}
                        defaultValue={userData ? userData.givenName : ''}
                      />
                    </Stack>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Last name"
                        source="adminFamilyName"
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
                        source="signatoryGivenName"
                        validate={[maxLength(1024), required()]}
                      />
                    </Stack>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Last name"
                        source="signatoryFamilyName"
                        validate={[maxLength(1024), required()]}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Job Title"
                        source="adminTitle"
                        validate={[maxLength(1024), required()]}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Job Title"
                        source="signatoryTitle"
                        validate={[maxLength(1024), required()]}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Email"
                        source="adminEmail"
                        validate={[...validateEmail, required()]}
                        defaultValue={userData ? userData.email : ''}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack flexDirection="row" gap={1.75}>
                      <TextInput
                        fullWidth
                        label="Email"
                        source="signatoryEmail"
                        validate={[...validateEmail, required()]}
                      />
                    </Stack>
                  </Grid>
                </Grid>
                {children}
                <Box display="flex" justifyContent="center" pt={4}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    sx={sxStyles.cancelButton}
                    onClick={() => (hasOrganisations ? navigate('/') : logout())}
                  >
                    Cancel
                  </Button>
                  <OrganizationSubmitButton
                    title={buttonTitle}
                    isLoading={isLoading}
                    styles={sxStyles.saveButton}
                  />
                </Box>
              </>
            )}
          </FormDataConsumer>
        </Form>
      </Stack>
    </Box>
  );
};

// eslint-disable-next-line better-mutation/no-mutation
CreateOrganisation.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  buttonTitle: PropTypes.string.isRequired,
  children: PropTypes.node,
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  defaultValues: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  countryCodes: PropTypes.array,
  isLoading: PropTypes.bool.isRequired,
  hasOrganisations: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  userData: PropTypes.object,
};

export default CreateOrganisation;

const sxStyles = {
  root: {
    pt: 7.5,
    pl: 1,
    pb: `calc(35px + ${FOOTER_HEIGHT})`,
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
  },
  content: {
    maxWidth: 886,
    alignItems: 'center',
  },
  saveButton: {
    minWidth: 160,
  },
  cancelButton: {
    minWidth: 160,
    mr: 2,
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
