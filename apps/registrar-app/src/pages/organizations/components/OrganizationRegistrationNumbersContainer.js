import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useFormContext } from 'react-hook-form';
import { Typography } from '@mui/material';
import OrganizationRegistrationNumbersField, {
  registrationNumbersValidation,
} from './OrganizationRegistrationNumbersField';
import { authorityOptions } from '../../../constants/messageCodes';

export const OrganizationRegistrationNumbers = ({
  formData,
  record = {},
  authority,
  type,
  label,
  isRequired = true,
}) => {
  const { getFieldState } = useFormContext();
  const validationMsg = getFieldState('profile.registrationNumbers').isTouched
    ? registrationNumbersValidation(formData?.profile?.registrationNumbers || [], authority, type)
    : '';
  return (
    <>
      <OrganizationRegistrationNumbersField
        record={{ ...record, ...formData }}
        fieldType={authority}
        label={label || authorityOptions[authority]}
        type={type}
        hasError={!!validationMsg}
        isRequired={isRequired}
      />
      <Typography sx={sx.errorMessage}>{validationMsg}</Typography>
    </>
  );
};

const sx = {
  errorMessage: {
    fontSize: '0.75rem',
    color: 'primary.main',
    marginLeft: '1.25em',
    height: '1.75em',
  },
};
