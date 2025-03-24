const initInvitationEmails = (config) => ({
  emailToInvitee: ({ caoOrgProfileName, inviteeEmail, uri }) => ({
    subject: `Invitation by ${caoOrgProfileName} to join Velocity network Invitation by Velocity Career Labs to Join Velocity Network™`,
    /* eslint-disable max-len */
    message: `
You've received an invitation from ${caoOrgProfileName} to join Velocity Network™.
<br>
<br>
For more information about Velocity Network™ and self-sovereign credentials, <a href="https://www.velocitynetwork.foundation/">visit the Velocity Network Foundation® website.</a>.
<br>
<br>
Click the button below to accept the invitation and finish registering your organization.
<br>
<br>
Click the button below to accept the invitation and complete your organization’s registration. This will include setting up your account and creating your organization's profile with a logo, website, company description, LinkedIn company page ID, and more.
<br>
<br>
<a href="${uri}" target="_blank">ACCEPT INVITATION</a>
    `,
    /* eslint-enable */
    sender: config.registrarSupportEmail,
    recipients: [inviteeEmail],
    html: true,
  }),
});

module.exports = { initInvitationEmails };
