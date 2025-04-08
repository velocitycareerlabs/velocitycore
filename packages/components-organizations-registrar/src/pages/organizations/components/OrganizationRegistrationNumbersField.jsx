/* eslint-disable max-depth */
/* eslint-disable complexity */
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

import { TextInput } from 'react-admin';
import PropTypes from 'prop-types';
import { Box, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import * as lodash from 'lodash';
import { AuthoritiesList, Authorities } from '../../../constants/messageCodes';
import { webSiteRegexp } from '../../../utils/index.jsx';
import theme from '../../../theme/theme';

export const registrationNumbersValidation = (
  registrationNumbers,
  field,
  type = 'number',
  isRequired = true,
) => {
  const selectedAuthority = registrationNumbers?.find(({ authority }) => authority === field);
  const filledAuthorities = (
    registrationNumbers?.filter(
      (item) => item.authority !== Authorities.LinkedIn && !!item.number,
    ) || []
  ).length;
  switch (field) {
    case Authorities.NationalAuthority:
      if (type === 'uri') {
        if (selectedAuthority?.uri?.length && !webSiteRegexp.test(selectedAuthority.uri)) {
          return 'Must be a valid url';
        }
        if (selectedAuthority?.number?.length && !selectedAuthority?.uri?.length) {
          return 'Required';
        }
        if (isRequired && filledAuthorities === 0 && !selectedAuthority?.uri?.length) {
          return 'Required';
        }
      } else if (selectedAuthority?.uri?.length && !selectedAuthority?.number?.length) {
        return 'Required';
      }
      return '';
    default:
      if (filledAuthorities === 0 && isRequired) {
        return 'Required';
      }
      return '';
  }
};

const errorobj = { message: ' ' };

const validateRegistrationNumber = (value = [], isRequired) => {
  const nationalAuthority = value.find(
    ({ authority }) => authority === Authorities.NationalAuthority,
  );
  if (nationalAuthority?.uri?.length && !webSiteRegexp.test(nationalAuthority?.uri)) {
    return errorobj;
  }
  if (nationalAuthority?.number?.length && !nationalAuthority?.uri?.length) {
    return errorobj;
  }
  if (nationalAuthority?.uri?.length && !nationalAuthority?.number?.length) {
    return errorobj;
  }
  if (
    isRequired &&
    !value.filter((item) => item.authority !== Authorities.LinkedIn && !!item.number).length
  ) {
    return errorobj;
  }
  return undefined;
};

const OrganizationRegistrationNumbersField = ({
  fieldType,
  record,
  label,
  tooltip,
  type = 'number',
  source = 'profile.registrationNumbers',
  hasError = false,
  isRequired = true,
}) => {
  return (
    <>
      <TextInput
        fullWidth
        label={`${label}${isRequired ? '*' : ''}`}
        source={source}
        className="'MuiFormLabel-filled, 'MuiInputLabel-shrink'"
        format={(registrationNumbers) => {
          return (
            (registrationNumbers &&
              registrationNumbers.find(({ authority }) => {
                return authority === fieldType;
              })?.[type]) ||
            ''
          );
        }}
        parse={(newValue) => {
          if (!lodash.isNil(newValue)) {
            return [
              ...(lodash.get(record, source) || []).filter(
                ({ authority }) => authority !== fieldType,
              ),
              {
                ...((lodash.get(record, source) || []).find(({ authority }) => {
                  return authority === fieldType;
                }) || {}),
                authority: fieldType,
                [type]: newValue,
              },
            ];
          }

          return lodash.get(record, source) || null;
        }}
        validate={(value) => validateRegistrationNumber(value, isRequired)}
        sx={[
          !hasError && {
            '& .Mui-error': {
              color: '#989A9F !important',
              '& input': { color: theme.palette.text.primary },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.26)' },
            },
          },
          {
            '.MuiFormHelperText-root': {
              display: 'none',
            },
          },
        ]}
      />

      {tooltip && (
        <Box mt={2}>
          <Tooltip title={tooltip}>
            <InfoIcon color="info" fontSize="small" cursor="pointer" />
          </Tooltip>
        </Box>
      )}
    </>
  );
};

// eslint-disable-next-line better-mutation/no-mutation
OrganizationRegistrationNumbersField.propTypes = {
  fieldType: PropTypes.oneOf(AuthoritiesList).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  record: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  type: PropTypes.string.isRequired,
  source: PropTypes.string,
  hasError: PropTypes.bool,
  isRequired: PropTypes.bool,
};

export default OrganizationRegistrationNumbersField;
