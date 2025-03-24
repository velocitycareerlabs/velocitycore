const { isDidUrlWithFragment } = require('@velocitycareerlabs/did-doc');

const extractServiceEndpointDid = (service) => {
  if (isDidUrlWithFragment(service.serviceEndpoint)) {
    return service.serviceEndpoint;
  }
  return undefined;
};

module.exports = { extractServiceEndpointDid };
