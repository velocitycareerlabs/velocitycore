import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminContext } from 'react-admin';
import { Auth0Provider } from '@auth0/auth0-react';
import Router from 'react-router-dom';
import OrganizationShow from '../OrganizationShow';
import * as utils from '../../../utils';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const mockRecord = {
  id: 1,
  profile: {
    name: 'Organization name',
    location: {
      countryCode: 'US',
    },
  },
};

const basicLables = [
  'Organization’s Legal Name',
  'Organization’s Website',
  'Organization’s Address',
  'Organization’s Country',
  'Organization’s LinkedIn Page',
  'LinkedIn Company Page ID',
  'Support Email',
  'Technical Contact Email',
  `D-U-N-S${String.fromCodePoint(174)} Number`,
  'LEI',
  'Local Country Registration ID',
  'Short Description of the Organization',
  'DID',
  'Registrar Access Token',
];

const hints = [
  // eslint-disable-next-line max-len
  'To retrieve your LinkedIn Company ID, visit your company page on LinkedIn as an admin, and copy the number from the URL. For example, if your company page URL is https://www.linkedin.com/company/1234567/admin/, the ID is 1234567',
  // eslint-disable-next-line max-len
  'A decentralized identifiers (DID) is a type of identifier that enables verifiable, decentralized digital identity. A DID in The Velocity Network refers to an organization.',
];

describe('OrganizationShow', () => {
  beforeEach(() => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ id: '1234' });
    jest.spyOn(utils, 'copyTextToClipboard').mockReturnValue({ id: '1234' });
  });
  test('dispay Loading while isLoading=true', async () => {
    await act(async () =>
      render(
        <Auth0Provider>
          <AdminContext
            dataProvider={{
              getOne: () => Promise.resolve({ data: {}, isLoading: true }),
            }}
          >
            <OrganizationShow />
          </AdminContext>
        </Auth0Provider>,
      ),
    );
    const title = screen.queryByText('Organization profile');
    expect(title).not.toBeInTheDocument();
    const loader = screen.queryByRole('progressbar');
    expect(loader).toBeInTheDocument();
  });
  test('dispay screen with title and action', async () => {
    await act(async () =>
      render(
        <Auth0Provider>
          <AdminContext
            dataProvider={{
              getOne: () => Promise.resolve({ data: mockRecord, isLoading: false }),
            }}
          >
            <OrganizationShow />
          </AdminContext>
        </Auth0Provider>,
      ),
    );
    const title = screen.getByText('Organization profile');
    const editButton = screen.getByRole('button', { name: 'Edit Profile' });
    expect(title).toBeInTheDocument();
    expect(editButton).toBeInTheDocument();
  });
  test('dispay correct list of basic labales', async () => {
    await act(async () =>
      render(
        <Auth0Provider>
          <AdminContext
            dataProvider={{
              getOne: () => Promise.resolve({ data: mockRecord, isLoading: false }),
            }}
          >
            <OrganizationShow />
          </AdminContext>
        </Auth0Provider>,
      ),
    );
    basicLables.forEach((item) => {
      const label = screen.getByText(item);
      expect(label).toBeInTheDocument();
    });
  });
  test('dispay correct list of hints', async () => {
    await act(async () =>
      render(
        <Auth0Provider>
          <AdminContext
            dataProvider={{
              getOne: () => Promise.resolve({ data: mockRecord, isLoading: false }),
            }}
          >
            <OrganizationShow />
          </AdminContext>
        </Auth0Provider>,
      ),
    );
    hints.forEach((item) => {
      const label = screen.getByLabelText(item);
      expect(label).toBeInTheDocument();
    });
  });

  test('not dispay commercial section when no commercial names provided', async () => {
    await act(async () =>
      render(
        <Auth0Provider>
          <AdminContext
            dataProvider={{
              getOne: () => Promise.resolve({ data: mockRecord, isLoading: false }),
            }}
          >
            <OrganizationShow />
          </AdminContext>
        </Auth0Provider>,
      ),
    );
    const label = screen.queryByText('COMMERCIAL NAMES');
    expect(label).not.toBeInTheDocument();
  });
  test('dispay commercial section when commercial names provided', async () => {
    const mockRecordWithCommercials = {
      id: 1,
      profile: {
        name: 'Organization name',
        location: {
          countryCode: 'US',
        },
        commercialEntities: [{ name: 'Commercial Name', logo: 'https://logo.com', type: 'Brand' }],
      },
    };
    await act(async () =>
      render(
        <Auth0Provider>
          <AdminContext
            dataProvider={{
              getOne: () => Promise.resolve({ data: mockRecordWithCommercials, isLoading: false }),
            }}
          >
            <OrganizationShow />
          </AdminContext>
        </Auth0Provider>,
      ),
    );
    const label = screen.queryByText('Commercial Names');
    await waitFor(() => expect(label).toBeInTheDocument());
  });
  test('title of Copy button changes to Copied on click', async () => {
    const writeText = jest.fn();

    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });
    navigator.clipboard.writeText.mockResolvedValue('123');
    await act(async () =>
      render(
        <Auth0Provider>
          <AdminContext
            dataProvider={{
              getOne: () => Promise.resolve({ data: mockRecord, isLoading: false }),
            }}
          >
            <OrganizationShow />
          </AdminContext>
        </Auth0Provider>,
      ),
    );
    const copyButton = screen.getByRole('button', { name: 'COPY' });
    expect(copyButton).toBeInTheDocument();
    fireEvent.click(copyButton);
    screen.findByRole('button', { name: 'COPIED' });
    expect(screen.findByRole('button', { name: 'COPY' })).toMatchObject({});
  });
});
