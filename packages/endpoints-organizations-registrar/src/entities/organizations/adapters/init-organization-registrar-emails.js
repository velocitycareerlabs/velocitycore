/*
 * Copyright 2025 Velocity Team
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

const { map, flow, join } = require('lodash/fp');
const { buildPublicServices } = require('../../organization-services/domains');
const { ServiceTypeLabels } = require('../domains');

const whichNet = ({ nodeEnv }) => {
  switch (nodeEnv) {
    case 'development':
    case 'test':
      return 'LocalDevNet';
    case 'dev':
      return 'DevNet';
    case 'staging':
      return 'TestNet';
    case 'production':
      return 'MainNet';
    default:
      return '';
  }
};
const initOrganizationRegistrarEmails = (config) => ({
  emailToNewOrgForServicesActivated: ({
    organization,
    activatedServiceIds = [],
    emails,
  }) => {
    return {
      subject: `Velocity Services Activated on ${whichNet(config)}`,
      message: `Congratulations!
<br>
<br>
You are being contacted because you are the admin of ${
        organization.profile.name
      } on Velocity Network ${whichNet(
        config
      )} and your services were just activated!
<br>
<br>
You can now access your organization’s Payments and Rewards Hub account on ${whichNet(
        config
      )}. 
To do so, please go <a href="${config.tokenWalletBaseUrl}/o/${
        organization.didDoc.id
      }">here</a> and log in with your Velocity Network Registrar admin credentials.  
Please confirm that you were able to successfully log in.
<br>
<br>
Your DID is registered on the Velocity Network ${whichNet(config)} as ${
        organization.didDoc.id
      }.
<br>
<br>
The following services have been activated for you on Velocity Network ${whichNet(
        config
      )}:
<br>
<br>
${JSON.stringify(activatedServiceIds, null, 2)}
<br>
<br>
If you have any questions or problems, please reply to this email.
<br>
<br>
Regards,
<br>
<br>
The Velocity Network Registrar
`,
      sender: config.registrarSupportEmail,
      recipients: emails,
      replyTo: config.registrarSupportEmail,
      html: true,
    };
  },
  emailToRegisteredOrgForServicesActivated: ({
    organization,
    activatedServiceIds = [],
    emails,
  }) => ({
    subject: `Velocity Services Activated on ${whichNet(config)}`,
    message: `
Hello,

You are being contacted because you are the admin of ${
      organization.profile.name
    } on Velocity Network ${whichNet(
      config
    )} and a new service has just been added to your organization. 

The following services have been activated for you on Velocity Network ${whichNet(
      config
    )}:

${JSON.stringify(activatedServiceIds, null, 2)}

If you have any questions or problems, please reply to this email.

Regards,

The Velocity Network Registrar`,
    sender: config.registrarSupportEmail,
    recipients: emails,
    replyTo: config.registrarSupportEmail,
  }),
  emailToSupportForOrgRegisteredAndServicesNeedActivation: (
    { organization, addedServices = [] },
    context
  ) => ({
    subject: `${config.nodeEnv.toUpperCase()}: Velocity Services Activation Required`,
    message: `Hello,
The organization: "${organization.profile.name}" with did "${
      organization.didDoc.id
    }" has registered.  
        
Their full profile looks like this:
${JSON.stringify(organization.profile, null, 2)}

Their requested services are:
${JSON.stringify(addedServices, null, 2)}

userAgent: ${context.headers['user-agent']}

Check in Zoho and trigger the API endpoint everything is kosher.

Regards,
BYTER-9000!
`,
    sender: config.noReplyEmail,
    recipients: [config.registrarSupportEmail],
  }),
  emailToSupportForServicesAddedAndNeedActivation: (
    { organization, addedServices = [] },
    context
  ) => ({
    subject: `${config.nodeEnv.toUpperCase()}: Velocity Services Activation Required`,
    message: `Hello,
The following service(s) have been added to "${
      organization.profile.name
    }" with did "${organization.didDoc.id}":

${JSON.stringify(buildPublicServices(addedServices), null, 2)}

userAgent: ${context.headers['user-agent']}

Check in Zoho and trigger the API endpoint everything is kosher.

Regards,
BYTER-9000!
`,
    sender: config.noReplyEmail,
    recipients: [config.registrarSupportEmail],
  }),
  emailToCAOsForServicesActivation: ({
    organization,
    activatedService,
    emails,
  }) => ({
    subject: `${organization.profile.name} service is now active`,
    message: `${organization.profile.name} has had the following service activated on the Velocity Network™:

${activatedService.type} on the agent ${activatedService.id} at ${activatedService.serviceEndpoint}  

The service is now able to be used on the Velocity Network™.
`,
    sender: config.registrarSupportEmail,
    recipients: emails,
    replyTo: config.registrarSupportEmail,
  }),
  emailToGroupForInvitationAccepted: ({ organization, services, emails }) => ({
    subject: `${config.nodeEnv.toUpperCase()}: ${
      organization.profile.name
    } has accepted your invitation`,
    /* eslint-disable max-len */
    message: `
${
  organization.profile.name
} has accepted your invitation to join the Velocity Network™. The following  service(s) has been registered:

${map(
  (service) =>
    `${service.type} on the agent ${service.caoService.id} at ${service.caoService.serviceEndpoint}`,
  services
).join(' \n')}

The service is still inactive. The foundation staff are reviewing the application and will activate the services on  in the next 72 hours. Upon successful review you will receive confirmation by email.
    `,
    /* eslint-enable */
    sender: config.registrarSupportEmail,
    recipients: emails,
    replyTo: config.registrarSupportEmail,
  }),
  emailOrganizationCreated: ({
    organization,
    ccs,
    attachment,
    attachmentName,
    contentType,
  }) => ({
    subject: `Organization ${organization.profile.name} created`,
    /* eslint-disable max-len */
    message: `
Organization ${organization.profile.name} was created by ${organization.profile.adminGivenName} ${organization.profile.adminFamilyName} and an approval request was sent to ${organization.profile.signatoryGivenName} ${organization.profile.signatoryFamilyName}. 

The organization was registered by: 
Given name: ${organization.profile.adminGivenName}
Family name: ${organization.profile.adminFamilyName}
Job title: ${organization.profile.adminTitle}
Email: ${organization.profile.adminEmail}

Signatory details: 
Given name: ${organization.profile.signatoryGivenName}
Family name: ${organization.profile.signatoryFamilyName}
Job title: ${organization.profile.signatoryTitle}
Email: ${organization.profile.signatoryEmail}
`,
    /* eslint-enable */
    sender: config.noReplyEmail,
    ccs,
    recipients: [config.registrarSupportEmail],
    attachment,
    attachmentName,
    contentType,
  }),
  emailToSignatoryForOrganizationApproval: ({
    organization,
    caoOrganization,
    authCode,
    isReminder = false,
  }) => ({
    subject: `${isReminder ? 'Reminder: ' : ''}${
      caoOrganization ? caoOrganization.profile.name : ''
    }${
      caoOrganization
        ? ''
        : `${organization.profile.adminGivenName} ${organization.profile.adminFamilyName}`
    } is requesting your approval to register ${
      organization.profile.name
    } on the Velocity Network`,
    /* eslint-disable max-len */
    message: `
<p>Dear ${organization.profile.signatoryGivenName} ${
      organization.profile.signatoryFamilyName
    },</p>
<br />
<br />
<p>As part of ongoing service enhancements for ${organization.profile.name}, ${
      caoOrganization ? caoOrganization.profile.name : ''
    }${
      caoOrganization
        ? ''
        : `${organization.profile.adminGivenName} ${organization.profile.adminFamilyName}`
    } has registered your organization to the Velocity Network to enable expanded functionality. To learn more about Velocity Network, please visit 
    <a href="https://www.velocitynetwork.foundation/" target="_blank">https://www.velocitynetwork.foundation/</a>.
</p>
<br />
<br />
<p>${
      organization.profile.name
    } has been assigned the following role(s) on Velocity Network:</p>
<br />
<ul>

</ul>
${flow(
  map(
    (service) => `
<li>
  <span
    style="
      border: none;
      cursor: pointer;
    "
  >
    ${ServiceTypeLabels[service.type]}
  </span>
</li>`
  ),
  join('')
)(organization.services)}
<br />
<p>Please confirm your approval of the following:</p>
<br />
<ul>
  <li>You are the authorized signatory for your organization.</li>
  <li>${organization.profile.adminGivenName} ${
      organization.profile.adminFamilyName
    } has been nominated as the administrator of ${
      organization.profile.name
    } on the Velocity Network.</li>
  <li>${organization.profile.adminGivenName} ${
      organization.profile.adminFamilyName
    } is authorized to accept the applicable 
  <a href="https://www.velocitynetwork.foundation/main2/participation-agreements" target="_blank">terms of participation</a> (https://www.velocitynetwork.foundation/main2/participation-agreements).</li>
</ul>
<div style="display: inline-block">
  <a
    href="${
      config.registrarAppUiUrl
    }/signatories/approve?authCode=${authCode}&did=${organization.didDoc.id}"
    target="_blank"
    style="
      border: none;
      color: white;
      background-color: #0277ff;
      text-decoration: none;
      padding: 5px 15px;
      text-align: center;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
    "
  >Approve</a>
  <span>&nbsp;</span>
  <a
    href="${
      config.registrarAppUiUrl
    }/signatories/reject?authCode=${authCode}&did=${organization.didDoc.id}"
    target="_blank"
    style="
      border: none;
      color: white;
      background-color: #0277ff;
      text-decoration: none;
      padding: 5px 15px;
      text-align: center;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
    "
  >Reject</a>
</div>
<br />
<p>
    <strong>If the buttons above do not work, please copy and paste the appropriate link into your browser:</strong>
</p>
<p>
    <strong>Approve:</strong>
<br />
<span>${
      config.registrarAppUiUrl
    }/signatories/approve?authCode=${authCode}&did=${
      organization.didDoc.id
    }</span>
</p>

<p>
    <strong>Reject:</strong>
    <br />
    <span>
        ${
          config.registrarAppUiUrl
        }/signatories/reject?authCode=${authCode}&did=${organization.didDoc.id}
    </span>
</p>
<br />

`,
    /* eslint-enable */
    sender: config.registrarSupportEmail,
    recipients: [organization.profile.signatoryEmail],
    bccs: [config.registrarSupportEmail],
    replyTo: config.registrarSupportEmail,
    html: true,
  }),
});

module.exports = { initOrganizationRegistrarEmails };
