import { describe, it } from 'node:test';
import { expect } from 'expect';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AdminContext, Form } from 'react-admin';
import { testDataProvider } from 'ra-core';

import { Authorities, authorityOptions } from '@/constants/messageCodes';
import OrganizationRegistrationNumbersField, {
  registrationNumbersValidation,
} from '../OrganizationRegistrationNumbersField.jsx';

const mockRecord = {
  profile: {
    registrationNumbers: [
      {
        authority: Authorities.DunnAndBradstreet,
        number: '111',
      },
      {
        authority: Authorities.GLEIF,
        number: '',
      },
      {
        authority: Authorities.NationalAuthority,
        number: '333',
        uri: 'https://example.com',
      },
    ],
  },
};

const label = `D-U-N-S${String.fromCodePoint(174)} Number*`;

// eslint-disable-next-line react/prop-types
const Wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe('OrganizationRegistrationNumbersField', () => {
  it('renders the label', (t) => {
    const { getByLabelText } = render(
      <AdminContext
        dataProvider={testDataProvider({
          getOne: () => Promise.resolve({ data: { id: 1, name: 'foo' } }),
        })}
      >
        <Form defaultValues={mockRecord} onSubmit={t.mock.fn()} resource="organizations">
          <OrganizationRegistrationNumbersField
            fieldType={Authorities.DunnAndBradstreet}
            label={authorityOptions[Authorities.DunnAndBradstreet]}
            record={mockRecord}
            type="number"
          />
        </Form>
      </AdminContext>,
      { wrapper: Wrapper },
    );

    expect(getByLabelText(label)).toBeDefined();
  });

  it('renders with the InfoIcon and Label when tooltip prop presents', (t) => {
    const { getByTestId, getByLabelText } = render(
      <AdminContext dataProvider={testDataProvider()}>
        <Form defaultValues={mockRecord} onSubmit={t.mock.fn()}>
          <OrganizationRegistrationNumbersField
            fieldType={Authorities.DunnAndBradstreet}
            label={authorityOptions[Authorities.DunnAndBradstreet]}
            record={mockRecord}
            type="number"
            tooltip="This is a tooltip"
          />
        </Form>
      </AdminContext>,
      { wrapper: Wrapper },
    );

    expect(getByTestId('InfoIcon')).toBeDefined();
    expect(getByLabelText('This is a tooltip')).toBeDefined();
  });

  it('displays correct registration number', (t) => {
    const { getByLabelText } = render(
      <AdminContext dataProvider={testDataProvider()}>
        <Form defaultValues={mockRecord} onSubmit={t.mock.fn()}>
          <OrganizationRegistrationNumbersField
            fieldType={Authorities.NationalAuthority}
            label={authorityOptions[Authorities.NationalAuthority]}
            record={mockRecord}
            type="number"
            isRequired={false}
          />
        </Form>
      </AdminContext>,
      { wrapper: Wrapper },
    );
    const input = getByLabelText(authorityOptions[Authorities.NationalAuthority]);
    expect(input.value).toBe('333');
  });
  it('displays input value as emty string if no registration number was saved', (t) => {
    const { getByLabelText } = render(
      <AdminContext dataProvider={testDataProvider()}>
        <Form defaultValues={mockRecord} onSubmit={t.mock.fn()}>
          <OrganizationRegistrationNumbersField
            fieldType={Authorities.GLEIF}
            label={authorityOptions[Authorities.GLEIF]}
            record={mockRecord}
            type="number"
            isRequired={false}
          />
        </Form>
      </AdminContext>,
      { wrapper: Wrapper },
    );
    const input = getByLabelText(authorityOptions[Authorities.GLEIF]);
    expect(input.value).toBe('');
  });

  it('displays correct registration uri', (t) => {
    const { getByLabelText } = render(
      <AdminContext dataProvider={testDataProvider()}>
        <Form defaultValues={mockRecord} onSubmit={t.mock.fn()}>
          <OrganizationRegistrationNumbersField
            fieldType={Authorities.NationalAuthority}
            label={authorityOptions[Authorities.NationalAuthority]}
            record={mockRecord}
            type="uri"
            isRequired={false}
          />
        </Form>
      </AdminContext>,
      { wrapper: Wrapper },
    );
    const input = getByLabelText(authorityOptions[Authorities.NationalAuthority]);
    expect(input.value).toBe('https://example.com');
  });

  it('updates the registration number when the input changes', async (t) => {
    const { getByLabelText } = render(
      <AdminContext dataProvider={testDataProvider()}>
        <Form defaultValues={mockRecord} onSubmit={t.mock.fn()}>
          <OrganizationRegistrationNumbersField
            fieldType={Authorities.DunnAndBradstreet}
            label={authorityOptions[Authorities.DunnAndBradstreet]}
            record={mockRecord}
            type="number"
          />
        </Form>
      </AdminContext>,
      { wrapper: Wrapper },
    );

    const input = getByLabelText(label);
    await userEvent.clear(input);
    await userEvent.type(input, '789');
    expect(input.value).toBe('789');
  });

  describe('registrationNumbersValidation', () => {
    it('should return "Required" when the field is required and empty', () => {
      const registrationNumbers = [
        { authority: 'LinkedIn', number: '123' },
        { authority: 'NationalAuthority', number: '', uri: '' },
      ];
      const field = 'NationalAuthority';
      const result = registrationNumbersValidation(registrationNumbers, field, 'uri', true);
      expect(result).toBe('Required');
    });

    it('should return "Must be a valid url" when the uri is not valid', () => {
      const registrationNumbers = [
        { authority: 'LinkedIn', number: '123' },
        { authority: 'NationalAuthority', number: '', uri: 'invalid-url' },
      ];
      const field = 'NationalAuthority';
      const type = 'uri';
      const result = registrationNumbersValidation(registrationNumbers, field, type);
      expect(result).toBe('Must be a valid url');
    });

    it('should return "Required" when the uri is missing', () => {
      const registrationNumbers = [
        { authority: 'LinkedIn', number: '123' },
        { authority: 'NationalAuthority', number: '456', uri: '' },
      ];
      const field = 'NationalAuthority';
      const type = 'uri';
      const result = registrationNumbersValidation(registrationNumbers, field, type);
      expect(result).toBe('Required');
    });

    it('should return "Required" when the number is missing', () => {
      const registrationNumbers = [
        { authority: 'LinkedIn', number: '123' },
        { authority: 'NationalAuthority', number: '', uri: 'https://example.com' },
      ];
      const field = 'NationalAuthority';
      const result = registrationNumbersValidation(registrationNumbers, field);
      expect(result).toBe('Required');
    });
  });
});
