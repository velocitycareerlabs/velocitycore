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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Link, Stack, Typography, Button, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Form, TextInput, required, useGetList, FormDataConsumer } from 'react-admin';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';
import PropTypes from 'prop-types';
import { validateServiceEndpoint } from '../../components/organizations/CreateOrganization.utils';
import Popup from '../../components/common/Popup.jsx';
import serviceTypes, {
  serviceTypesForInvitation,
  credentialTypesByServiceTypes,
} from '../../utils/serviceTypes';
import { copyTextToClipboard, objectToString } from '../../utils/index.jsx';
import downloadTxtAsFile from '../../utils/downloadTxtAsFile';
import { dataResources } from '../../utils/remoteDataProvider';
import OrganizationAvatar from '../../components/common/OrganizationAvatar.jsx';
import CustomDropDown from '../../components/common/CustomDropDown.jsx';
import Loading from '../../components/Loading.jsx';
import WarningSecretKeysPopup from '../../components/common/WarningSecretKeysPopup.jsx';
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

// eslint-disable-next-line complexity
const OrganizationAddService = ({
  isModalOpened,
  isSending,
  onCreate,
  isCreated,
  secretKeys,
  onClose,
}) => {
  const config = useConfig();

  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedCAO, setSelectedCAO] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedStep, setSelectedStep] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [isLoadingKeysError, setIsLoadingKeysError] = useState(false);

  const openedStateRef = useRef(isModalOpened);
  const visibleState = isCreated ? 3 : selectedStep;

  const [isIssueOrInspection, setIsIssueOrInspection] = useState(false);

  const { data: credentialAgentOperators, isLoading: isLoadingCAO } = useGetList(
    dataResources.SEARCH_PROFILES,
    {
      filter: { serviceTypes: 'CredentialAgentOperator' },
    },
  );
  const [isOpenWarningSecretPopup, setIsOpenWarningSecretPopup] = useState(false);
  const onAddServiceClose = () => {
    if ((secretKeys && !isCopied && !isDownloaded) || isLoadingKeysError) {
      setIsLoadingKeysError(false);
      setIsDownloaded(false);
      setIsOpenWarningSecretPopup(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpenWarningSecretPopup && !isLoadingKeys && !isLoadingKeysError && isDownloaded) {
      onClose();
    }
  }, [isOpenWarningSecretPopup, isLoadingKeys, isLoadingKeysError, isDownloaded, onClose]);

  const formattedSecrets = useMemo(() => {
    return secretKeys
      ? [
          ...secretKeys.keys.map((item) => ({
            ...item,
            id: item.didDocumentKey.id.replace('#', ''),
          })),
          ...(secretKeys.authClients
            ? secretKeys.authClients.reduce(
                (acc, { clientId, clientSecret }) => [
                  ...acc,
                  { id: 'Client Id', key: clientId },
                  { id: 'Client Secret', key: clientSecret },
                ],
                [],
              )
            : []),
        ]
      : [];
  }, [secretKeys]);

  useEffect(() => {
    if (
      selectedServiceType &&
      serviceTypesForInvitation.some((service) => service.id === selectedServiceType.id)
    ) {
      setIsIssueOrInspection(true);
    } else {
      setIsIssueOrInspection(false);
    }
  }, [selectedServiceType, setIsIssueOrInspection]);

  useEffect(() => {
    if (selectedCAO && selectedCAO.service.length === 1) {
      setSelectedServiceId(selectedCAO.service[0]);
    } else {
      setSelectedServiceId('');
    }
  }, [selectedCAO.service, selectedCAO, setSelectedServiceId]);

  // clear previous state after close
  useEffect(() => {
    const reset = () => {
      setSelectedStep(1);
      setSelectedServiceType('');
      setIsCopied(false);
      setIsIssueOrInspection(false);
      setSelectedCAO('');
      setSelectedServiceId('');
      setIsDownloaded(false);
      setIsLoadingKeys(false);
      setIsLoadingKeysError(false);
    };
    if (openedStateRef.current === false && isModalOpened && !isCreated) {
      reset();
    }

    // eslint-disable-next-line better-mutation/no-mutation
    openedStateRef.current = isModalOpened;
    return reset;
  }, [isModalOpened, isCreated]);

  const onCopy = () => {
    copyTextToClipboard(objectToString(secretKeys), (err) => {
      setIsCopied(!err);
    });
  };

  const onCreateCallback = useCallback(
    ({ serviceEndpoint }) => {
      const type = selectedServiceType.id.match(/.+v1/);
      onCreate({
        serviceEndpoint,
        type: type[0],
        ...(selectedServiceType.id.includes('Issuing') && {
          credentialTypes: credentialTypesByServiceTypes[selectedServiceType.id],
        }),
      });
    },
    [onCreate, selectedServiceType],
  );

  return (
    <Popup
      onClose={onAddServiceClose}
      title=""
      isOpen={isModalOpened}
      mainContainerStyles={styles.mainContainer}
      disableCloseButton={isSending || isLoadingKeys}
    >
      {isSending && <Loading color="error" sx={{ pl: '10px' }} size={26} />}

      {visibleState === 1 && (
        <>
          <Typography variant="pm" sx={styles.step}>
            Step 1/2
          </Typography>
          <Typography sx={styles.title} mb={2}>
            {getTitle(visibleState)}
          </Typography>
          <Typography mb={4}>Select the type of service you wish to add.</Typography>
          <CustomDropDown
            source="selectedServiceType"
            label="Select type of service"
            value={selectedServiceType}
            onChange={setSelectedServiceType}
            items={serviceTypes}
            stringValue={(item) => item?.title}
            disabled={isSending}
          />
          <Box sx={styles.firstStepButtonBlock}>
            <Button
              disabled={isSending}
              sx={styles.doLaterButton}
              variant="outlined"
              endIcon={<KeyboardArrowRightIcon />}
              type="submit"
              onClick={() => {
                onCreate(null);
              }}
            >
              Do Later
            </Button>

            <Button
              disabled={!selectedServiceType || (selectedServiceType && isLoadingCAO)}
              variant="outlined"
              sx={styles.nextButton}
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
        </>
      )}
      {visibleState === 2 && (
        <>
          <Typography variant="pm" sx={styles.step}>
            Step 2/2
          </Typography>
          <Typography sx={styles.title} mb={2}>
            {getTitle(visibleState)}
          </Typography>
          <Typography>Please complete the details below to continue</Typography>
          <Form record={{}} onSubmit={onCreateCallback} mode="onChange">
            <Stack sx={styles.endpointForm}>
              {isIssueOrInspection ? (
                <Stack sx={{ mt: 2 }}>
                  <Stack flexDirection="row" alignItems="center">
                    <CustomDropDown
                      source="serviceCAO"
                      label="Select Credential Agent Operator"
                      value={selectedCAO}
                      onChange={(value) => {
                        setSelectedCAO(value);
                        setSelectedServiceId('');
                      }}
                      items={credentialAgentOperators}
                      /* eslint-disable-next-line react/no-unstable-nested-components */
                      stringValue={(item) => (
                        <Box sx={styles.menuItemLogo} component="div">
                          <span>{item.name}</span>
                          <OrganizationAvatar size={32} name={item.name} logo={item.logo} />
                        </Box>
                      )}
                      disabled={false}
                      style={styles.inputWithLogo}
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
                      items={selectedCAO?.service || []}
                      stringValue={(item) => `${item.id} (${item.serviceEndpoint})`}
                      disabled={!selectedCAO}
                      source="serviceEndpoint"
                      parse={(value) => (value ? `${selectedCAO.id}${value.id}` : '')}
                    />
                    <Box sx={{ ml: 2 }}>
                      <Tooltip
                        title="The agent’s service ID your organization needs to use. 
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
                  disabled={isSending}
                >
                  Back
                </Button>
                <FormDataConsumer>
                  {({ formData }) => (
                    <Button
                      sx={styles.nextButton}
                      variant="outlined"
                      disabled={!formData.serviceEndpoint || isSending}
                      type="submit"
                      icon={null}
                    >
                      Add
                      {isSending && <Loading color="error" sx={{ pl: '10px' }} size={26} />}
                    </Button>
                  )}
                </FormDataConsumer>
              </Box>
            </Stack>
          </Form>
        </>
      )}
      {visibleState === 3 && (
        <>
          <Typography sx={styles.title} mb={2}>
            {getTitle(visibleState)}
          </Typography>
          <Typography sx={styles.congratulationsText}>
            Your organization is now registered on Velocity Network™.
          </Typography>
          <Typography my={3}>
            Please save your organization’s unique keys in a secure location, as they will not be
            available once you close this window.
          </Typography>
          <Form sx={{ backgroundColor: 'background.light', mt: 4 }}>
            {formattedSecrets.map(({ id, key }) => (
              <Grid key={id} container spacing={2} columns={14} sx={styles.keysBlock}>
                <Grid size={{ xs: 5 }} sx={styles.keyLabel}>
                  <Typography>{id}</Typography>
                </Grid>
                <Grid size={{ xs: 9 }}>
                  <Typography sx={styles.keyValue}>{key}</Typography>
                </Grid>
              </Grid>
            ))}
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
                endIcon={
                  isLoadingKeys ? (
                    <Loading color="error" sx={styles.loader} size={26} />
                  ) : (
                    <DownloadIcon />
                  )
                }
                sx={styles.button}
                onClick={() => {
                  downloadTxtAsFile(
                    'keys.json',
                    objectToString(secretKeys),
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
          <WarningSecretKeysPopup
            isModalOpened={isOpenWarningSecretPopup}
            onClose={onClose}
            secretKeys={secretKeys}
            onLoading={(isLoading) => setIsLoadingKeys(isLoading)}
            onClick={(isClicked) => setIsDownloaded(isClicked)}
            isLoading={isLoadingKeys}
            onError={(isError) => setIsLoadingKeysError(isError)}
          />
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
    flexDirection: 'row',
    justifyContent: 'center',
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
  doLaterButton: {
    ...button,
    marginRight: '20px',
    borderColor: 'secondary.light',
    color: 'text.primary',
    width: '170px',
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
    fontSize: '20px',
  },
  keysBlock: {
    marginTop: '7px',
  },
  keyLabel: {
    display: 'flex',
    alignItems: 'center',
    wordBreak: 'break-all',
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
  inputWithLogo: {
    '& .MuiSelect-select': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: 0,
    },
  },
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
  loader: { pl: '10px' },
};

// eslint-disable-next-line better-mutation/no-mutation
OrganizationAddService.propTypes = {
  isModalOpened: PropTypes.bool,
  isSending: PropTypes.bool,
  onCreate: PropTypes.func,
  isCreated: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  secretKeys: PropTypes.object,
  onClose: PropTypes.func,
};

export default OrganizationAddService;
