const { isBefore, subMonths } = require('date-fns/fp');
const newError = require('http-errors');
const { isEmpty, flow, sortBy, last } = require('lodash/fp');

const validateAuthCode = async (did, authCode, context) => {
  const { repos } = context;

  const signatoryStatus = await repos.signatoryStatus.findOne({
    filter: {
      organizationDid: did,
      authCodes: {
        $elemMatch: {
          code: authCode,
        },
      },
    },
  });

  if (isEmpty(signatoryStatus)) {
    throw newError(401, 'Unauthorized', {
      errorCode: 'unauthorized',
    });
  }

  const latestAuthCode = flow(
    sortBy(['timestamp']),
    last
  )(signatoryStatus.authCodes);

  const isTimestampExpired = isBefore(
    subMonths(3)(new Date()),
    new Date(latestAuthCode.timestamp)
  );

  if (latestAuthCode.code !== authCode) {
    throw newError(400, 'Please use the latest email sent.', {
      errorCode: 'auth_code_must_be_most_recent',
    });
  }

  if (isTimestampExpired) {
    throw newError(400, 'Auth code has expired.', {
      errorCode: 'auth_code_expired',
    });
  }
};

module.exports = {
  validateAuthCode,
};
