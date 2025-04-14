import {
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import InfoIcon from '@mui/icons-material/Info';
import PropTypes from 'prop-types';
import { Authorities, authorityOptions } from '../../../constants/messageCodes';
import { DUNS_HINT, LEI_HINT, NATIONAL_AUTHORITY_HINT } from '../../../utils/index.jsx';

export const getDefaultAuthority = (registrationNumbers) => {
  return (
    registrationNumbers?.find(
      (item) => item.authority !== Authorities.LinkedIn && item.number && item.number !== '',
    )?.authority || Authorities.DunnAndBradstreet
  );
};

const OrganizationAuthorityRadioGroup = ({
  authority,
  handleAuthoryChange,
  isHorizontal = true,
}) => {
  return (
    <Grid size={{ xs: 12 }}>
      <Paper elevation={0} sx={sx.paper}>
        <RadioGroup
          aria-label="authority"
          name="authority"
          value={authority}
          defaultValue={Authorities.DunnAndBradstreet}
          onChange={handleAuthoryChange}
          sx={sx.radioGroup}
          row={isHorizontal}
        >
          <Box sx={sx.radioContainer}>
            <FormControlLabel
              value={Authorities.DunnAndBradstreet}
              control={<Radio />}
              label={authorityOptions.DunnAndBradstreet}
            />
            <Tooltip title={DUNS_HINT}>
              <InfoIcon color="info" fontSize="small" cursor="pointer" />
            </Tooltip>
          </Box>
          <Box sx={sx.radioContainer}>
            <FormControlLabel
              value={Authorities.GLEIF}
              control={<Radio />}
              label={authorityOptions.GLEIF}
            />
            <Tooltip title={LEI_HINT}>
              <InfoIcon color="info" fontSize="small" cursor="pointer" />
            </Tooltip>
          </Box>
          <Box sx={sx.radioContainer}>
            <FormControlLabel
              value={Authorities.NationalAuthority}
              control={<Radio />}
              label={
                <>
                  {authorityOptions.NationalAuthority}
                  <Typography variant="subtitle2" sx={sx.localRegistrationDescription}>
                    For example, your EIN in the United States
                  </Typography>
                </>
              }
            />
            <Tooltip title={NATIONAL_AUTHORITY_HINT}>
              <InfoIcon color="info" fontSize="small" cursor="pointer" />
            </Tooltip>
          </Box>
        </RadioGroup>
      </Paper>
    </Grid>
  );
};

export default OrganizationAuthorityRadioGroup;

const sx = {
  paper: {
    backgroundColor: 'background.light',
    borderRadius: 1,
    display: 'flex',
    alignItems: 'center',
    mb: 4,
    p: 2,
    flexBasis: '100%',
    px: '2em',
  },
  radioContainer: {
    display: 'flex',
    alignItems: 'center',
    '& .MuiButtonBase-root': { mr: '1em' },
  },
  radioGroup: { flexBasis: '100%', justifyContent: 'space-between' },
  localRegistrationDescription: {
    fontSize: '10px',
    fontWeight: 400,
  },
};

// eslint-disable-next-line better-mutation/no-mutation
OrganizationAuthorityRadioGroup.propTypes = {
  authority: PropTypes.string.isRequired,
  handleAuthoryChange: PropTypes.func.isRequired,
  isHorizontal: PropTypes.bool,
};
