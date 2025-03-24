/* eslint-disable better-mutation/no-mutation */
const crypto = require('crypto');
// eslint-disable-next-line import/no-extraneous-dependencies
const { TextEncoder, TextDecoder } = require('util');

// eslint-disable-next-line better-mutation/no-mutating-functions
Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.webcrypto.subtle,
  },
});
global.crypto.subtle = {};
window.crypto.subtle = {};
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }) => children,
  withAuthenticationRequired: (component) => component,
  useAuth0: () => {
    return {
      isLoading: false,
      user: { sub: 'user_123' },
      isAuthenticated: true,
      loginWithRedirect: jest.fn(),
      getAccessTokenSilently: jest.fn(() => Promise.resolve('1234')),
    };
  },
}));
