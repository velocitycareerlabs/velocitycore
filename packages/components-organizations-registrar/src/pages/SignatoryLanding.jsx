import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Typography, Box } from '@mui/material';

import { useGetOne } from 'ra-core';
import Loading from '../components/Loading.jsx';
import { dataResources } from '../utils/remoteDataProvider';
import { useConfig } from '../utils/ConfigContext';

const SignatoryLanding = () => {
  const config = useConfig();
  const { response } = useParams();
  const [searchParams] = useSearchParams();
  const did = searchParams.get('did');
  const authCode = searchParams.get('authCode');

  const { data: profile, isLoading } = useGetOne(dataResources.VERIFIED_PROFILE, { id: did });

  useEffect(() => {
    const addResponse = async () => {
      try {
        const resp = await fetch(
          `${config.registrarApi}/organizations/${did}/signatories/response/${response}?authCode=${authCode}`,
        );

        if (!resp.ok) {
          const data = await resp.json();
          throw data;
        }
      } catch (e) {
        console.error('signatory error', e);
      }
    };

    if (did && authCode && response) {
      addResponse();
    }
  }, [did, authCode, response, config.registrarApi, config]);

  if (isLoading) {
    return (
      <Box sx={styles.loading} pt={5} pb={10} pr={8} pl={9}>
        <Loading />
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.content}>
        <img
          src="/assets/images/logo.svg"
          alt="Velocity"
          width={196}
          height={42}
          style={styles.image}
        />
        <Typography variant="h1" textAlign="center" marginBottom={3.5}>
          Thank you!
        </Typography>
        <Typography variant="pL" textAlign="center" marginBottom={11}>
          Your {response === 'approve' ? 'approval' : 'rejection'} regarding the addition of{' '}
          {profile.credentialSubject.name} on the Velocity Network has been acknowledged.
        </Typography>
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100vh',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'translateY(-60px)',
    maxWidth: '670px',
  },
  image: {
    marginBottom: 110,
  },
  loading: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default SignatoryLanding;
