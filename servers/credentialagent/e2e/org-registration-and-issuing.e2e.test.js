/*
 * Copyright 2024 Velocity Team
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
const console = require('console');
const { MongoClient } = require('mongodb');
const { nanoid } = require('nanoid');
const {
  filter,
  first,
  find,
  map,
  omit,
  replace,
  isEqual,
} = require('lodash/fp');
const { KeyPurposes, generateKeyPair } = require('@velocitycareerlabs/crypto');
const {
  applyOverrides,
  wait,
  formatAsDate,
} = require('@velocitycareerlabs/common-functions');
const {
  DID_FORMAT,
  OBJECT_ID_FORMAT,
  ISO_DATETIME_FORMAT,
} = require('@velocitycareerlabs/test-regexes');
const { ServiceTypes } = require('@velocitycareerlabs/organizations-registry');
const {
  jwtDecode,
  jwtVerify,
  generateDocJwt,
  generatePresentationJwt,
  toJwk,
  jwtSign,
} = require('@velocitycareerlabs/jwt');
const { getDidUriFromJwk } = require('@velocitycareerlabs/did-doc');
const { hashOffer } = require('@velocitycareerlabs/velocity-issuing');
const { CheckResults } = require('@velocitycareerlabs/vc-checks');

const { addMonths } = require('date-fns/fp');
const {
  initVerificationCoupon,
} = require('@velocitycareerlabs/metadata-registration');
const { initProvider } = require('@velocitycareerlabs/base-contract-io');
const dotenv = require('dotenv');
const path = require('path');
const { toHexString } = require('@velocitycareerlabs/blockchain-functions');
const {
  Authorities,
} = require('@velocitycareerlabs/endpoints-organizations-registrar');
const { jwtVcExpectation } = require('../test/helpers/jwt-vc-expectation');
const {
  sampleEducationDegreeGraduation,
} = require('../test/helpers/sample-education-degree-graduation');

const registrarUrl = 'https://localhost:13003';
const fineractUrl = 'http://localhost:13008';
const cihUrl = 'http://localhost:13002';
const rpcUrl = 'http://localhost:18545';

const authenticate = () => 'TOKEN';
const rpcProvider = initProvider(rpcUrl, authenticate);
const e2eEnv = {};
dotenv.config({
  path: path.resolve(__dirname, '..', '..', 'oracle', '.localdev.env'),
  processEnv: e2eEnv,
});
console.dir(e2eEnv);

const OPERATOR_API_TOKEN = 'foo';
const EDUCATION_DEGREE_CREDENTIAL_TYPE = 'EducationDegreeGraduationV1.1';

describe('org registration and issuing e2e', () => {
  let client;

  let holderKeyPair;
  let holderDid;

  afterAll(async () => {
    await client.close();
  });
  beforeAll(async () => {
    client = await MongoClient.connect('mongodb://localhost:17017');
    await client.db('oracle').collection('walletNonces').deleteMany({});

    // Generate holder DID and key pair for fake wallet
    holderKeyPair = generateKeyPair({ format: 'jwk' });
    holderDid = getDidUriFromJwk(holderKeyPair.publicKey);
  });

  it('register org, create tenant, preauth service, depot & credential and have holder claim it and finally verify a presentation', async () => {
    const profilePayload = {
      name: `ACME Corp: ${nanoid(6)}`,
      logo: 'http://www.acmecorp.com/corporate-logo.png',
      contactEmail: 'contact@acmecorp.com',
      technicalEmail: 'contact@acmecorp.com',
      commercialEntities: [
        {
          type: 'Brand',
          name: 'BETA Max',
          logo: 'https://www.acmecorp.com/betamax-logo.png',
        },
      ],
      website: 'https://www.credentialagent.com',
      registrationNumbers: [
        {
          authority: Authorities.DunnAndBradstreet,
          number: '123457779',
          uri: 'https://uri.com',
        },
      ],
      location: {
        countryCode: 'US',
        regionCode: 'US-IL',
      },
      type: 'company',
      founded: '2020-01-01',
      description: 'Short description',
      linkedInProfile: 'https://www.linkedin.com/in/test-profile',
      physicalAddress: {
        line1: '123 Main St',
        line2: 'Suite 123',
        line3: 'New York',
      },
      adminGivenName: 'Admin Given Name',
      adminFamilyName: 'Admin Family Name',
      adminTitle: 'Admin Title',
      adminEmail: 'admin@email.com',
      signatoryGivenName: 'Signatory Given Name',
      signatoryFamilyName: 'Signatory Family Name',
      signatoryTitle: 'Signatory Title',
      signatoryEmail: 'signatory@email.com',
    };

    const serviceEndpoints = [
      {
        id: '#cao1',
        type: ServiceTypes.CredentialAgentOperatorType,
        serviceEndpoint: replace('http', 'https', cihUrl),
      },
      {
        id: '#issuer1',
        type: ServiceTypes.CareerIssuerType,
        serviceEndpoint: replace('http', 'https', cihUrl),
      },
      {
        id: '#rp1',
        type: ServiceTypes.InspectionType,
        serviceEndpoint: replace('http', 'https', cihUrl),
      },
    ];

    const authResponse = await fetch('http://localhost:13000/oauth/token', {
      method: 'POST',
      body: JSON.stringify({
        client_id: 'client_id',
        client_secret: 'client_secret',
        audience: 'testAudience',
        grant_type: 'client_credentials',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const authJson = await authResponse.json();

    const createFullOrganizationResponse = await fetch(
      `${registrarUrl}/api/v0.6/organizations/full`,
      {
        method: 'POST',
        body: JSON.stringify({
          profile: profilePayload,
          serviceEndpoints,
        }),
        headers: {
          'x-auto-activate': '1',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authJson.access_token}`,
        },
      }
    ).then((r) => r.json());

    // json response checks
    expect(createFullOrganizationResponse.id).toMatch(DID_FORMAT);
    const { id: did, ids, profile, keys } = createFullOrganizationResponse;
    console.dir({ msg: 'Organization registered', did });

    await wait(500);

    const fineractAuthResponse = await fetch(
      'http://localhost:13000/oauth/token',
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: 'client_id',
          client_secret: 'client_secret',
          audience: 'https://fineract.velocitycareerlabs.io',
          grant_type: 'client_credentials',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const quantity = 100;
    const expiry = addMonths(3, new Date());
    const fineractAuthJson = await fineractAuthResponse.json();
    const mint = await initMintBundle();
    const { bundleId } = await mint({
      toAddress: createFullOrganizationResponse.ids.ethereumAccount,
      expirationTime: expiry,
      quantity,
      ownerDid: createFullOrganizationResponse.ids.did,
    });
    const createVoucherResponse = await fetch(
      `${fineractUrl}/fineract-provider/api/v1/datatables/Voucher/${createFullOrganizationResponse.ids.fineractClientId}?genericResultSet=true`,
      {
        method: 'POST',
        body: JSON.stringify({
          couponBundleId: toHexString(bundleId),
          symbol: 'VVO',
          quantity: `${quantity}`,
          used: '0',
          locale: 'en',
          dateFormat: 'yyyy-MM-dd',
          expiry: formatAsDate(expiry),
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fineractAuthJson.access_token}`,
          'fineract-platform-tenantid': 'default',
        },
      }
    );
    expect(createVoucherResponse.status).toEqual(200);
    await expect(createVoucherResponse.json()).resolves.toEqual({
      clientId: parseInt(
        createFullOrganizationResponse.ids.fineractClientId,
        10
      ),
      officeId: 1,
      resourceId: expect.any(Number),
    });

    const balanceQuery2Response = await fetch(
      `${fineractUrl}/fineract-provider/api/v1/vouchers/${createFullOrganizationResponse.ids.fineractClientId}/balance`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fineractAuthJson.access_token}`,
          'fineract-platform-tenantid': 'default',
        },
      }
    );
    await expect(balanceQuery2Response.json()).resolves.toEqual({
      balance: 100,
    });

    // Tenant Creation
    const createTenantPayload = {
      tenant: { did, caoDid: did },
      keys: filter(
        ({ purposes }) =>
          [
            KeyPurposes.DLT_TRANSACTIONS,
            KeyPurposes.EXCHANGES,
            KeyPurposes.ISSUING_METADATA,
          ].includes(first(purposes)),
        keys
      ),
    };
    const createTenantResponse = await fetch(
      `${cihUrl}/operator/tenants/create`,
      {
        method: 'POST',
        body: JSON.stringify(createTenantPayload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPERATOR_API_TOKEN}`,
        },
      }
    );
    expect(createTenantResponse.status).toEqual(200);
    const createTenantJson = await createTenantResponse.json();
    expect(createTenantJson).toEqual({
      tenant: expectedTenant(createTenantPayload.tenant, ids.ethereumAccount),
      keyMetadatas: expectedKeyMetadatas(createTenantPayload.keys),
      requestId: expect.any(String),
    });
    const { tenant } = createTenantJson;
    console.dir({ msg: 'Tenant created', tenant });

    // Service Creation
    const createServicePayload = {
      tenantId: tenant.id,
      service: {
        velocityNetworkServiceId: serviceEndpoints[1].id,
        description: 'issuing service',
        termsUrl: 'http://www.example.com/terms.html',
        authMethods: ['preauth'],
        authMode: 'internal',
        authTokensExpireIn: 100000,
        challengesExpireIn: 10000,
        credentialTypesAvailable: ['EducationDegreeGraduationV1.1'],
        autoCleanPII: false,
      },
    };
    const createServiceResponse = await fetch(
      `${cihUrl}/operator/issuer-services/create`,
      {
        method: 'POST',
        body: JSON.stringify(createServicePayload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPERATOR_API_TOKEN}`,
        },
      }
    );
    expect(createServiceResponse.status).toEqual(200);
    const createServiceJson = await createServiceResponse.json();
    expect(createServiceJson).toEqual({
      service: expectedEntity(createServicePayload.service),
      requestId: expect.any(String),
    });
    const { service } = createServiceJson;
    console.dir({ msg: 'Issuer service created', service });

    // Depot Creation
    const createDepotPayload = {
      tenantId: tenant.id,
      serviceId: service.id,
      depot: { userReference: 'ABC123' },
    };
    const createDepotResponse = await fetch(
      `${cihUrl}/operator/depots/create`,
      {
        method: 'POST',
        body: JSON.stringify(createDepotPayload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPERATOR_API_TOKEN}`,
        },
      }
    );
    expect(createDepotResponse.status).toEqual(200);
    const createDepotJson = await createDepotResponse.json();
    expect(createDepotJson).toEqual({
      depot: expectedEntity(createDepotPayload.depot, {
        serviceId: createDepotPayload.serviceId,
      }),
      requestId: expect.any(String),
    });
    const { depot } = createDepotJson;
    console.dir({ msg: 'Depot created', depot });

    // Credential Creation
    const createCredentialPayload = {
      tenantId: tenant.id,
      depotId: depot.id,
      credential: {
        credentialReference: 'cred1',
        content: {
          type: [EDUCATION_DEGREE_CREDENTIAL_TYPE],
          credentialSubject: sampleEducationDegreeGraduation(
            createFullOrganizationResponse
          ),
        },
      },
    };
    const createCredentialResponse = await fetch(
      `${cihUrl}/operator/credentials/create`,
      {
        method: 'POST',
        body: JSON.stringify(createCredentialPayload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPERATOR_API_TOKEN}`,
        },
      }
    );
    expect(createCredentialResponse.status).toEqual(200);
    const createCredentialJson = await createCredentialResponse.json();
    expect(createCredentialJson).toEqual({
      credential: expectedEntity(createCredentialPayload.credential, {
        depotId: depot.id,
        'content.credentialSubject.alignment[0].type': 'AlignmentObject',
        'content.credentialSubject.institution.type': 'Organization',
        'content.credentialSubject.institution.place.type': 'Place',
        'content.credentialSubject.school.type': 'Organization',
        'content.credentialSubject.school.place.type': 'Place',
        'content.credentialSubject.recipient.type': 'PersonName',
        'content.credentialSubject.type': 'EducationDegree',
        contentHash: (expectedCredential) =>
          hashOffer(expectedCredential.content),
      }),
      requestId: expect.any(String),
    });
    const { credential } = createCredentialJson;
    console.dir({
      msg: 'Credential added',
      credential: omit('content', credential),
    });

    // Issue Links Creation
    const issueLinksPayload = {
      tenantId: tenant.id,
      serviceId: service.id,
      depotId: depot.id,
    };
    const issueLinksResponse = await fetch(
      `${cihUrl}/operator/issue-links/refresh`,
      {
        method: 'POST',
        body: JSON.stringify(issueLinksPayload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPERATOR_API_TOKEN}`,
        },
      }
    );
    const issueLinksJson = await issueLinksResponse.json();
    expect(issueLinksJson).toEqual({
      vnProtocolLink: `velocity-network-devnet://issue?${expectedSearchParams(
        tenant,
        service,
        depot,
        issueLinksJson.preauthCode
      )}`,
      redirectUrl: `${cihUrl}/app-redirect?${expectedSearchParams(
        tenant,
        service,
        depot,
        issueLinksJson.preauthCode
      )}&exchange_type=issue`,
      preauthCode: expect.any(String),
      requestId: expect.any(String),
    });
    console.dir({ msg: 'Issue links refreshed', issueLinksJson });

    // Load redirection page
    const redirectUriResponse = await fetch(issueLinksJson.redirectUrl);
    expect(redirectUriResponse.status).toEqual(200);
    console.dir({ msg: 'Landing page fetched' });

    // Get Credential Manifest
    const credentialManifestUrl = new URL(
      issueLinksJson.vnProtocolLink
    ).searchParams.get('request_uri');
    const credentialManifestResponse = await fetch(credentialManifestUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const credentialManifestJson = await credentialManifestResponse.json();
    expect(credentialManifestJson).toEqual({
      issuing_request: expect.any(String),
    });
    const key = find(
      ({ purposes }) => purposes.includes(KeyPurposes.EXCHANGES),
      keys
    );
    const { payload: credentialManifest } = await jwtVerify(
      credentialManifestJson.issuing_request,
      toJwk(key.didDocumentKey.publicKeyMultibase, false)
    );
    expect(credentialManifest).toEqual({
      ...expectedCredentialManifest(profile, tenant, service),
      exp: expect.any(Number),
      iat: expect.any(Number),
      nbf: expect.any(Number),
      iss: tenant.did,
    });
    console.dir({ msg: 'Credential manifest retrieved', credentialManifest });

    const vendorOriginContext = new URL(
      issueLinksJson.vnProtocolLink
    ).searchParams.get('vendorOriginContext');
    // Authenticate Holder
    const authenticateHolderResponse = await fetch(
      credentialManifest.metadata.submit_presentation_uri,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exchange_id: credentialManifest.exchange_id,
          jwt_vp: await generatePreauthCodeAuthJwt(
            depot,
            vendorOriginContext,
            holderDid,
            holderKeyPair
          ),
        }),
      }
    );
    expect(authenticateHolderResponse.status).toEqual(200);
    const authenticateHolderJson = await authenticateHolderResponse.json();
    expect(authenticateHolderJson).toEqual({
      token: expect.any(String),
      exchange: {
        disclosureComplete: true,
        exchangeComplete: false,
        id: credentialManifest.exchange_id,
        type: 'issuer',
      },
    });
    console.dir({ msg: 'Holder authenticated' });

    // Get Offers
    const credentialOffersResponse = await fetch(
      credentialManifest.metadata.check_offers_uri,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${authenticateHolderJson.token}`,
        },
        body: JSON.stringify({
          exchange_id: credentialManifest.exchange_id,
          jwt_vp: await generatePreauthCodeAuthJwt(
            depot,
            issueLinksJson.preauthCode,
            holderDid,
            holderKeyPair
          ),
        }),
      }
    );
    expect(credentialOffersResponse.status).toEqual(200);
    const credentialOffersJson = await credentialOffersResponse.json();
    expect(credentialOffersJson).toEqual({
      challenge: expect.any(String),
      offers: map(
        ({ content, id, contentHash }) => ({
          ...content,
          id,
          hash: contentHash,
          issuer: { id: did },
        }),
        [credential]
      ),
    });
    console.dir({
      msg: 'Offers received',
      offers: credentialOffersJson.offers,
    });

    // Issue Credentials
    const issueCredentialsResponse = await fetch(
      credentialManifest.metadata.finalize_offers_uri,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${authenticateHolderJson.token}`,
        },
        body: JSON.stringify({
          approvedOfferIds: map('id', credentialOffersJson.offers),
          proof: await buildProof(
            cihUrl,
            holderDid,
            holderKeyPair,
            credentialOffersJson.challenge
          ),
        }),
      }
    );

    expect(issueCredentialsResponse.status).toEqual(200);
    const vcs = await issueCredentialsResponse.json();
    const decodedVcs = map(jwtDecode, vcs);
    expect(decodedVcs).toEqual(
      map(
        ({ payload: { vc, jti } }) =>
          jwtVcExpectation({
            tenant,
            issuerService: service,
            credentialId: jti,
            subjectId: holderDid,
            credential: find(
              ({ content }) =>
                isEqual(
                  omit(['id', '@context'], vc.credentialSubject),
                  content.credentialSubject
                ),
              [credential]
            ),
            credentialTypeMetadata: {
              [EDUCATION_DEGREE_CREDENTIAL_TYPE]: {
                schemaUrl:
                  'http://libserver/schemas/education-degree-graduation-v1.1.schema.json',
              },
            },
            credentialSubjectContext: [
              'http://libserver/contexts/layer1-v1.1.jsonld.json',
            ],
          }),
        decodedVcs
      )
    );
    console.dir({ msg: 'VCs issued', vcs });
    const payload = {
      tenantId: tenant.id,
      presentation: await generatePresentationJwt(
        {
          verifiableCredential: vcs,
          issuer: holderDid,
        },
        holderKeyPair.privateKey,
        `${holderDid}#key`
      ),
    };
    const presentationCheckResponse = await fetch(
      `${cihUrl}/operator/presentations/check`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPERATOR_API_TOKEN}`,
        },
      }
    );
    expect(presentationCheckResponse.status).toEqual(200);

    await expect(presentationCheckResponse.json()).resolves.toEqual({
      presentation: jwtDecode(payload.presentation).payload.vp,
      presentationChecks: { UNTAMPERED: CheckResults.PASS },
      credentialCheckResults: map(
        (decodedVc) => ({
          credential: decodedVc.payload.vc,
          credentialChecks: {
            UNTAMPERED: CheckResults.PASS,
            TRUSTED_ISSUER: CheckResults.PASS,
            TRUSTED_HOLDER: CheckResults.PASS,
            UNREVOKED: CheckResults.PASS,
            UNEXPIRED: CheckResults.NOT_APPLICABLE,
          },
        }),
        decodedVcs
      ),
      requestId: expect.any(String),
    });
  }, 30000);
});

const initMintBundle = async () => {
  const { mint } = await initVerificationCoupon(
    {
      privateKey: e2eEnv.ROOT_PRIVATE_KEY,
      contractAddress: e2eEnv.COUPON_CONTRACT_ADDRESS,
      rpcProvider,
    },
    { log: console, traceId: nanoid() }
  );

  return mint;
};

const expectedTenant = (tenant, primaryAccount) => ({
  id: tenant._id ?? expect.stringMatching(OBJECT_ID_FORMAT),
  createdAt: expect.stringMatching(ISO_DATETIME_FORMAT),
  updatedAt: expect.stringMatching(ISO_DATETIME_FORMAT),
  hostUrl: 'http://localhost:13002',
  primaryAccount,
  ...omit(['_id', 'primaryAccount'], tenant),
});

const expectedKeyMetadatas = map((key) => ({
  ...omit(['key', 'didDocumentKey'], key),
  id: expect.stringMatching(OBJECT_ID_FORMAT),
  createdAt: expect.stringMatching(ISO_DATETIME_FORMAT),
  encoding: 'jwk',
}));

const expectedEntity = (payload, overrides) =>
  applyOverrides(
    {
      ...payload,
      id: expect.stringMatching(OBJECT_ID_FORMAT),
      createdAt: expect.stringMatching(ISO_DATETIME_FORMAT),
      updatedAt: expect.stringMatching(ISO_DATETIME_FORMAT),
    },
    overrides
  );

const expectedSearchParams = (tenant, service, depot, preauthCode) => {
  let searchParamsString = `request_uri=${encodeURIComponent(
    cihUrl
  )}%2Fvn-api%2Fr%2F${encodeURIComponent(
    encodeURI(tenant.did)
  )}%2Fget-credential-manifest%3Fid%3D${encodeURIComponent(service.id)}`;
  searchParamsString += `&issuerDid=${encodeURIComponent(tenant.did)}`;
  if (preauthCode != null) {
    searchParamsString += `&vendorOriginContext=${encodeURIComponent(
      `depot:${depot.id}:${preauthCode}`
    )}`;
  }
  return searchParamsString;
};

const expectedCredentialManifest = (
  profile,
  tenant,
  issuerService,
  payload
) => ({
  exchange_id: expect.any(String),
  output_descriptors: map(() => expect.any(Object), payload?.credential_types),
  issuer: {
    id: tenant.did,
  },
  presentation_definition: {
    id: expect.any(String),
    format: {
      jwt_vp: { alg: ['secp256k1'] },
    },
    name: issuerService.description,
    purpose: issuerService.disclosureRequest?.purpose ?? '',
    input_descriptors: map(
      () => expect.any(Object),
      issuerService.disclosureRequest?.types
    ),
    submission_requirements:
      issuerService.disclosureRequest?.types != null
        ? [
            {
              from: 'A',
              min: 1,
              rule: 'all',
            },
          ]
        : [],
    ...issuerService.presentationDefinition,
  },
  metadata: {
    client_name: issuerService.commercialEntity?.name ?? profile.name,
    logo_uri: issuerService.commercialEntity?.logo ?? profile.logo,
    tos_uri: issuerService.termsUrl,
    max_retention_period:
      issuerService.disclosureRequest?.retentionPeriod ?? '',
    progress_uri: `${cihUrl}${vnUrl(tenant)}/get-exchange-progress`,
    submit_presentation_uri: `${cihUrl}${vnUrl(tenant)}/authenticate`,
    check_offers_uri: `${cihUrl}${vnUrl(tenant)}/credential-offers`,
    finalize_offers_uri: `${cihUrl}${vnUrl(tenant)}/issue-credentials`,
  },
});

const buildProof = async (
  url,
  didJwk,
  keyPair,
  challenge,
  { useKid = true, ...payloadOverrides } = {}
) => {
  const options = {
    jwk: keyPair.publicKey,
    alg: keyPair.publicKey.crv === 'P-256' ? 'ES256' : 'ES256K',
  };
  if (useKid) options.kid = `${didJwk}#0`;
  const jwt = await jwtSign(
    applyOverrides(
      {
        aud: url,
        nonce: challenge,
        iss: didJwk,
      },
      payloadOverrides
    ),
    keyPair.privateKey,
    options
  );
  return {
    proof_type: 'jwt',
    jwt,
  };
};

const vnUrl = ({ did }) => `/vn-api/r/${encodeURI(did)}`;

const generatePreauthCodeAuthJwt = (
  depot,
  vendorOriginContext,
  holderDid,
  keyPair
) => {
  const didJwk = getDidUriFromJwk(keyPair.publicKey);
  const options = {
    issuer: didJwk,
    jti: nanoid(),
    kid: `${didJwk}#0`,
  };
  const payload = {
    id: nanoid(),
    issuer: holderDid,
    vp: {
      presentation_submission: {
        id: nanoid(),
        definition_id: nanoid(),
      },
    },
  };
  if (vendorOriginContext != null) {
    payload.vp.vendorOriginContext = vendorOriginContext;
  }
  return generateDocJwt(payload, keyPair.privateKey, options);
};
