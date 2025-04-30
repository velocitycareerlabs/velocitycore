import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
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

describe('OrganizationRegistrationNumbersField', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the label', () => {
    const { getByLabelText } = render(
      <AdminContext
        dataProvider={testDataProvider({
          getOne: () => Promise.resolve({ data: { id: 1, name: 'foo' } }),
        })}
      >
        <MemoryRouter>
          <Form defaultValues={mockRecord} onSubmit={jest.fn} resource="organizations">
            <OrganizationRegistrationNumbersField
              fieldType={Authorities.DunnAndBradstreet}
              label={authorityOptions[Authorities.DunnAndBradstreet]}
              record={mockRecord}
              type="number"
            />
          </Form>
        </MemoryRouter>
      </AdminContext>,
    );

    expect(getByLabelText(label)).toBeInTheDocument();
  });

  it('renders with the InfoIcon and Label when tooltip prop presents', () => {
    const { getByTestId, getByLabelText } = render(
      <AdminContext dataProvider={testDataProvider()}>
        <MemoryRouter>
          <Form defaultValues={mockRecord} onSubmit={jest.fn}>
            <OrganizationRegistrationNumbersField
              fieldType={Authorities.DunnAndBradstreet}
              label={authorityOptions[Authorities.DunnAndBradstreet]}
              record={mockRecord}
              type="number"
              tooltip="This is a tooltip"
            />
          </Form>
        </MemoryRouter>
      </AdminContext>,
    );

    expect(getByTestId('InfoIcon')).toBeInTheDocument();
    expect(getByLabelText('This is a tooltip')).toBeInTheDocument();
  });

  it('displays correct registration number', () => {
    const { getByLabelText } = render(
      <AdminContext dataProvider={testDataProvider()}>
        <MemoryRouter>
          <Form defaultValues={mockRecord} onSubmit={jest.fn}>
            <OrganizationRegistrationNumbersField
              fieldType={Authorities.NationalAuthority}
              label={authorityOptions[Authorities.NationalAuthority]}
              record={mockRecord}
              type="number"
              isRequired={false}
            />
          </Form>
        </MemoryRouter>
      </AdminContext>,
    );
    const input = getByLabelText(authorityOptions[Authorities.NationalAuthority]);
    expect(input.value).toBe('333');
  });
  it('displays input value as emty string if no registration number was saved', () => {
    const { getByLabelText } = render(
      <AdminContext dataProvider={testDataProvider()}>
        <MemoryRouter>
          <Form defaultValues={mockRecord} onSubmit={jest.fn}>
            <OrganizationRegistrationNumbersField
              fieldType={Authorities.GLEIF}
              label={authorityOptions[Authorities.GLEIF]}
              record={mockRecord}
              type="number"
              isRequired={false}
            />
          </Form>
        </MemoryRouter>
      </AdminContext>,
    );
    const input = getByLabelText(authorityOptions[Authorities.GLEIF]);
    expect(input.value).toBe('');
  });

  it('displays correct registration uri', () => {
    const { getByLabelText } = render(
      <AdminContext dataProvider={testDataProvider()}>
        <MemoryRouter>
          <Form defaultValues={mockRecord} onSubmit={jest.fn}>
            <OrganizationRegistrationNumbersField
              fieldType={Authorities.NationalAuthority}
              label={authorityOptions[Authorities.NationalAuthority]}
              record={mockRecord}
              type="uri"
              isRequired={false}
            />
          </Form>
        </MemoryRouter>
      </AdminContext>,
    );
    const input = getByLabelText(authorityOptions[Authorities.NationalAuthority]);
    expect(input.value).toBe('https://example.com');
  });

  it('updates the registration number when the input changes', () => {
    const { getByLabelText } = render(
      <AdminContext dataProvider={testDataProvider()}>
        <MemoryRouter>
          <Form defaultValues={mockRecord} onSubmit={jest.fn}>
            <OrganizationRegistrationNumbersField
              fieldType={Authorities.DunnAndBradstreet}
              label={authorityOptions[Authorities.DunnAndBradstreet]}
              record={mockRecord}
              type="number"
            />
          </Form>
        </MemoryRouter>
      </AdminContext>,
    );

    const input = getByLabelText(label);
    fireEvent.change(input, { target: { value: '789' } });

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
