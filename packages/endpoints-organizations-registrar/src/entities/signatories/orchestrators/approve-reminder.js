const { SignatoryEventStatus } = require('../domain');

const approveReminder = async (organization, req) => {
  const { repos } = req;
  const currentTime = new Date();
  await repos.signatoryStatus.addState(
    organization.didDoc.id,
    SignatoryEventStatus.APPROVED,
    {
      approvedAt: currentTime,
    }
  );
};

module.exports = {
  approveReminder,
};
