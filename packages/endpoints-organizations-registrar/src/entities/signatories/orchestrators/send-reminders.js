const { isEmpty } = require('lodash/fp');
const { nanoid } = require('nanoid');
const { subMinutes } = require('date-fns/fp');
const { SignatoryEventStatus } = require('../domain');

const task = 'send-reminders';
const sendReminders = async (
  sendEmailToSignatoryForOrganizationApproval,
  req
) => {
  const currentTime = new Date();
  const { repos, config, log } = req;
  const { signatoryLinkResend } = config;
  const signatoryStatuses = await repos.signatoryStatus.findByEvent(
    SignatoryEventStatus.LINK_SENT,
    subMinutes(signatoryLinkResend, currentTime)
  );
  if (isEmpty(signatoryStatuses)) {
    log.info({ task, message: 'No signatory reminders to send' });
    return;
  }

  for await (const signatoryStatus of signatoryStatuses) {
    await sendReminder(
      signatoryStatus,
      sendEmailToSignatoryForOrganizationApproval,
      req
    );
  }
};

const sendReminder = async (
  signatoryStatus,
  sendEmailToSignatoryForOrganizationApproval,
  context
) => {
  const { repos, log } = context;
  try {
    const filter = { _id: signatoryStatus.organizationId };
    const organization = await repos.organizations.findOne({ filter });

    if (isEmpty(organization)) {
      log.error({ message: 'Organization not found', filter });
      await repos.signatoryStatus.addState(
        signatoryStatus._id,
        SignatoryEventStatus.REMINDER_ERROR,
        {
          error: 'Organization not found',
        }
      );
      return;
    }

    const authCode = nanoid();
    await sendEmailToSignatoryForOrganizationApproval(
      {
        organization,
        authCode,
        isReminder: true,
      },
      context
    );
    await repos.signatoryStatus.addStateAndCode(
      signatoryStatus._id,
      SignatoryEventStatus.LINK_SENT,
      authCode
    );
  } catch (error) {
    log.error({ err: error });
    await repos.signatoryStatus.addState(
      signatoryStatus._id,
      SignatoryEventStatus.REMINDER_ERROR,
      {
        error: error.message,
      }
    );
  }
};

module.exports = {
  sendReminders,
  sendReminder,
};
