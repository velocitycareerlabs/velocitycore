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
  const { reminderDelayInMinutes } = config;
  const signatoryStatus = await repos.signatoryStatus.find({
    filter: {
      events: {
        $elemMatch: {
          state: SignatoryEventStatus.EMAIL_SENT,
          timestamp: {
            $lte: subMinutes(reminderDelayInMinutes)(currentTime),
          },
        },
        $size: 1,
      },
    },
  });
  if (isEmpty(signatoryStatus)) {
    log.info({ task, message: 'No signatory reminders to send' });
    return;
  }

  for await (const signatoryReminder of signatoryStatus) {
    await sendReminder(
      signatoryReminder,
      sendEmailToSignatoryForOrganizationApproval,
      req
    );
  }
};

const sendReminder = async (
  signatoryReminderInfo,
  sendEmailToSignatoryForOrganizationApproval,
  context
) => {
  const { repos, log } = context;
  try {
    const filter = { 'didDoc.id': signatoryReminderInfo.organizationDid };
    const organization = await repos.organizations.findOne({ filter });

    if (isEmpty(organization)) {
      log.error({ message: 'Organization not found', filter });
      await repos.signatoryStatus.addState(
        signatoryReminderInfo.organizationDid,
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
      organization.didDoc.id,
      SignatoryEventStatus.REMINDER_SENT,
      authCode
    );
  } catch (error) {
    log.error({ err: error });
    await repos.signatoryStatus.addState(
      signatoryReminderInfo.organizationDid,
      SignatoryEventStatus.REMINDER_ERROR,
      {
        error: error.message,
      }
    );
  }
};

module.exports = {
  sendReminders,
};
