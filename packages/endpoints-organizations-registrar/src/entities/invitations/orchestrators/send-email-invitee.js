const { initInvitationEmails, buildInvitationUrl } = require('../domains');

const initSendEmailInvitee = (fastify) => {
  const { sendEmail, sendError, log, config } = fastify;
  const { emailToInvitee } = initInvitationEmails(fastify.config);

  return async ({ ticket, inviteeEmail, caoOrganization, code }) => {
    try {
      const uri = buildInvitationUrl({ code, ticket }, { config });

      await sendEmail(
        emailToInvitee({
          inviteeEmail,
          caoOrgProfileName: caoOrganization.profile.name,
          uri,
        })
      );
      return 'invitation_sent';
    } catch (error) {
      const message = 'Unable to send invitation email to user';
      const messageContext = { err: error, email: inviteeEmail };
      log.error(messageContext, message);
      sendError(error, { ...messageContext, message });
      return 'invitation_not_sent';
    }
  };
};

module.exports = {
  initSendEmailInvitee,
};
