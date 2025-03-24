const { SignatoryEventStatus } = require('../domain');

const rejectReminder = async (organization, req) => {
  const { repos } = req;
  const currentTime = new Date();
  await repos.signatoryStatus.addState(
    organization.didDoc.id,
    SignatoryEventStatus.REJECTED,
    {
      rejectedAt: currentTime,
    }
  );
};

module.exports = {
  rejectReminder,
};
