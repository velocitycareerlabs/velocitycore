const { parseToCsv } = require('@velocitycareerlabs/csv-parser');
const { join, isNil, omitBy, flow } = require('lodash/fp');

const parseProfileToCsv = async (organizationProfile) => {
  const csvFile = await parseToCsv(
    [
      flow(omitBy(isNil), (profile) => ({
        ...profile,
        ...(profile?.permittedVelocityServiceCategory
          ? {
              permittedVelocityServiceCategory: join(
                ', ',
                profile.permittedVelocityServiceCategory
              ),
            }
          : {}),
      }))(organizationProfile),
    ],
    ['registrationNumbers', 'commercialEntities']
  );
  return csvFile;
};

module.exports = {
  parseProfileToCsv,
};
