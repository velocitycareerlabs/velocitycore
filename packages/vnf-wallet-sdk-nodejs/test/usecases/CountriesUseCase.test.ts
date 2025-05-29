import NetworkServiceSuccess from '../infrastructure/resources/network/NetworkServiceSuccess';
import CountriesUseCaseImpl from '../../src/impl/data/usecases/CountriesModelUseCaseImpl';
import CountriesRepositoryImpl from '../../src/impl/data/repositories/CountriesRepositoryImpl';
import { CountriesMocks } from '../infrastructure/resources/valid/CountriesMocks';
import { VCLCountryCodes } from '../../src';

describe('CredentialManifestUseCase Tests', () => {
    const subject = new CountriesUseCaseImpl(
        new CountriesRepositoryImpl(
            new NetworkServiceSuccess(JSON.parse(CountriesMocks.CountriesJson))
        )
    );

    test('testGetCountriesSuccess', async () => {
        const countries = await subject.getCountries();

        const afghanistanCountry = countries.countryByCode(VCLCountryCodes.AF);
        const afghanistanRegions = afghanistanCountry?.regions;

        expect(afghanistanCountry?.code).toEqual(
            CountriesMocks.AfghanistanCode
        );
        expect(afghanistanCountry?.name).toEqual(
            CountriesMocks.AfghanistanName
        );

        expect(afghanistanRegions?.all[0].name).toEqual(
            CountriesMocks.AfghanistanRegion1Name
        );
        expect(afghanistanRegions?.all[0].code).toEqual(
            CountriesMocks.AfghanistanRegion1Code
        );
        expect(afghanistanRegions?.all[1].name).toEqual(
            CountriesMocks.AfghanistanRegion2Name
        );
        expect(afghanistanRegions?.all[1].code).toEqual(
            CountriesMocks.AfghanistanRegion2Code
        );
        expect(afghanistanRegions?.all[2].name).toEqual(
            CountriesMocks.AfghanistanRegion3Name
        );
        expect(afghanistanRegions?.all[2].code).toEqual(
            CountriesMocks.AfghanistanRegion3Code
        );
    });
});
