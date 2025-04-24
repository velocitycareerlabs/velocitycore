import { required, maxLength, email } from 'react-admin';
import { authorityOptions } from '@/constants/messageCodes';

export const validateName = [required(), maxLength(100)];
export const validateEmail = [required(), email()];

export const getSellSizeIfLocalAuthority = (authority) => {
  if (authorityOptions[authority] === authorityOptions.NationalAuthority) {
    return 6;
  }
  return 12;
};

export const requestOptions = {
  retryOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
};

export const organizationPlaceholder =
  'Add a few words describing your organization (boilerplate text) so that other Network participants can learn about it.';

export const initialRecordMock = {
  profile: {
    name: `Mock Organization, Inc. ${new Date().getTime()}`,
    website: `https://mockcompany${new Date().getTime()}.com`,
    linkedInProfile: 'https://www.linkedin.com/company/mockcompanyid',
    physicalAddress: { line1: '123 Mock Street' },
    location: { countryCode: 'US' },
    contactEmail: 'support@mockcompany.com',
    technicalEmail: 'tech@mockcompany.com',
    description: 'This is a mock description for local development.',
    registrationNumbers: [{ authority: 'DunnAndBradstreet', number: '12345' }],
    adminGivenName: 'AdminFirst',
    adminFamilyName: 'AdminLast',
    adminTitle: 'Administrator',
    adminEmail: 'admin@mockcompany.com',
    signatoryGivenName: 'SignerFirst',
    signatoryFamilyName: 'SignerLast',
    signatoryTitle: 'Signatory Officer',
    signatoryEmail: 'sign@mockcompany.com',
  },
};
