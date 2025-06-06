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

import { Chip } from '@mui/material';
import PropTypes from 'prop-types';

const CustomChip = ({ label, color }) => (
  <Chip
    label={label}
    variant="outlined"
    component="div"
    sx={{
      color,
      borderColor: color,
      width: 'fit-content',
      padding: 1,
    }}
  />
);

export default CustomChip;

// eslint-disable-next-line better-mutation/no-mutation
CustomChip.propTypes = {
  label: PropTypes.string,
  color: PropTypes.string,
};
