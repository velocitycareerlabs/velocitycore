const { isBefore, subMinutes } = require('date-fns/fp');
const newError = require('http-errors');
const { isEmpty, find, flow, sortBy, last } = require('lodash/fp');
const { SignatoryEventStatus } = require('../domain/constants');

const validateAuthCode = async (organization, authCode, context) => {
  const { repos, config } = context;

  const signatoryStatus = await repos.signatoryStatus.findOne({
    filter: {
      organizationId: organization._id,
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

  if (
    find(
      (evt) =>
        evt.state === SignatoryEventStatus.APPROVED ||
        evt.state === SignatoryEventStatus.REJECTED,
      signatoryStatus.events
    )
  ) {
    throw newError(400, 'Already Signed', {
      errorCode: 'already_signed',
    });
  }

  const latestAuthCode = flow(
    sortBy(['timestamp']),
    last
  )(signatoryStatus.authCodes);

  if (latestAuthCode.code !== authCode) {
    throw newError(400, 'Please use the latest email sent.', {
      errorCode: 'auth_code_must_be_most_recent',
    });
  }

  const isTimestampExpired = isBefore(
    subMinutes(config.signatoryLinkExpiration)(new Date())
  );

  if (isTimestampExpired(new Date(latestAuthCode.timestamp))) {
    throw newError(400, 'Auth code has expired.', {
      errorCode: 'auth_code_expired',
    });
  }
};

module.exports = {
  validateAuthCode,
};
