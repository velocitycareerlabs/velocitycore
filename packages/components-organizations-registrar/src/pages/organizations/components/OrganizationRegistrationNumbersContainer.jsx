import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Typography } from '@mui/material';
import OrganizationRegistrationNumbersField, {
  registrationNumbersValidation,
} from './OrganizationRegistrationNumbersField.jsx';
import { authorityOptions } from '../../../constants/messageCodes';

/* eslint-disable react/prop-types */
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
/* eslint-enable */

const sx = {
  errorMessage: {
    fontSize: '0.75rem',
    color: 'primary.main',
    marginLeft: '1.25em',
    height: '1.75em',
  },
};
