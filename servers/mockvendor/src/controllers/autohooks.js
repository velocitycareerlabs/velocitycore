const {
  didServiceSchema,
  modifyDidServiceSchema,
  registrarMessage,
  registrarMessageResponse,
  newOfferRelatedResourceSchema,
} = require('@velocitycareerlabs/common-schemas');
const {
  newVendorOfferSchema,
} = require('@velocitycareerlabs/server-credentialagent/src/controllers/operator/tenants/_tenantId/offers/schemas');
const { issuerDataSchema } = require('./schemas');

module.exports = async (fastify) => {
  fastify
    .addSchema(issuerDataSchema)
    .addSchema(newOfferRelatedResourceSchema)
    .addSchema(newVendorOfferSchema)
    .addSchema(modifyDidServiceSchema)
    .addSchema(didServiceSchema)
    .addSchema(registrarMessage)
    .addSchema(registrarMessageResponse);
};
