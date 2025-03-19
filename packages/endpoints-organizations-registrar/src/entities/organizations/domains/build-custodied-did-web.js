const { uriToDidWeb } = require('@velocitycareerlabs/did-web');

const buildCustodiedDidWeb = (profile, { config: { custodiedDidWebHost } }) => {
  const profileUrl = new URL(profile.website);
  const url = new URL(custodiedDidWebHost);
  url.pathname = `/d/${profileUrl.hostname}`;
  return uriToDidWeb(url.href);
};

module.exports = {
  buildCustodiedDidWeb,
};
