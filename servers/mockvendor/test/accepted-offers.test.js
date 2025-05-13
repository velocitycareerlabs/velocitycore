const { after, before, beforeEach, describe, it } = require('node:test');
const { expect } = require('expect');

const { mongoDb } = require('@spencejs/spence-mongo-repos');
const {
  ISO_DATETIME_FORMAT,
  OBJECT_ID_FORMAT,
} = require('@velocitycareerlabs/test-regexes');
const buildFastify = require('./helpers/mockvendor-build-fastify');
const initAcceptedOffersFactory = require('./factories/accepted-offers.factory');

describe('Accepted Offer managment', () => {
  let fastify;
  let persistAcceptedOffers;

  before(async () => {
    fastify = buildFastify();
    await fastify.ready();
    ({ persistAcceptedOffers } = initAcceptedOffersFactory(fastify));
  });

  beforeEach(async () => {
    await mongoDb().collection('acceptedOffers').deleteMany({});
  });

  after(async () => {
    await mongoDb().collection('acceptedOffers').deleteMany({});
    await fastify.close();
  });

  it('should retrieve the accepted offers', async () => {
    const acceptedOffer = await persistAcceptedOffers();
    const response = await fastify.injectJson({
      method: 'GET',
      url: '/api/accepted-offers',
    });
    expect(response.statusCode).toEqual(200);
    expect(response.json).toEqual(
      expect.arrayContaining([
        {
          id: expect.stringMatching(OBJECT_ID_FORMAT),
          _id: expect.stringMatching(OBJECT_ID_FORMAT),
          createdAt: expect.stringMatching(ISO_DATETIME_FORMAT),
          updatedAt: expect.stringMatching(ISO_DATETIME_FORMAT),
          ...acceptedOffer,
        },
      ])
    );
  });
});
