/*
 * Copyright 2025 Velocity Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const { hexFromJwk, jwkFromSecp256k1Key } = require('@velocitycareerlabs/jwt');
const {
  get2BytesHash,
  encrypt,
  encryptBuffer,
  deriveEcYValue,
  decrypt,
  decryptBuffer,
  isEcYValueEven,
  KeyTypes,
  EC2KeyParameters,
  EllipticCurves,
  RSAKeyParameters,
  CoseKey,
} = require('@velocitycareerlabs/crypto');
const { ALG_TYPE } = require('./constants');

const encodeJwk = async (algType, jwk, secret) => {
  if (algType === ALG_TYPE.HEX_AES_256) {
    if (jwk.kty !== 'EC' || jwk.crv !== 'secp256k1') {
      throw new Error('Hex encoding is only supported for secp256k1 keys');
    }
    return Buffer.from(encrypt(hexFromJwk(jwk, false), secret), 'base64');
  }

  if (algType === ALG_TYPE.COSEKEY_AES_256) {
    const coseKey =
      jwk.kty === 'RSA' ? convertRSAToCoseKey(jwk) : convertECToCoseKey(jwk);

    return encryptBuffer(Buffer.from(await coseKey.toBytes()), secret);
  }

  throw new Error('Unsupported algorithm type');
};

const decodeJwk = async (algType, rawKeyBuffer, secret) => {
  if (algType === get2BytesHash(ALG_TYPE.HEX_AES_256)) {
    return jwkFromSecp256k1Key(
      decrypt(rawKeyBuffer.toString('base64'), secret),
      false
    );
  }
  if (algType === get2BytesHash(ALG_TYPE.COSEKEY_AES_256)) {
    const coseKey = await CoseKey.fromBytes(
      decryptBuffer(rawKeyBuffer, secret)
    );
    return coseKey.kty === KeyTypes.RSA
      ? convertCoseKeyToRSA(coseKey)
      : convertCoseKeyToEC(coseKey);
  }
  throw new Error(`Unsupported algType ${algType}`);
};

const convertCoseKeyToRSA = (coseKey) => {
  return {
    kty: 'RSA',
    n: Buffer.from(coseKey.getParam(RSAKeyParameters.N)).toString('base64url'),
    e: Buffer.from(coseKey.getParam(RSAKeyParameters.E)).toString('base64url'),
  };
};

const convertCoseKeyToEC = (coseKey) => {
  const crv =
    coseKey.getParam(EC2KeyParameters.Crv) === EllipticCurves.Secp256k1
      ? 'secp256k1'
      : 'P-256';
  const x = Buffer.from(coseKey.getParam(EC2KeyParameters.X));
  const y = deriveEcYValue(crv, x, coseKey.getParam(EC2KeyParameters.Y));

  return {
    kty: 'EC',
    crv,
    x: x.toString('base64url'),
    y: y.toString('base64url'),
  };
};

const convertRSAToCoseKey = (jwk) => {
  const key = new CoseKey();
  key.kty = KeyTypes.RSA;
  return key
    .setParam(RSAKeyParameters.N, Buffer.from(jwk.n, 'base64url'))
    .setParam(RSAKeyParameters.E, Buffer.from(jwk.e, 'base64url'));
};

const convertECToCoseKey = (jwk) => {
  const y = isEcYValueEven(Buffer.from(jwk.y, 'base64url'));
  const key = new CoseKey();
  key.kty = KeyTypes.EC2;
  return key
    .setParam(
      EC2KeyParameters.Crv,
      jwk.crv === 'secp256k1' ? EllipticCurves.Secp256k1 : EllipticCurves.P_256
    )
    .setParam(EC2KeyParameters.X, Buffer.from(jwk.x, 'base64url'))
    .setParam(EC2KeyParameters.Y, y);
};

module.exports = {
  encodeJwk,
  decodeJwk,
  convertECToCoseKey,
  convertCoseKeyToEC,
};
