import { useCallback } from 'react';
import { Button } from 'react-admin';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

import { useConfig } from '@/utils/ConfigContext';
import chainNames from '@/utils/chainNames';
import { initialRecordMock } from '../utils';

export const MockOrganization = ({ setInitialRecord }) => {
  const config = useConfig();
  const isMockDataAllowed = [chainNames.localnet, chainNames.devnet, chainNames.qanet].includes(
    config.chainName,
  );
  const mockOrganization = useCallback(() => {
    setInitialRecord(initialRecordMock);
  }, [setInitialRecord]);

  return isMockDataAllowed ? (
    <Box display="flex" alignSelf="flex-end">
      <Button
        variant="text"
        color="secondary"
        size="large"
        sx={sx.mockButton}
        onClick={mockOrganization}
      >
        Mock Organization
      </Button>
    </Box>
  ) : null;
};

const sx = {
  mockButton: {
    color: 'primary.main',
  },
};

// eslint-disable-next-line better-mutation/no-mutation
MockOrganization.propTypes = {
  setInitialRecord: PropTypes.func.isRequired,
};

export default MockOrganization;
