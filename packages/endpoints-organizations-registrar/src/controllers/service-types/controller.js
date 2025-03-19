const {
  ServiceTypes,
  ServiceTypeToCategoryMap,
} = require('@velocitycareerlabs/organizations-registry');
const { map, includes } = require('lodash/fp');

const CredentialGroupToServiceTypeMap = {
  [ServiceTypes.IdentityIssuerType]: undefined,
  [ServiceTypes.InspectionType]: undefined,
  [ServiceTypes.NotaryIssuerType]: 'Contact',
  [ServiceTypes.HolderAppProviderType]: undefined,
  [ServiceTypes.NodeOperatorType]: undefined,
  [ServiceTypes.CredentialAgentOperatorType]: undefined,
  [ServiceTypes.CareerIssuerType]: 'Career',
  [ServiceTypes.IdDocumentIssuerType]: 'IdDocument',
  [ServiceTypes.NotaryIdDocumentIssuerType]: 'IdDocument',
  [ServiceTypes.ContactIssuerType]: 'Contact',
  [ServiceTypes.NotaryContactIssuerType]: 'Contact',
};

const isNotary = (serviceType) =>
  includes(serviceType, [
    ServiceTypes.NotaryContactIssuerType,
    ServiceTypes.NotaryIdDocumentIssuerType,
    ServiceTypes.NotaryIssuerType,
  ]);

const serviceTypesController = async (fastify) => {
  fastify.get(
    '/',
    {
      schema: fastify.autoSchema({
        response: {
          200: {
            type: 'object',
            properties: {
              serviceTypes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    serviceType: {
                      type: 'string',
                    },
                    serviceCategory: {
                      type: 'string',
                    },
                    notary: {
                      type: 'boolean',
                    },
                    credentialGroup: {
                      type: 'string',
                      enum: ['Career', 'IdDocument', 'Contact'],
                    },
                  },
                  required: ['serviceType', 'serviceCategory'],
                },
              },
            },
          },
        },
      }),
    },
    async () => {
      const serviceTypes = map(
        (serviceType) => ({
          serviceType,
          serviceCategory: ServiceTypeToCategoryMap[serviceType],
          notary: isNotary(serviceType),
          credentialGroup: CredentialGroupToServiceTypeMap[serviceType],
        }),
        ServiceTypes
      );
      return {
        serviceTypes,
      };
    }
  );
};

module.exports = serviceTypesController;
