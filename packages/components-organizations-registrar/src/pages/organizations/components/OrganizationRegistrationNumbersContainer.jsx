import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import OrganizationRegistrationNumbersField, {
  registrationNumbersValidation,
} from './OrganizationRegistrationNumbersField.jsx';
import { authorityOptions } from '../../../constants/messageCodes';

export const OrganizationRegistrationNumbers = ({
  formData,
  record = {},
  authority,
  type,
  source = 'profile.registrationNumbers',
  label,
  isRequired = true,
}) => {
  const { getFieldState, resetField } = useFormContext();
  const validationMsg = getFieldState(source).isTouched
    ? registrationNumbersValidation(
        formData?.registrationNumbers || formData?.profile?.registrationNumbers || [],
        authority,
        type,
      )
    : '';

  useEffect(() => {
    resetField(source);
  }, [authority, resetField, source]);

  return (
    <>
      <OrganizationRegistrationNumbersField
        record={{ ...record, ...formData }}
        fieldType={authority}
        label={label || authorityOptions[authority]}
        type={type}
        hasError={!!validationMsg}
        isRequired={isRequired}
        source={source}
      />
      <Typography sx={sx.errorMessage}>{validationMsg}</Typography>
    </>
  );
};

// eslint-disable-next-line better-mutation/no-mutation
OrganizationRegistrationNumbers.propTypes = {
  formData: PropTypes.object.isRequired,
  record: PropTypes.object,
  authority: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  source: PropTypes.string,
  label: PropTypes.string,
  isRequired: PropTypes.bool,
};

const sx = {
  errorMessage: {
    fontSize: '0.75rem',
    color: 'primary.main',
    marginLeft: '1.25em',
    height: '1.75em',
  },
};
