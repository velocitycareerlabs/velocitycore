/**
 * Created by Michael Avoyan on 07/07/2024.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable no-console */

import React from 'react';
import {
  getCountries,
  getCredentialTypeSchemas,
  getCredentialTypes,
  getPresentationRequest,
  submitPresentation,
  getCredentialManifestByDeepLink,
  getCredentialManifestByService,
  generateOffers,
  searchForOrganizations,
  generateDidJwk,
  finalizeOffers,
  checkOffers,
  getCredentialTypesUIFormSchema,
  getCredentialManifestToRefreshCredentials,
  getVerifiedProfile,
  verifyJwt,
  generateSignedJwt,
} from '../repositories';
import { Constants } from '../Constants';
import { Dictionary } from '../Types';
import { getApprovedRejectedOfferIdsMock, verifyToken } from '../utils/Utils';
import Environment from '../Environment';
import { CurrentEnvironment } from '../GlobalConfig';
import { getAuthToken } from '../repositories/AuthTokenRepository';
import { getExchangeProgress } from '../repositories/GetExchangeProgressRepository';

const environment = CurrentEnvironment;

let didJwk: Dictionary<any>;
const initialization = async () => {
  if (!didJwk) {
    // eslint-disable-next-line better-mutation/no-mutation
    didJwk = await generateDidJwk({
      signatureAlgorithm: 'P-256',
      remoteCryptoServicesToken: null,
    });
  }
  console.log('didJwk: ', didJwk); // Should be managed by the consumer
};

initialization()
  .then(() => {
    console.log('Initialized successfully.');
  })
  .catch((error) => {
    console.log('Initialization failed with error: ', JSON.stringify(error));
  });

const onGetCountries = async () => {
  try {
    const countries = await getCountries();
    console.log('countries: ', countries);
  } catch (error) {
    console.log('Error getting countries: ', error);
  }
};

const onGetCredentialTypes = async () => {
  try {
    const credentialTypes = await getCredentialTypes();
    console.log('credential types: ', credentialTypes);
  } catch (error) {
    console.log('Error getting credential types: ', error);
  }
};

const onGetCredentialTypeSchemas = async () => {
  try {
    const credentialTypeSchemas = await getCredentialTypeSchemas();
    console.log('credential typeSchemas: ', credentialTypeSchemas);
  } catch (error) {
    console.log('Error getting credential type schemas: ', error);
  }
};

const onGetPresentationRequest = async () => {
  const deepLinkValue =
    environment === Environment.Dev.valueOf()
      ? Constants.PresentationRequestDeepLinkStrDev
      : Constants.PresentationRequestDeepLinkStrStaging;

  try {
    const presentationRequest = await getPresentationRequest(
      { value: deepLinkValue },
      didJwk
    );
    console.log('presentation request: ', presentationRequest);
    if (presentationRequest.feed) {
      // eslint-disable-next-line max-depth
      try {
        const submissionResult = await onSubmitPresentationUsingAuthToken(
          presentationRequest
        );
        console.log('submission result: ', submissionResult);
        await onGetExchangeProgress(presentationRequest, submissionResult);
      } catch (error) {
        console.log('Error submitting presentation: ', error);
      }
    } else {
      // eslint-disable-next-line max-depth
      try {
        const submissionResult = await onSubmitPresentation(
          presentationRequest
        );
        console.log('submission result: ', submissionResult);
        await onGetExchangeProgress(presentationRequest, submissionResult);
      } catch (error) {
        console.log('Error submitting presentation: ', error);
      }
    }
  } catch (error) {
    console.log('Error getting presentation request: ', error);
  }
};

const onSubmitPresentation = async (
  presentationRequest: Dictionary<any>,
  authToken?: Dictionary<any>
) => {
  let verifiedAuthToken = authToken;
  if (authToken != null && !verifyToken(authToken.accessToken)) {
    console.log('Token is expired');
    const authTokenDescriptor = {
      authTokenUri: authToken?.authTokenUri ?? '',
      refreshToken: authToken?.refreshToken.value,
      walletDid: authToken?.walletDid,
      relyingPartyDid: authToken?.relyingPartyDid,
    };
    try {
      verifiedAuthToken = await getAuthToken(authTokenDescriptor);
      console.log('Refreshed token: ', verifiedAuthToken);
    } catch (error) {
      console.log('Error refreshing token: ', error);
      throw error;
    }
  }
  try {
    return await submitPresentation(
      {
        verifiableCredentials: Constants.getIdentificationList(environment),
        presentationRequest,
      },
      verifiedAuthToken
    );
  } catch (error) {
    console.log('Error submitting presentation: ', error);
    throw error;
  }
};

const onGetExchangeProgress = async (
  presentationRequest: Dictionary<any>,
  submissionResult: Dictionary<any>
) => {
  try {
    const exchangeProgress = await getExchangeProgress(
      {
        verifiableCredentials: Constants.getIdentificationList(environment),
        presentationRequest,
      },
      submissionResult
    );
    console.log('exchange progress: ', exchangeProgress);
  } catch (error) {
    console.log('Error getting exchange progress: ', error);
  }
};

const onGetCredentialManifestByDeepLink = async () => {
  const deepLinkValue =
    environment === Environment.Dev.valueOf()
      ? Constants.CredentialManifestDeepLinkStrDev
      : Constants.CredentialManifestDeepLinkStrStaging;
  try {
    const credentialManifest = await getCredentialManifestByDeepLink(
      { value: deepLinkValue },
      didJwk
    );
    console.log('credential manifest: ', credentialManifest);
    await onGenerateOffers(credentialManifest);
  } catch (error) {
    console.log('Error getting credential manifest by deep link: ', error);
  }
};

const onGetOrganizationsThenCredentialManifestByService = async () => {
  searchForOrganizations(
    environment === Environment.Dev.valueOf()
      ? Constants.OrganizationsSearchDescriptorByDidDev
      : Constants.OrganizationsSearchDescriptorByDidStaging
  )
    .then((organizations) => {
      console.log('organizations: ', organizations);
      const serviceCredentialAgentIssuer =
        organizations.all[0].payload.service[0];
      getCredentialManifestByService({
        service: serviceCredentialAgentIssuer,
        issuingType: 'Career',
        credentialTypes: serviceCredentialAgentIssuer.credentialTypes, // Can come from anywhere
        didJwk,
      })
        .then((credentialManifest) => {
          console.log('credential manifest: ', credentialManifest);
          onGenerateOffers(credentialManifest);
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
};

const onGenerateOffers = async (credentialManifest: Dictionary<any>) => {
  const generateOffersDescriptor = {
    credentialManifest,
    types: Constants.CredentialTypes,
    identificationVerifiableCredentials:
      Constants.getIdentificationList(environment),
  };
  try {
    const offers = await generateOffers(generateOffersDescriptor);
    console.log('generate offers: ', offers);
    onCheckOffers(generateOffersDescriptor, offers.sessionToken);
  } catch (error) {
    console.log('Error generating offers: ', error);
  }
};

const onCheckOffers = async (
  generateOffersDescriptor: Dictionary<any>,
  sessionToken: Dictionary<any>
) => {
  try {
    const offers = await checkOffers(generateOffersDescriptor, sessionToken);
    console.log('check offers: ', offers);
    onFinalizeOffers(generateOffersDescriptor.credentialManifest, offers);
  } catch (error) {
    console.log('Error checking offers: ', error);
  }
};

const onFinalizeOffers = async (
  credentialManifest: Dictionary<any>,
  offers: Dictionary<any>
) => {
  const approvedRejectedOfferIds = getApprovedRejectedOfferIdsMock(offers);
  const finalizeOffersDescriptor = {
    credentialManifest,
    challenge: offers.challenge,
    approvedOfferIds: approvedRejectedOfferIds[0],
    rejectedOfferIds: approvedRejectedOfferIds[1],
  };
  try {
    const credentials = await finalizeOffers(
      finalizeOffersDescriptor,
      offers.sessionToken
    );
    console.log('credentials: ', credentials);
  } catch (error) {
    console.log('Error finalizing offers: ', error);
  }
};

const onSubmitPresentationUsingAuthToken = async (
  presentationRequest: Dictionary<any>
) => {
  const authTokenDescriptor = {
    presentationRequest,
    vendorOriginContext: presentationRequest.vendorOriginContext,
  };
  const authToken = await getAuthToken(authTokenDescriptor);
  return onSubmitPresentation(presentationRequest, authToken);
};

const onGetCredentialTypesUIFormSchema = async () => {
  try {
    const credentialTypesUIFormSchema = await getCredentialTypesUIFormSchema({
      credentialType: 'ResidentPermitV1.0',
      countryCode: 'US',
    });
    console.log(
      'credential types UI form schema: ',
      credentialTypesUIFormSchema
    );
  } catch (error) {
    console.log('Error getting credential types UI form schema: ', error);
  }
};

const onRefreshCredentials = async () => {
  try {
    const credentialManifest = await getCredentialManifestToRefreshCredentials({
      service: JSON.parse(Constants.IssuingServiceJsonStr),
      credentialIds: Constants.getCredentialIdsToRefresh(environment),
      didJwk,
    });
    console.log(
      'credential manifest to refresh credentials: ',
      credentialManifest
    );
  } catch (error) {
    console.log(
      'Error getting credential manifest to refresh credentials: ',
      error
    );
  }
};

const onGetVerifiedProfile = async () => {
  try {
    const verifiedProfile = await getVerifiedProfile(
      Constants.getVerifiedProfileDescriptor(environment)
    );
    console.log('verified profile: ', verifiedProfile);
  } catch (error) {
    console.log('Error getting verified profile: ', error);
  }
};

const onVerifyJwt = async () => {
  try {
    const isVerified = await verifyJwt(
      Constants.SomeJwt,
      Constants.SomePublicJwk
    );
    console.log('is verified: ', isVerified);
  } catch (error) {
    console.log('Error verifying JWT: ', error);
  }
};

const onGenerateSignedJwt = async () => {
  try {
    const signedJwt = await generateSignedJwt(
      {
        payload: Constants.SomePayload,
        iss: 'iss123',
        jti: 'jti123',
      },
      didJwk
    );
  } catch (error) {
    console.log('Error generating signed JWT: ', error);
  }
};

const onGenerateDidJwk = async () => {
  try {
    const newDidJwk = await generateDidJwk({
      signatureAlgorithm: 'P-256',
      remoteCryptoServicesToken: null,
    });
  } catch (error) {
    console.log('Error generating didJwk: ', error);
  }
};

const MainScreen: React.FC = () => {
  const menuItems = {
    'Get Countries': onGetCountries,
    'Get Credential Types': onGetCredentialTypes,
    'Get Credential Type Schemas': onGetCredentialTypeSchemas,
    'Disclosing Credentials (aka Inspection)': onGetPresentationRequest,
    'Receiving Credentials (aka Issuing) By Deeplink':
      onGetCredentialManifestByDeepLink,
    'Receiving Credentials (aka Issuing) By Services':
      onGetOrganizationsThenCredentialManifestByService,
    'Self Reporting Credentials (aka Self Attested)':
      onGetCredentialTypesUIFormSchema,
    'Refresh Credentials': onRefreshCredentials,
    'Get Verified Profile': onGetVerifiedProfile,
    'Verify JWT': onVerifyJwt,
    'Generate Signed JWT': onGenerateSignedJwt,
    'Generate DID:JWK': onGenerateDidJwk,
  };

  const disabledMenuItemStyle = {
    color: 'grey',
    cursor: 'not-allowed',
  };

  const handleClick = (key: string, value: () => void) => {
    if (key !== 'Refresh Credentials') {
      value();
    }
  };

  return (
    <div>
      <h1>Sample App</h1>
      <ul>
        {Object.entries(menuItems).map(([key, value]) => (
          <li
            key={key}
            onClick={() => handleClick(key, value)}
            style={key === 'Refresh Credentials' ? disabledMenuItemStyle : {}}
          >
            {key}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MainScreen;
/* eslint-enable */
