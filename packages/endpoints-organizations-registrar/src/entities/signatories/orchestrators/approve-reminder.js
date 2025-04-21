const { SignatoryEventStatus } = require('../domain');
const { ConsentTypes } = require('../../registrar-consents');

const approveReminder = async (organization, req) => {
  const { repos } = req;
  const currentTime = new Date();
  await repos.signatoryStatus.addState(
    { organizationId: organization._id },
    SignatoryEventStatus.APPROVED,
    {
      approvedAt: currentTime,
    }
  );
  await repos.registrarConsents.registerConsent({
    userId: organization.profile.signatoryEmail,
    organization,
    type: ConsentTypes.Signatory,
    version: 1,
  });
};

module.exports = {
  approveReminder,
};
