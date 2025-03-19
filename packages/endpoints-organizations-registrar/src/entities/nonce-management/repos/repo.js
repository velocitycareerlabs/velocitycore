const { repoFactory } = require('@spencejs/spence-mongo-repos');
const {
  defaultMongoCollectionConfig,
} = require('@velocitycareerlabs/nonce-management');

module.exports = (app, options, next = () => {}) => {
  next();
  return repoFactory(defaultMongoCollectionConfig, app);
};
