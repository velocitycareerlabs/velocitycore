const mockPrintInfo = jest.fn();

const fs = require('fs').promises;

jest.mock('../src/common.js', () => {
  const originalModule = jest.requireActual('../src/common.js');
  return {
    ...originalModule,
    printInfo: mockPrintInfo,
  };
});

const currentDir = process.cwd();

const createPersona = async (name, body) => {
  await fs.writeFile(`${currentDir}/${name}.prv.key`, body);
  await fs.writeFile(`${currentDir}/${name}.did`, JSON.stringify({}));
};

const deletePersona = async (name) => {
  const path = `${currentDir}/${name}`;
  const existsPrv = await fs
    .access(`${path}.prv.key`)
    .then(() => true)
    .catch(() => false);
  const existsDid = await fs
    .access(`${path}.did`)
    .then(() => true)
    .catch(() => false);
  // eslint-disable-next-line no-unused-expressions
  existsPrv && (await fs.rm(`${path}.prv.key`));
  // eslint-disable-next-line no-unused-expressions
  existsDid && (await fs.rm(`${path}.did`));
};

const { generateKeyPair } = require('@velocitycareerlabs/crypto');
const { jwtVerify, jwkFromSecp256k1Key } = require('@velocitycareerlabs/jwt');
const { getDidUriFromJwk } = require('@velocitycareerlabs/did-doc');
const { generateProof } = require('../src/verifgen-proof/generate-proof');

describe('Test proof cli tool', () => {
  let keyPair;

  beforeEach(async () => {
    await deletePersona('persona1');
    jest.resetAllMocks();
    keyPair = await generateKeyPair();
    await createPersona('persona1', keyPair.privateKey);
  });

  it('should not generate a proof if persona is missing', async () => {
    expect(() =>
      generateProof({
        challenge: 'abc',
        persona: 'not-exist',
        audience: 'http://test.com',
      })
    ).rejects.toThrow('Persona not-exist DID File not found');
  });

  it('should generate a proof by a prv.key', async () => {
    JSON.stringify(keyPair.privateKey);
    const proof = await generateProof({
      challenge: 'abc',
      persona: 'persona1',
      audience: 'http://test.com',
    });
    expect(proof).toBeDefined();
    expect(mockPrintInfo).toHaveBeenCalled();
    expect(mockPrintInfo).toHaveBeenLastCalledWith(
      `\nGenerated proof jwt:\n${proof}\n`
    );
    const parsedJwt = await jwtVerify(
      proof,
      jwkFromSecp256k1Key(keyPair.publicKey, false)
    );
    const expectedKid = getDidUriFromJwk(
      jwkFromSecp256k1Key(keyPair.publicKey, false)
    );
    expect(parsedJwt).toStrictEqual({
      header: {
        alg: 'ES256K',
        typ: 'JWT',
        kid: `${expectedKid}#0`,
      },
      payload: {
        aud: 'http://test.com',
        iat: expect.any(Number),
        iss: expectedKid,
        nonce: 'abc',
      },
    });
  });

  it('should generate a proof by a prv.key.json', async () => {
    const persona2Keypair = await generateKeyPair({ format: 'jwk' });
    const name = 'persona2';
    await fs.writeFile(
      `${currentDir}/${name}.prv.key.json`,
      JSON.stringify(persona2Keypair.privateKey)
    );
    await fs.writeFile(`${currentDir}/${name}.did`, JSON.stringify({}));
    const proof = await generateProof({
      challenge: 'abc',
      persona: 'persona2',
      audience: 'http://test.com',
    });
    expect(proof).toBeDefined();
    expect(mockPrintInfo).toHaveBeenCalled();
    expect(mockPrintInfo).toHaveBeenLastCalledWith(
      `\nGenerated proof jwt:\n${proof}\n`
    );
    const parsedJwt = await jwtVerify(proof, persona2Keypair.publicKey);
    const expectedKid = getDidUriFromJwk(persona2Keypair.publicKey);
    expect(parsedJwt).toStrictEqual({
      header: {
        alg: 'ES256K',
        typ: 'JWT',
        kid: `${expectedKid}#0`,
      },
      payload: {
        aud: 'http://test.com',
        iat: expect.any(Number),
        iss: expectedKid,
        nonce: 'abc',
      },
    });
  });
});
