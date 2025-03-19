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

const { isEmpty, omitBy, isNil, map, first } = require('lodash/fp');
const {
  extractCaoServiceRefs,
} = require('../../organization-services/domains');
const { initAuth0Provisioner } = require('../../oauth');
const { parseProfileToCsv } = require('../domains');
const {
  initOrganizationRegistrarEmails,
} = require('./init-organization-registrar-emails');

const initSendEmailNotifications = (initCtx) => {
  const { config } = initCtx;
  const {
    emailToNewOrgForServicesActivated,
    emailToSupportForOrgRegisteredAndServicesNeedActivation,
    emailToSupportForServicesAddedAndNeedActivation,
    emailToRegisteredOrgForServicesActivated,
    emailOrganizationCreated,
    emailToSignatoryForOrganizationApproval,
  } = initOrganizationRegistrarEmails(config);
  const { getUsersByIds } = initAuth0Provisioner(config);

  const shouldSendEmailForServicesActivated = (
    activatedServiceIds,
    userEmails
  ) => {
    return activatedServiceIds.length > 0 && !isEmpty(userEmails);
  };

  const shouldSendEmailForServicesNeedActivation = (
    addedServices,
    activatedServiceIds
  ) => {
    return (
      addedServices.length > 0 &&
      activatedServiceIds.length !== addedServices.length
    );
  };

  const sendServiceNotification = async (
    {
      organization,
      userEmails,
      addedServices = [],
      activatedServiceIds = [],
      isCreateOrganization = false,
    },
    ctx
  ) => {
    const emailToServiceNeedActivation = isCreateOrganization
      ? emailToSupportForOrgRegisteredAndServicesNeedActivation
      : emailToSupportForServicesAddedAndNeedActivation;

    const emailForServicesActivated = isCreateOrganization
      ? emailToNewOrgForServicesActivated
      : emailToRegisteredOrgForServicesActivated;

    if (shouldSendEmailForServicesActivated(activatedServiceIds, userEmails)) {
      await initCtx.sendEmail(
        emailForServicesActivated({
          organization,
          activatedServiceIds,
          emails: userEmails,
        })
      );
    } else if (
      shouldSendEmailForServicesNeedActivation(
        addedServices,
        activatedServiceIds
      )
    ) {
      await initCtx.sendEmail(
        emailToServiceNeedActivation(
          {
            organization,
            addedServices,
          },
          ctx
        )
      );
    }
  };

  const sendServiceNotificationToGroup = async (
    {
      organization,
      addedServices,
      activatedServiceIds,
      isCreateOrganization = false,
    },
    ctx
  ) => {
    const { repos, user, log } = ctx;
    const group = await repos.groups.findGroupByUserIdAndDid(
      user.sub,
      organization.didDoc.id
    );
    if (!group) {
      const message = 'There was no group for organization';
      log.info(
        {
          did: organization.didDoc.id,
          user: user.sub,
        },
        message
      );
      return;
    }

    const { clientAdminIds } = group;
    const userEmails = map(
      'email',
      await getUsersByIds({ userIds: clientAdminIds })
    );

    await sendServiceNotification(
      omitBy(isNil, {
        organization,
        userEmails,
        addedServices,
        activatedServiceIds,
        isCreateOrganization,
      }),
      ctx
    );
  };

  const sendOrganizationCreatedNotification = async (organization) => {
    const csvFile = await parseProfileToCsv(organization.profile);
    await initCtx.sendEmail(
      emailOrganizationCreated({
        organization,
        ccs: config.organizationCreationEmailCcList,
        attachment: csvFile,
        attachmentName: 'organization.csv',
        contentType: 'text/csv',
      })
    );
  };

  const sendEmailToSignatoryForOrganizationApproval = async (
    { organization, authCode, isReminder = false },
    context
  ) => {
    const caoServiceIds = extractCaoServiceRefs(organization.services);
    const caos = await context.repos.organizations.findCaos(caoServiceIds);
    const caoOrganization = first(caos);

    if (isEmpty(caoOrganization)) {
      context.log.info(
        `Signatory reminder does not send. CAO does not exists. Organization: ${organization.didDoc.id}`
      );
      return;
    }

    await initCtx.sendEmail(
      emailToSignatoryForOrganizationApproval({
        organization,
        caoOrganization,
        authCode,
        isReminder,
      })
    );
  };

  return {
    sendServiceNotification,
    sendServiceNotificationToGroup,
    sendOrganizationCreatedNotification,
    sendEmailToSignatoryForOrganizationApproval,
  };
};

module.exports = {
  initSendEmailNotifications,
};
