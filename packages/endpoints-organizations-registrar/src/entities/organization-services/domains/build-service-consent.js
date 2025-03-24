const { nanoid } = require('nanoid');
const { map } = require('lodash/fp');
const { isCaoService, isNodeOperator } = require('./is-service-category');
const { ConsentTypes } = require('../../registrar-consents');

const buildServiceConsent = (organization, service, { user }) => {
  return {
    organizationId: organization._id,
    serviceId: service.id,
    userId: user.sub,
    consentId: nanoid(),
    version: 1,
    type: getServiceConsentType(service),
  };
};

const buildServicesConsents = (organization, services, context) =>
  map(
    (service) => buildServiceConsent(organization, service, context),
    services
  );

const getServiceConsentType = (service) => {
  if (isCaoService(service)) {
    return ConsentTypes.CAO;
  }
  if (isNodeOperator(service)) {
    return ConsentTypes.NodeOperator;
  }
  return ConsentTypes.IssuerInspector;
};

module.exports = {
  buildServiceConsent,
  buildServicesConsents,
  getServiceConsentType,
};
