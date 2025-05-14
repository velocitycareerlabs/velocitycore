const { flow, isEmpty, size, gte } = require('lodash/fp');
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

  for await (const signatoryStatusDoc of signatoryStatuses) {
    await sendReminder(
      signatoryStatusDoc,
      sendEmailToSignatoryForOrganizationApproval,
      req
    );
  }
};

const sendReminder = async (
  signatoryStatusDoc,
  sendEmailToSignatoryForOrganizationApproval,
  context
) => {
  const { repos, config, log, sendEmail, view } = context;
  try {
    const filter = { _id: signatoryStatusDoc.organizationId };
    const organization = await repos.organizations.findOne({ filter });

    if (isEmpty(organization)) {
      log.error({ message: 'Organization not found', filter });
      await repos.signatoryStatus.addState(
        signatoryStatusDoc._id,
        SignatoryEventStatus.REMINDER_ERROR,
        {
          error: 'Organization not found',
        }
      );
      return;
    }

    const isMaxReminderCount = flow(size, (n) =>
      gte(n, config.signatoryMaxReminderCount)
    )(signatoryStatusDoc.events);
    if (isMaxReminderCount) {
      await repos.signatoryStatus.addState(
        signatoryStatusDoc._id,
        SignatoryEventStatus.MAX_REACHED
      );
      await sendEmail({
        subject: await view(
          'support-signatory-max-count-reached-email-subject',
          { organization }
        ),
        message: await view('support-signatory-max-count-reached-email-body', {
          organization,
        }),
        sender: config.registrarSupportEmail,
        recipients: [config.registrarSupportEmail],
        replyTo: config.registrarSupportEmail,
        html: true,
      });
      await repos.signatoryStatus.addState(
        signatoryStatusDoc._id,
        SignatoryEventStatus.COMPLETED
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
      signatoryStatusDoc._id,
      SignatoryEventStatus.LINK_SENT,
      authCode
    );
  } catch (error) {
    log.error({ err: error });
    await repos.signatoryStatus.addState(
      signatoryStatusDoc._id,
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
