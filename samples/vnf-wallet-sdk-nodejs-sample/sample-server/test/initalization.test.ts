import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { FastifyInstance } from 'fastify';

import { VCLImpl } from '@velocitycareerlabs/vnf-nodejs-wallet-sdk/src/impl/VCLImpl';
import {
  VCLCryptoServicesDescriptor,
  VCLInitializationDescriptor,
  VCLXVnfProtocolVersion,
} from '@velocitycareerlabs/vnf-nodejs-wallet-sdk/src';
import VCLCountries from '@velocitycareerlabs/vnf-nodejs-wallet-sdk/src/api/entities/VCLCountries';
import VCLEnvironment from '@velocitycareerlabs/vnf-nodejs-wallet-sdk/src/api/VCLEnvironment';
import { VCLCountryCodes } from '@velocitycareerlabs/vnf-nodejs-wallet-sdk';
import app from '../src/App';
import { JwtSignServiceMock } from './mocks/jwt/JwtSignServiceMock';
import { JwtVerifyServiceMock } from './mocks/jwt/JwtVerifyServiceMock';
import { KeyServiceMock } from './mocks/key/KeyServiceMock';

describe('initialization flow', () => {
  let appInstance: FastifyInstance;
  const vcl = new VCLImpl();
  beforeAll(async () => {
    appInstance = app({ logger: true });
  });

  afterAll(async () => {
    await appInstance.close();
  });

  test('App initialization', async () => {
    await vcl.initialize(
      new VCLInitializationDescriptor(
        VCLEnvironment.Dev,
        VCLXVnfProtocolVersion.XVnfProtocolVersion2,
        new VCLCryptoServicesDescriptor(
          new KeyServiceMock(),
          new JwtSignServiceMock(),
          new JwtVerifyServiceMock()
        )
      )
    );
    console.log(
      '#Credential Types: %s',
      vcl.credentialTypesModel?.data?.all?.length ?? 0
    );
    console.log(
      '#Credential Type Schemas: %s',
      Object.keys(vcl.credentialTypeSchemasModel?.data?.all ?? {}).length
    );
    console.log('#Countries: %s', vcl.countriesModel?.data?.all?.length ?? 0);

    const afghanistanCountry = vcl.countriesModel?.data?.countryByCode(
      VCLCountryCodes.AF
    );
    const afghanistanRegions = afghanistanCountry?.regions;

    const AfghanistanRegion1Name = 'Balkh Province';
    const AfghanistanRegion1Code = 'BAL';
    const AfghanistanRegion2Name = 'Bamyan Province';
    const AfghanistanRegion2Code = 'BAM';
    const AfghanistanRegion3Name = 'Badghis Province';
    const AfghanistanRegion3Code = 'BDG';

    expect(afghanistanCountry?.code === 'AF').toBeTruthy();
    expect(afghanistanCountry?.name === 'Afghanistan').toBeTruthy();

    expect(
      afghanistanRegions?.all[0].name === AfghanistanRegion1Name
    ).toBeTruthy();
    expect(
      afghanistanRegions?.all[0].code === AfghanistanRegion1Code
    ).toBeTruthy();
    expect(
      afghanistanRegions?.all[1].name === AfghanistanRegion2Name
    ).toBeTruthy();
    expect(
      afghanistanRegions?.all[1].code === AfghanistanRegion2Code
    ).toBeTruthy();
    expect(
      afghanistanRegions?.all[2].name === AfghanistanRegion3Name
    ).toBeTruthy();
    expect(
      afghanistanRegions?.all[2].code === AfghanistanRegion3Code
    ).toBeTruthy();
  }, 400000);
});
