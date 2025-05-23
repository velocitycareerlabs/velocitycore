/* eslint-disable import/no-extraneous-dependencies */
import '@velocitycareerlabs/tests-helpers/src/setup-react-tests.mjs';
import { TextEncoder, TextDecoder } from 'util';
import { register } from 'node:module';

register('./alias-resolver.mjs', import.meta.url);
register('./jsx-resolver.mjs', import.meta.url);

// eslint-disable-next-line better-mutation/no-mutation
global.TextEncoder = TextEncoder;
// eslint-disable-next-line better-mutation/no-mutation
global.TextDecoder = TextDecoder;
