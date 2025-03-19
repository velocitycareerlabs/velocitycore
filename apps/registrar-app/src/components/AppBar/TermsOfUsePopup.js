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

import PropTypes from 'prop-types';
import { Button, Typography, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import Popup from '../common/Popup';
import theme from '../../theme/theme';

const TermsOfUsePopup = ({ onClose, isOpen, onProceed, title }) => {
  return (
    <Popup title={title} onClose={onClose} isOpen={isOpen} titleStyles={{ textAlign: 'center' }}>
      <Stack justifyContent="center" pt="8px">
        <Typography alignSelf="center">
          By clicking PROCEED you agree to the{' '}
          <Link
            target="_blank"
            to="/terms-and-conditions"
            role="link"
            style={{ color: theme.palette.primary.main }}
          >
            terms of use
          </Link>
        </Typography>
        <Button
          onClick={onProceed}
          variant="outlined"
          sx={{
            width: 'fit-content',
            alignSelf: 'center',
            px: 4,
            py: 1,
            mt: '40px',
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: 'rgba(203, 25, 35, 0.04)',
            },
          }}
          autoFocus
        >
          Proceed
        </Button>
      </Stack>
    </Popup>
  );
};

// eslint-disable-next-line better-mutation/no-mutation
TermsOfUsePopup.propTypes = {
  onClose: PropTypes.func,
  onProceed: PropTypes.func,
  isOpen: PropTypes.bool,
  title: PropTypes.string,
};

export default TermsOfUsePopup;
