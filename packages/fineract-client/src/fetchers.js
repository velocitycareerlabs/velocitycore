/**
 * Copyright 2023 Velocity Team
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
 */

const {
  map,
  random,
  first,
  forEach,
  padCharsStart,
  isNumber,
  isDate,
} = require('lodash/fp');
const newError = require('http-errors');

const { formatAsDate } = require('@velocitycareerlabs/common-functions');

const { getPaginatedResponse } = require('./get-paginated-response');

const accountTypeSavings = 2;

const {
  initBuildBatchTransferCreditsPayload,
  initBuildBatchCreateClientPayload,
  initBuildBatchCreateCreditsAccountPayload,
  initBuildBatchBurnVouchersPayload,
  buildCreateClientPayload,
  buildCreateCreditsAccountPayload,
} = require('./payloads');

const batchOperations = async (
  {
    transfers = [],
    clientsToCreate = [],
    creditAccountsToCreate = [],
    clientVoucherBurns = [],
    transactionalBatch = true,
  },
  { fineractFetch }
) => {
  const batchId = random(0, Number.MAX_SAFE_INTEGER);
  const buildBatchTransferCreditsPayload = initBuildBatchTransferCreditsPayload(
    { requestId: batchId }
  );
  const buildBatchCreateClientPayload = initBuildBatchCreateClientPayload({
    requestId: batchId,
  });
  const buildBatchCreateCreditsAccountPayload =
    initBuildBatchCreateCreditsAccountPayload({
      requestId: batchId,
    });

  const buildBatchBurnVouchersPayload = initBuildBatchBurnVouchersPayload({
    requestId: batchId,
  });

  const batchedTransfers = map(buildBatchTransferCreditsPayload, transfers);
  const batchedClientsToCreate = map(
    buildBatchCreateClientPayload,
    clientsToCreate
  );

  const batchedCreditAccountsToCreate = map(
    buildBatchCreateCreditsAccountPayload,
    creditAccountsToCreate
  );

  const batchedClientBurnVouchers = map(
    buildBatchBurnVouchersPayload,
    clientVoucherBurns
  );

  const queryParams = new URLSearchParams();
  if (transactionalBatch) {
    queryParams.set('enclosingTransaction', 'true');
  }
  const response = await fineractFetch
    .post(`fineract-provider/api/v1/batches?${queryParams}`, {
      json: [
        ...batchedTransfers,
        ...batchedClientsToCreate,
        ...batchedCreditAccountsToCreate,
        ...batchedClientBurnVouchers,
      ],
    })
    .json();
  if (transactionalBatch && firstStatusCode(response) >= 400) {
    throw newError(firstStatusCode(response), first(response).body);
  }
  return map((responseItem) => {
    return {
      ...responseItem,
      ...handleBatchResponseItemBody(responseItem),
    };
  }, response);
};

const firstStatusCode = (response) => first(response).statusCode;

const handleBatchResponseItemBody = (responseItem) => {
  try {
    const parsedBody = JSON.parse(responseItem.body);
    if (responseItem.statusCode >= 400) {
      return {
        body: parsedBody,
      };
    }
    return {
      body: {
        ...parsedBody,
        clientId: `${parsedBody.clientId}`,
        savingsId: parsedBody.savingsId ? `${parsedBody.savingsId}` : undefined,
      },
    };
  } catch (e) {
    return {
      body: { message: responseItem.body },
    };
  }
};

const batchTransferCredits = async ({ transfers }, { fineractFetch }) => {
  return batchOperations({ transfers }, { fineractFetch });
};

const createClient = async (
  { fullName, mobileNumber, externalId, activationDate, submittedOnDate },
  { fineractFetch }
) => {
  const payload = buildCreateClientPayload({
    fullName,
    mobileNumber,
    externalId,
    activationDate,
    submittedOnDate,
  });
  const { clientId } = await fineractFetch
    .post('fineract-provider/api/v1/clients', {
      json: payload,
    })
    .json();
  return { clientId: `${clientId}` };
};

const createCreditsAccount = async (
  { clientId, externalId, submittedOnDate, productId, autoApproveAndActivate },
  { fineractFetch }
) => {
  const payload = buildCreateCreditsAccountPayload({
    clientId,
    externalId,
    submittedOnDate,
    productId,
    autoApproveAndActivate,
  });
  const { savingsId } = await fineractFetch
    .post('fineract-provider/api/v1/savingsaccounts', {
      json: payload,
    })
    .json();
  return { tokenAccountId: `${savingsId}` };
};

const createVouchers = async (
  { quantity, clientId, expiry, bundleId },
  { fineractFetch }
) => {
  const payload = {
    couponBundleId: bundleId,
    symbol: 'VVO',
    quantity: `${quantity}`,
    used: '0',
    locale: 'en',
    dateFormat: 'yyyy-MM-dd',
    expiry: formatAsDate(expiry),
  };
  return fineractFetch
    .post(
      `fineract-provider/api/v1/datatables/Voucher/${clientId}?genericResultSet=true`,
      {
        json: payload,
      }
    )
    .json();
};

const getClientVoucherBalance = async ({ clientId }, { fineractFetch }) => {
  const response = await fineractFetch
    .get(`fineract-provider/api/v1/vouchers/${clientId}/balance`)
    .json();
  return {
    ...response,
    clientId: `${clientId}`,
  };
};

const getCreditsAccount = async ({ accountId }, { fineractFetch }) => {
  return fineractFetch
    .get(
      `fineract-provider/api/v1/savingsaccounts/${accountId}?associations=all`
    )
    .json();
};

const getCreditsAccountTransactions = async (
  {
    accountId,
    fromDate,
    toDate,
    pageNumber,
    pageSize,
    transfersOnly,
    descriptions,
  },
  { fineractFetch }
) => {
  const searchParams = new URLSearchParams();
  searchParams.set('dateFormat', 'yyyy-MM-dd');
  searchParams.set('locale', 'en');

  if (isDate(fromDate)) {
    searchParams.set('fromDate', formatAsDate(fromDate));
  }
  if (isDate(toDate)) {
    searchParams.set('toDate', formatAsDate(toDate));
  }
  if (isNumber(pageNumber)) {
    searchParams.set('pageNumber', pageNumber);
  }
  if (isNumber(pageSize)) {
    searchParams.set('pageSize', pageSize);
  }
  if (transfersOnly === true) {
    searchParams.set('transfersOnly', transfersOnly);
  }
  forEach(
    (description) => searchParams.append('description', description),
    descriptions
  );

  const response = await fineractFetch
    .get(
      `fineract-provider/api/v1/savingsaccounts/${accountId}/transactions?${searchParams.toString()}`
    )
    .json();
  return {
    ...response,
    ...getPaginatedResponse({
      pageNumber,
      pageSize,
      totalFilteredRecords: response?.totalFilteredRecords,
    }),
  };
};

const transferCredits = async (
  { fromAccount, toAccount, amount, description },
  { fineractFetch }
) => {
  const now = new Date();
  const payload = {
    fromAccountId: Number(fromAccount),
    fromAccountType: accountTypeSavings,
    fromOfficeId: 1,
    toOfficeId: 1,
    toAccountType: accountTypeSavings,
    toAccountId: Number(toAccount),
    transferAmount: `${amount}`,
    transferDate: formatAsDate(now),
    dateFormat: 'yyyy-MM-dd',
    transferDescription: description,
    locale: 'en',
  };
  await fineractFetch
    .post('fineract-provider/api/v1/accounttransfers', {
      json: payload,
    })
    .json();
  return {};
};

const padCharsDate = (value) => padCharsStart('0', 2, value);

const mapVoucher = ({ expiry, ...voucher }) => ({
  ...voucher,
  expiry: `${expiry[0]}-${padCharsDate(expiry[1])}-${padCharsDate(expiry[2])}`,
});

const getVouchers = async ({ clientId }, { fineractFetch }) => {
  const response = await fineractFetch
    .get(`fineract-provider/api/v1/datatables/Voucher/${clientId}`)
    .json();

  return map(mapVoucher, response);
};

const getExpiringVouchers = async ({ clientId, days }, { fineractFetch }) =>
  fineractFetch
    .get(`fineract-provider/api/v1/vouchers/${clientId}/expiring/${days}`)
    .json();

module.exports = {
  batchOperations,
  batchTransferCredits,
  createClient,
  createCreditsAccount,
  createVouchers,
  getClientVoucherBalance,
  getCreditsAccount,
  getCreditsAccountTransactions,
  transferCredits,
  getExpiringVouchers,
  getVouchers,
};
