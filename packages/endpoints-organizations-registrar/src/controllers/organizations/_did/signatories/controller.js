const {
  signatoryApproveOrganizationEmail,
  approveReminder,
  rejectReminder,
  validateAuthCode,
} = require('../../../../entities');

const signatoriesController = async (fastify) => {
  const { sendEmail } = fastify;

  fastify.get(
    '/response/:response',
    {
      schema: fastify.autoSchema({
        params: {
          type: 'object',
          properties: {
            did: {
              type: 'string',
            },
            response: {
              type: 'string',
              enum: ['approve', 'reject'],
            },
          },
          required: ['did', 'response'],
        },
        querystring: {
          type: 'object',
          properties: {
            authCode: {
              type: 'string',
            },
          },
          required: ['authCode'],
        },
        response: {
          200: { type: 'null' },
          401: { $ref: 'error#' },
          400: { $ref: 'error#' },
        },
      }),
    },
    async (req) => {
      const { repos, params, query } = req;
      const { did, response } = params;
      const { authCode } = query;
      const reminderMap = {
        approve: approveReminder,
        reject: rejectReminder,
      };
      const organization = await repos.organizations.findOneByDid(did);
      await validateAuthCode(did, authCode, req);
      await sendEmail(
        signatoryApproveOrganizationEmail({ organization, response }, req)
      );
      await reminderMap[response](organization, req);
      return {};
    }
  );
};

module.exports = signatoriesController;
