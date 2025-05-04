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

import { Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import { AutocompleteInput, Form, TextInput, FormDataConsumer, useDataProvider } from 'react-admin';
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import InfoIcon from '@mui/icons-material/Info';

import {
  LINKEDIN_ORGANIZATION_ID,
  WEBSITE_HINT,
  SUPPORT_EMAIL_HINT,
  TECHNICAL_EMAIL_HINT,
} from '../../utils/index.jsx';
import { validateEmail, validateWebsite, validateName } from './CreateOrganization.utils';
import OrganizationSubmitButton from './OrganisationSubmitButton.jsx';
import CustomImageInput from '../common/CustomImageInput/index.jsx';
import OrganizationRegistrationNumbersField from '../../pages/organizations/components/OrganizationRegistrationNumbersField.jsx';
import OrganizationAuthorityRadioGroup, {
  getDefaultAuthority,
} from '../../pages/organizations/components/OrganizationAuthorityRadioGroup.jsx';
import { OrganizationRegistrationNumbers } from '../../pages/organizations/components/OrganizationRegistrationNumbersContainer.jsx';
import { Authorities, authorityOptions } from '../../constants/messageCodes';
import { dataResources } from '../../utils/remoteDataProvider';

const CreateInvitationForOrganization = ({ onSubmit, countryCodes, onCancel, defaultValues }) => {
  const dataProvider = useDataProvider();

  const [authority, setAuthority] = useState(Authorities.DunnAndBradstreet);
  const handleAuthoryChange = (event) => {
    setAuthority(event.target.value);
  };

  const timeout = useRef(null);

  const debouncedValidation = async (value) => {
    clearTimeout(timeout.current);

    if (!value) {
      return undefined;
    }

    return new Promise((resolve) => {
      // eslint-disable-next-line better-mutation/no-mutation
      timeout.current = setTimeout(async () => {
        const inputNormalized = value.replace(/\s\s+/g, ' ').trim().toLowerCase();
        const { data: searchedProfiles } = await dataProvider.getList(
          dataResources.SEARCH_PROFILES,
          {
            search: inputNormalized,
          },
        );
        if (searchedProfiles?.some((org) => org.name.toLowerCase() === inputNormalized)) {
          resolve({ message: 'Organization already exists' });
        } else {
          resolve(undefined);
        }
      }, 500);
    });
  };

  const orgNamevalidation = [...validateName, debouncedValidation];

  useEffect(() => {
    if (defaultValues?.registrationNumbers) {
      setAuthority(getDefaultAuthority(defaultValues.registrationNumbers));
    }
  }, [defaultValues]);

  return (
    <Box>
      <Typography variant="h1" mb={2}>
        Invite Organization
      </Typography>
      <Typography mb={3}>
        To invite an organization to join Velocity Network™, fill in that organization&apos;s
        information below.
      </Typography>

      <Form onSubmit={onSubmit} noValidate mode="onChange" defaultValues={defaultValues}>
        <FormDataConsumer>
          {({ formData }) => (
            <>
              <TextInput
                fullWidth
                label="Legal Name"
                source="name"
                validate={orgNamevalidation}
                pb={1}
              />
              {/* Uncomment when the flow is ready */}
              {/* <AutoCompleteOrganizationName defaultValue={defaultValues?.org} /> */}
              <Stack flexDirection="row" gap={1.75} mb={3.5} mt={1}>
                <CustomImageInput
                  label={false}
                  labelText=""
                  editMode
                  orientation="vertical"
                  style={{ flexDirection: 'row', minHeight: '200px' }}
                  addTo=""
                  isRequired={false}
                />
              </Stack>
              <TextInput fullWidth multiline label="Short Description" source="description" />
              <Stack flexDirection="row" gap={1.75}>
                <TextInput fullWidth label="Website" source="website" validate={validateWebsite} />
                <Box mt={2}>
                  <Tooltip title={WEBSITE_HINT}>
                    <InfoIcon color="info" fontSize="small" cursor="pointer" />
                  </Tooltip>
                </Box>
              </Stack>
              <TextInput fullWidth label="Address" source="physicalAddress.line1" />
              <AutocompleteInput
                label="Country"
                source="location.countryCode"
                choices={countryCodes}
              />
              <TextInput
                fullWidth
                label="LinkedIn Page"
                source="linkedInProfile"
                validate={validateWebsite}
              />
              <Stack flexDirection="row" gap={1.75}>
                <OrganizationRegistrationNumbersField
                  record={formData}
                  fieldType="LinkedIn"
                  label="LinkedIn Company Page ID"
                  tooltip={LINKEDIN_ORGANIZATION_ID}
                  type="number"
                  source="registrationNumbers"
                  isRequired={false}
                />
              </Stack>
              <Typography sx={sxStyles.errorMessage} />
              <Stack flexDirection="row" gap={1.75}>
                <TextInput
                  fullWidth
                  label="Support Email"
                  source="contactEmail"
                  validate={validateEmail}
                />
                <Box mt={2}>
                  <Tooltip title={SUPPORT_EMAIL_HINT}>
                    <InfoIcon color="info" fontSize="small" cursor="pointer" />
                  </Tooltip>
                </Box>
              </Stack>
              <Stack flexDirection="row" gap={1.75}>
                <TextInput
                  fullWidth
                  label="Technical Contact Email"
                  source="technicalEmail"
                  validate={validateEmail}
                />
                <Box mt={2}>
                  <Tooltip title={TECHNICAL_EMAIL_HINT}>
                    <InfoIcon color="info" fontSize="small" cursor="pointer" />
                  </Tooltip>
                </Box>
              </Stack>
              <OrganizationAuthorityRadioGroup
                authority={authority}
                handleAuthoryChange={handleAuthoryChange}
                isHorizontal={false}
              />
              {authorityOptions[authority] === authorityOptions.NationalAuthority && (
                <Stack flexDirection="row" gap={1.75}>
                  <Box sx={sxStyles.fullWidth}>
                    <OrganizationRegistrationNumbers
                      formData={formData}
                      authority={authority}
                      type="uri"
                      label="Local Country Registration Authority Website"
                      isRequired={false}
                      source="registrationNumbers"
                    />
                  </Box>
                </Stack>
              )}
              <Stack flexDirection="row" gap={1.75}>
                <Box sx={sxStyles.fullWidth}>
                  <OrganizationRegistrationNumbers
                    formData={formData}
                    authority={authority}
                    type="number"
                    label={authorityOptions[authority]}
                    isRequired={false}
                    source="registrationNumbers"
                  />
                </Box>
              </Stack>

              <Box display="flex" justifyContent="center" pt={4}>
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={[sxStyles.button, sxStyles.cancelButton]}
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <OrganizationSubmitButton
                  styles={sxStyles.button}
                  title="Next"
                  endIcon={<KeyboardArrowRightIcon />}
                />
              </Box>
            </>
          )}
        </FormDataConsumer>
      </Form>
    </Box>
  );
};

// eslint-disable-next-line better-mutation/no-mutation
CreateInvitationForOrganization.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  countryCodes: PropTypes.array.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  defaultValues: PropTypes.object,
};

export default CreateInvitationForOrganization;

const sxStyles = {
  section: {
    display: 'block',
    pt: 1,
    pb: '12px',
    fontWeight: 500,
  },
  button: { px: 4, py: 1, fontSize: '16px', width: '160px' },
  cancelButton: { marginRight: '20px' },
  fullWidth: { width: '100%' },
  errorMessage: {
    fontSize: '0.75rem',
    color: 'primary.main',
    marginLeft: '1.25em',
    height: '1.75em',
  },
};
