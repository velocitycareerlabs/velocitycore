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
  credentialSubjectNotExpired,
} = require('@velocitycareerlabs/sample-data');
const {
  getExpirationDateFromCredential,
} = require('../src/get-expiration-date-from-credential');

describe('get expiration date from credential', () => {
  it('Should return correct expiration date', async () => {
    const expirationDate = getExpirationDateFromCredential({
      credentialSubject: credentialSubjectNotExpired,
      expirationDate: '2014-03-26',
      validUntil: '2013-02-25',
    });

    const outOfSubject = {
      expirationDate: '2014-03-26',
      validUntil: '2013-02-25',
    };

    expect(expirationDate).toEqual(
      credentialSubjectNotExpired.validity.validUntil
    );

    expect(getExpirationDateFromCredential(outOfSubject)).toEqual(
      outOfSubject.expirationDate
    );

    expect(
      getExpirationDateFromCredential({ validUntil: '2012-11-12' })
    ).toEqual('2012-11-12');

    expect(getExpirationDateFromCredential({})).toEqual(undefined);
  });
});
