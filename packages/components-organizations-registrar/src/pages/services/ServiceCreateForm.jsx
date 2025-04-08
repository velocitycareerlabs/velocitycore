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

import { useEffect, useRef, useState } from 'react';
import { kebabCase } from 'lodash/string';
import { Box, Link, Stack, Typography, Button, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Form,
  FormDataConsumer,
  TextInput,
  SaveButton,
  useRedirect,
  required,
  useCreate,
  useGetList,
} from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';
import PropTypes from 'prop-types';
import OrganizationAvatar from '../../components/common/OrganizationAvatar.jsx';
import CustomDropDown from '../../components/common/CustomDropDown.jsx';
import Popup from '../../components/common/Popup.jsx';
import Loading from '../../components/Loading.jsx';
import serviceTypes, {
  credentialTypesByServiceTypes,
  serviceTypesForInvitation,
} from '../../utils/serviceTypes';
import { dataResources } from '../../utils/remoteDataProvider';
import { getNewServiceIndex } from '../../utils/invitations';
import useSelectedOrganization from '../../state/selectedOrganizationState';
import { copyTextToClipboard, objectToString } from '../../utils/index.jsx';
import downloadTxtAsFile from '../../utils/downloadTxtAsFile';
import { validateServiceEndpoint } from '../../components/organizations/CreateOrganization.utils';
import chainNames from '../../utils/chainNames';
import { useConfig } from '../../utils/ConfigContext';

const getTitle = (step) => {
  switch (step) {
    case 2:
      return "You're one step away from setting up your new service on Velocity Network™";
    case 3:
      return 'Congratulations!';
    default:
      return 'Select type of service to add';
  }
};

const isAddButtonDisabled = (inProgress, isIssueOrInspection, selectedCAO, serviceEndpoint) => {
  return (
    !(
      (isIssueOrInspection && serviceEndpoint && selectedCAO) ||
      (!isIssueOrInspection && serviceEndpoint)
    ) || inProgress
  );
};

const defaultAuthClient = { clientSecret: '', clientId: '' };

// eslint-disable-next-line complexity
const ServiceCreateForm = ({ onServiceCreated, services }) => {
  const config = useConfig();
  const { pathname } = useLocation();
  const redirect = useRedirect();

  const [did] = useSelectedOrganization();
  const [createService] = useCreate();

  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedCAO, setSelectedCAO] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedStep, setSelectedStep] = useState(1);
  const [authClient, setAuthClient] = useState(defaultAuthClient);
  const [isCopied, setIsCopied] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [, setIsDownloaded] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [isLoadingKeysError, setIsLoadingKeysError] = useState(false);

  const isModalOpened = /\/services\/create/.test(pathname);
  const openedStateRef = useRef(true);

  const [isIssueOrInspection, setIsIssueOrInspection] = useState(false);
  const navigate = useNavigate();

  const { data: credentialAgentOperators, isLoading: isLoadingCAO } = useGetList(
    dataResources.SEARCH_PROFILES,
    {
      filter: { serviceTypes: 'CredentialAgentOperator' },
    },
  );

  // clear previous state after close
  useEffect(() => {
    const reset = () => {
      setSelectedStep(1);
      setSelectedServiceType('');
      setSelectedServiceId('');
      setSelectedCAO('');
      setAuthClient(defaultAuthClient);
      setIsCopied(false);
      setIsIssueOrInspection(false);
      setIsDownloaded(false);
      setIsLoadingKeys(false);
      setIsLoadingKeysError(false);
    };
    if (openedStateRef.current === false && isModalOpened) {
      reset();
    }
    // eslint-disable-next-line better-mutation/no-mutation
    openedStateRef.current = isModalOpened;

    return reset;
  }, [isModalOpened, setIsIssueOrInspection]);

  useEffect(() => {
    setIsIssueOrInspection(
      selectedServiceType &&
        serviceTypesForInvitation.some((service) => service.id === selectedServiceType.id),
    );
  }, [selectedServiceType, serviceTypesForInvitation, setIsIssueOrInspection]);

  const onCreate = async ({ serviceEndpoint }) => {
    const type = selectedServiceType.id.match(/.+v1/);
    const kebabType = kebabCase(type[0]);
    try {
      setInProgress(true);
      const result = await createService(
        dataResources.SERVICES,
        {
          data: {
            organizationId: did,
            payload: {
              id: `${did}#${kebabType}-${getNewServiceIndex(services, kebabType)}`,
              serviceEndpoint,
              type: type[0],
              credentialTypes: credentialTypesByServiceTypes[selectedServiceType.id],
            },
          },
        },
        { returnPromise: true },
      );
      setInProgress(false);
      if (result.authClient) {
        setSelectedStep(3);
        setAuthClient(result.authClient);
      } else {
        redirect('list', 'services');
      }
      onServiceCreated();
    } catch (e) {
      setInProgress(false);
    }
  };

  const onCopy = () => {
    copyTextToClipboard(objectToString({ authClient }), (err) => {
      setIsCopied(!err);
    });
  };

  const onClose = () => {
    if (!isLoadingKeysError) {
      navigate(-1);
    }
  };

  return (
    <Popup
      onClose={onClose}
      title=""
      isOpen={isModalOpened}
      mainContainerStyles={styles.mainContainer}
      disableCloseButton={inProgress || isLoadingKeys}
    >
      {selectedStep === 1 && (
        <>
          <Typography variant="pm" sx={styles.step}>
            Step 1/2
          </Typography>
          <Typography variant="h1" mb={2}>
            {getTitle(selectedStep)}
          </Typography>
          <Typography mb={4}>Select the type of service you wish to add.</Typography>
          <Form record={{}}>
            <CustomDropDown
              source="selectedServiceType"
              label="Select type of service"
              value={selectedServiceType}
              onChange={setSelectedServiceType}
              items={serviceTypes}
              stringValue={(item) => item.title}
              parse={(value) => value.id}
              disabled={false}
            />
            <Box sx={styles.firstStepButtonBlock}>
              <Button
                disabled={!selectedServiceType || isLoadingCAO}
                variant="outlined"
                sx={styles.button}
                endIcon={
                  selectedServiceType && isLoadingCAO ? (
                    <Loading color="error" sx={styles.loader} size={26} />
                  ) : (
                    <KeyboardArrowRightIcon />
                  )
                }
                onClick={() => setSelectedStep(2)}
              >
                Next
              </Button>
            </Box>
          </Form>
        </>
      )}
      {selectedStep === 2 && (
        <>
          <Typography variant="pm" sx={styles.step}>
            Step 2/2
          </Typography>
          <Typography sx={styles.title} mb={2}>
            {getTitle(selectedStep)}
          </Typography>
          <Typography>Please complete the details below to continue</Typography>
          <Form record={{}} onSubmit={onCreate} mode="onChange">
            <Stack sx={styles.endpointForm}>
              {isIssueOrInspection ? (
                <Stack sx={{ mt: 2 }}>
                  <Stack flexDirection="row" alignItems="center">
                    <CustomDropDown
                      source="serviceCAO"
                      label="Select Credential Agent Operator"
                      value={selectedCAO}
                      onChange={setSelectedCAO}
                      items={credentialAgentOperators}
                      /* eslint-disable-next-line react/no-unstable-nested-components */
                      stringValue={(item) => (
                        <Box sx={styles.menuItemLogo} component="div">
                          <span>{item.name}</span>
                          <OrganizationAvatar size={32} name={item.name} logo={item.logo} />
                        </Box>
                      )}
                      disabled={false}
                      style={{
                        '& .MuiSelect-select': {
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 0,
                        },
                      }}
                    />
                    <Box sx={{ ml: 2 }}>
                      <Tooltip title="The Credential Agent Operator your organization will use to integrate with Velocity Network™">
                        <InfoIcon color="info" fontSize="small" cursor="pointer" />
                      </Tooltip>
                    </Box>
                  </Stack>
                  <Stack flexDirection="row" alignItems="center" my={4}>
                    <CustomDropDown
                      label='Select "Service ID"'
                      value={selectedServiceId}
                      onChange={setSelectedServiceId}
                      items={selectedCAO.service || []}
                      stringValue={(item) => `${item.id} (${item.serviceEndpoint})`}
                      disabled={!selectedCAO}
                      source="serviceEndpoint"
                      parse={(value) => `${selectedCAO.id}${value.id}`}
                    />
                    <Box sx={{ ml: 2 }}>
                      <Tooltip
                        title="The agent's service ID your organization needs to use. 
                        If there are multiple service IDs available, please contact your Credential Agent Operator to know which one to select."
                      >
                        <InfoIcon color="info" fontSize="small" cursor="pointer" />
                      </Tooltip>
                    </Box>
                  </Stack>
                </Stack>
              ) : (
                <TextInput
                  source="serviceEndpoint"
                  label="Service endpoint URL"
                  validate={[
                    required('Service endpoint URL field is required'),
                    ...validateServiceEndpoint,
                  ]}
                  parse={(value) => value.trim()}
                  disabled={inProgress}
                />
              )}
              {config.chainName !== chainNames.testnet && (
                <Typography variant="subtitle1" sx={{ marginTop: '10px' }}>
                  <span>By clicking Add, you agree to our </span>
                  <Link
                    target="_blank"
                    href="https://www.velocitynetwork.foundation/main2/participation-agreements"
                  >
                    Participant Agreement
                  </Link>
                </Typography>
              )}
              <Box sx={styles.secondStepButtonBlock}>
                <Button
                  variant="outlined"
                  sx={styles.backButton}
                  onClick={() => setSelectedStep(1)}
                  startIcon={<KeyboardArrowLeftIcon />}
                  disabled={inProgress}
                >
                  Back
                </Button>
                <FormDataConsumer>
                  {({ formData }) => (
                    <SaveButton
                      variant="outlined"
                      disabled={isAddButtonDisabled(
                        inProgress,
                        isIssueOrInspection,
                        formData.serviceCAO,
                        formData.serviceEndpoint,
                      )}
                      icon={null}
                      label="Add"
                      sx={[
                        styles.button,
                        styles.saveButton,
                        !inProgress && styles.saveButtonDisabled,
                      ]}
                    />
                  )}
                </FormDataConsumer>
              </Box>
            </Stack>
          </Form>
        </>
      )}
      {selectedStep === 3 && (
        <>
          <Typography sx={styles.title} mb={2}>
            {getTitle(selectedStep)}
          </Typography>
          <Typography sx={styles.congratulationsText}>
            Here are your secret identifiers. Please keep a copy of these as they will not be
            available once you close this dialog. You may need to pass this to the admin of your
            Credential Agent.
          </Typography>
          <Typography>
            Download or copy your secret encryption keys and keep them somewhere safe.
          </Typography>
          <Form>
            <Grid container spacing={2} columns={8} sx={styles.keysBlock}>
              <Grid size={{ xs: 1 }} sx={styles.keyLabel}>
                <Typography>Client Id</Typography>
              </Grid>
              <Grid size={{ xs: 7 }}>
                <Typography sx={styles.keyValue}>{authClient.clientId}</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} columns={8} marginTop="10px">
              <Grid size={{ xs: 1 }} sx={styles.keyLabel}>
                <Typography>Client Secret</Typography>
              </Grid>
              <Grid size={{ xs: 7 }}>
                <Typography sx={styles.keyValue}>{authClient.clientSecret}</Typography>
              </Grid>
            </Grid>
            <Box marginTop="30px" sx={styles.doNotDisclosureBlock}>
              <InfoIcon />
              <Typography marginLeft="20px">
                Do not disclose these keys to unauthorized persons or transmit via unsecured
                channels.
              </Typography>
            </Box>

            <Box sx={styles.secondStepButtonBlock}>
              <Button
                variant="outlined"
                color="secondary"
                sx={[styles.button, { marginRight: '30px' }]}
                onClick={onCopy}
              >
                {isCopied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                variant="outlined"
                endIcon={<DownloadIcon />}
                sx={styles.button}
                onClick={() => {
                  downloadTxtAsFile(
                    'keys.json',
                    objectToString(authClient),
                    (isLoading) => setIsLoadingKeys(isLoading),
                    (isError) => setIsLoadingKeysError(isError),
                    (isClicked) => setIsDownloaded(isClicked),
                  );
                }}
              >
                Download
              </Button>
            </Box>
          </Form>
        </>
      )}
    </Popup>
  );
};

const button = { px: 4, py: 1, fontSize: '16px', width: '160px' };

const styles = {
  topComponents: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'primary.main',
    marginBottom: '25px',
  },
  button,
  firstStepButtonBlock: {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginTop: '40px',
  },
  secondStepButtonBlock: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '40px',
  },
  nextButton: {
    ...button,
  },
  backButton: {
    ...button,
    marginRight: '20px',
    borderColor: 'secondary.light',
    color: 'text.primary',
  },
  endpointForm: {
    marginTop: '20px',
  },
  congratulationsText: {
    fontWeight: '600',
    marginBottom: '8px',
  },
  keysBlock: {
    marginTop: '30px',
  },
  keyLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  keyValue: {
    width: '100%',
    borderColor: 'divider.main',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '6px',
    padding: '16px',
    boxSizing: 'border-box',
    wordBreak: 'break-word',
  },
  doNotDisclosureBlock: {
    color: 'secondary.light',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'row',
  },
  secureTransfareIcon: { color: 'primary.main', mr: '1.25rem', fontSize: '1.5rem' },
  secureTransfareText: { fontWeight: 600 },
  menuItemLogo: {
    display: 'flex',
    flex: '1',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  step: { color: (theme) => theme.palette.primary.main, pb: '20px', display: 'block' },
  mainContainer: { pt: 2 },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    lineHeight: '38px',
  },
  saveButton: {
    display: 'flex',
    flexDirection: 'row-reverse',
    gap: '10px',
    '&:disabled': {
      color: 'primary.main',
      borderColor: 'primary.main',
    },
  },
  saveButtonDisabled: {
    '&:disabled': {
      color: 'text.disabled',
      borderColor: 'secondary.light',
    },
  },
};

// eslint-disable-next-line better-mutation/no-mutation
ServiceCreateForm.propTypes = {
  onServiceCreated: PropTypes.func,
  services: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default ServiceCreateForm;
