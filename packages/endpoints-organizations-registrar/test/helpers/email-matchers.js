/*
 * Copyright 2024 Velocity Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const sendServicesActivatedEmailMatcher = () => ({
  Destination: {
    ToAddresses: ['0@localhost.test', '1@localhost.test'],
  },
  ReplyToAddresses: ['testvnfregistrar@gmail.com'],
  Source: 'testvnfregistrar@gmail.com',
  Message: {
    Body: {
      Text: { Data: expect.any(String) },
    },
    Subject: {
      Data: 'Velocity Services Activated on LocalDevNet',
    },
  },
});

const sendServicesActivatedEmailToCAOsMatcher = (organization) => ({
  Destination: {
    ToAddresses: ['0@localhost.test', '1@localhost.test'],
  },
  ReplyToAddresses: ['testvnfregistrar@gmail.com'],
  Source: 'testvnfregistrar@gmail.com',
  Message: {
    Body: {
      Text: { Data: expect.any(String) },
    },
    Subject: {
      Data: `${organization.profile.name} service is now active`,
    },
  },
});

const expectedInvitationSentEmail = (
  signupUrl = '',
  toAddress = 'test@email.com'
) => ({
  Destination: {
    ToAddresses: [toAddress],
  },
  ReplyToAddresses: [undefined],
  Source: 'testvnfregistrar@gmail.com',
  Message: {
    Body: {
      Text: {
        /* eslint-disable */
                Data: `
You've received an invitation from Test Organization to join Velocity Network™.
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
<a href="http://localhost.test/invitations/mocknano${signupUrl}" target="_blank">ACCEPT INVITATION</a>
    `,
                /* eslint-enable */
      },
    },
    Subject: {
      Data: 'Invitation by Test Organization to join Velocity network Invitation by Velocity Career Labs to Join Velocity Network™',
    },
  },
});

const expectedInvitationAcceptanceEmail = {
  /* eslint-disable max-len */
  //   message: `
  // Test Organization has accepted your invitation to join the Velocity Network™. The following  service(s) has been registered:
  //
  // VlcInspector_v1 on the agent #caoid at https://www.cao.com
  // VlcInspector_v1 on the agent #caoid at https://www.cao.com
  //
  // The service is still inactive. The foundation staff are reviewing the application and will activate the services on  in the next 72 hours. Upon successful review you will receive confirmation by email.
  //     `,
  //   /* eslint-enable */
  Destination: {
    ToAddresses: ['0@localhost.test', '1@localhost.test'],
  },
  ReplyToAddresses: ['testvnfregistrar@gmail.com'],
  Source: 'testvnfregistrar@gmail.com',
  Message: {
    Body: {
      Text: { Data: expect.any(String) },
    },
    Subject: {
      Data: 'TEST: Test Organization has accepted your invitation',
    },
  },
};

const expectedSignatoryApprovalEmail = (
  inviterOrg,
  orgForApproval,
  messageMatcher = expect.any(String)
) => {
  const requester = inviterOrg
    ? inviterOrg.profile.name
    : `${orgForApproval.profile.adminGivenName} ${orgForApproval.profile.adminFamilyName}`;
  return {
    Destination: {
      ToAddresses: ['signatory@email.com'],
    },
    ReplyToAddresses: ['testvnfregistrar@gmail.com'],
    Source: 'testvnfregistrar@gmail.com',
    Message: {
      Body: {
        Text: { Data: messageMatcher },
      },
      Subject: {
        Data: `${requester} is requesting your approval to register ${orgForApproval.profile.name} on the Velocity Network`,
      },
    },
  };
};

const expectedSignatoryApprovedEmail = (organization) => ({
  Destination: {
    ToAddresses: ['testvnfregistrar@gmail.com'],
  },
  ReplyToAddresses: [undefined],
  Source: 'no-reply@velocitynetwork.foundation',
  Message: {
    Body: {
      Text: {
        Data: `${organization.profile.signatoryGivenName} ${organization.profile.signatoryFamilyName} approved the approval request of the registration of ${organization.profile.name} to the Velocity Network.`,
      },
    },
    Subject: {
      Data: `Approval of registration by ${organization.profile.name}`,
    },
  },
});

const expectedSignatoryRejectedEmail = (organization) => ({
  Destination: {
    ToAddresses: ['testvnfregistrar@gmail.com'],
  },
  ReplyToAddresses: [undefined],
  Source: 'no-reply@velocitynetwork.foundation',
  Message: {
    Body: {
      Text: {
        Data: `${organization.profile.signatoryGivenName} ${organization.profile.signatoryFamilyName} rejected the approval request of the registration of ${organization.profile.name} to the Velocity Network.`,
      },
    },
    Subject: {
      Data: `Rejection of registration by ${organization.profile.name}`,
    },
  },
});

const expectedSupportEmail = (orgName = 'Test Organization') => ({
  Destination: {
    CcAddresses: ['email1@email.com', 'email2@email.com'],
    ToAddresses: ['testvnfregistrar@gmail.com'],
  },
  Message: {
    Body: {
      Raw: {
        Data: expect.stringContaining(`
Organization ${orgName} was created by Admin Given Name Admin Family Name and an approval request was sent to Signatory Given Name Signatory Family Name. 

The organization was registered by: 
Given name: Admin Given Name
Family name: Admin Family Name
Job title: Admin Title
Email: admin@email.com

Signatory details: 
Given name: Signatory Given Name
Family name: Signatory Family Name
Job title: Signatory Title
Email: signatory@email.com
`),
      },
    },
    Subject: {
      Data: `Organization ${orgName} created`,
    },
  },
  ReplyToAddresses: [undefined],
  Source: 'no-reply@velocitynetwork.foundation',
});

const expectedServiceActivationRequiredEmail = {
  Destination: {
    ToAddresses: ['testvnfregistrar@gmail.com'],
  },
  ReplyToAddresses: [undefined],
  Source: 'no-reply@velocitynetwork.foundation',
  Message: {
    Body: {
      Text: { Data: expect.any(String) },
    },
    Subject: {
      Data: 'TEST: Velocity Services Activation Required',
    },
  },
};

const expectedSignatoryReminderEmail = (
  organization,
  caoOrganization,
  messageMatcher = expect.stringMatching(
    /You are the authorized signatory for your organization\.[^]*<a href="\S+\/signatories\/approve[^]*<a href="\S+\/signatories\/reject/
  )
) => ({
  Destination: {
    ToAddresses: ['signatory@email.com'],
  },
  ReplyToAddresses: ['testvnfregistrar@gmail.com'],
  Source: 'testvnfregistrar@gmail.com',
  Message: {
    Body: {
      Text: { Data: messageMatcher },
    },
    Subject: {
      Data: `Reminder: ${caoOrganization.profile.name} is requesting your approval to register ${organization.profile.name} on the Velocity Network`,
    },
  },
});

module.exports = {
  expectedSupportEmail,
  expectedServiceActivationRequiredEmail,
  sendServicesActivatedEmailMatcher,
  sendServicesActivatedEmailToCAOsMatcher,
  expectedInvitationSentEmail,
  expectedInvitationAcceptanceEmail,
  expectedSignatoryApprovalEmail,
  expectedSignatoryApprovedEmail,
  expectedSignatoryRejectedEmail,
  expectedSignatoryReminderEmail,
};
