import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// eslint-disable-next-line no-unused-vars
import OrganizationAuthorityRadioGroup from '../OrganizationAuthorityRadioGroup.jsx';

const label = `D-U-N-S${String.fromCodePoint(174)} Number`;

describe('OrganizationAuthorityRadioGroup', () => {
  const handleAuthorityChange = jest.fn();

  it('should render three radio buttons with correct labels', () => {
    const { getAllByRole, getByLabelText, getByText } = render(
      <OrganizationAuthorityRadioGroup
        authority="DunnAndBradstreet"
        handleAuthorityChange={handleAuthorityChange}
      />,
    );
    const radioButtons = getAllByRole('radio');
    expect(radioButtons.length).toBe(3);
    expect(getByLabelText('LEI')).toBeInTheDocument();
    expect(getByLabelText(label)).toBeInTheDocument();
    expect(getByText('Local Country Registration ID')).toBeInTheDocument();
    expect(getByText('For example, your EIN in the United States')).toBeInTheDocument();
  });

  it('should show one radio button pre-selected', () => {
    const { getByLabelText } = render(
      <OrganizationAuthorityRadioGroup
        authority="DunnAndBradstreet"
        handleAuthorityChange={handleAuthorityChange}
      />,
    );
    const duncRadioButton = getByLabelText(label);
    const gleifRadioButton = getByLabelText('LEI');
    expect(duncRadioButton.checked).toEqual(true);
    expect(gleifRadioButton.checked).toEqual(false);
  });

  it('should call handleAuthorityChange when a radio button is clicked', () => {
    const { getByLabelText } = render(
      <OrganizationAuthorityRadioGroup
        authority="DunnAndBradstreet"
        handleAuthorityChange={handleAuthorityChange}
      />,
    );
    const gleifRadioButton = getByLabelText('LEI');
    fireEvent.click(gleifRadioButton);
    expect(handleAuthorityChange).toHaveBeenCalledWith(expect.any(Object), 'GLEIF');
  });
});
