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

import { Form, TextInput, SaveButton, required } from 'react-admin';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Stack } from '@mui/material';

import Popup from '../common/Popup.jsx';
import { validateServiceEndpoint } from '../organizations/CreateOrganization.utils';

const ServicesEdit = ({ onClose, onSave, selectedService }) => {
  return (
    <Popup
      title="Edit your service details here:"
      onClose={onClose}
      isOpen={Boolean(selectedService)}
    >
      <Form
        record={{ serviceEndpoint: selectedService?.serviceEndpoint }}
        onSubmit={onSave}
        mode="onChange"
      >
        <FormContent />
      </Form>
    </Popup>
  );
};

const FormContent = () => {
  return (
    <Stack>
      <TextInput
        source="serviceEndpoint"
        label="Service endpoint URL"
        validate={[required('Service endpoint URL field is required'), ...validateServiceEndpoint]}
        parse={(value) => value.trim()}
      />
      <SaveButton variant="outlined" icon={null} label="Modify" sx={sx.saveButton} />
    </Stack>
  );
};

// eslint-disable-next-line better-mutation/no-mutation
ServicesEdit.propTypes = {
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  selectedService: PropTypes.object,
};

const sx = {
  saveButton: { width: 'fit-content', alignSelf: 'center', px: 4, py: 1, mt: 2 },
};

export default ServicesEdit;
