import { after, describe, it, mock } from 'node:test';
import { expect } from 'expect';
import { render, fireEvent } from '@testing-library/react';
import OrganizationAuthorityRadioGroup from '../OrganizationAuthorityRadioGroup.jsx';

const label = `D-U-N-S${String.fromCodePoint(174)} Number`;
const handleAuthorityChange = mock.fn();

describe('OrganizationAuthorityRadioGroup', () => {
  after(() => {
    mock.restoreAll();
  });
  it('should render three radio buttons with correct labels', () => {
    const { getAllByRole, getByLabelText, getByText } = render(
      <OrganizationAuthorityRadioGroup
        authority="DunnAndBradstreet"
        handleAuthorityChange={handleAuthorityChange}
      />,
    );
    const radioButtons = getAllByRole('radio');
    expect(radioButtons.length).toBe(3);
    expect(getByLabelText('LEI')).toBeDefined();
    expect(getByLabelText(label)).toBeDefined();
    expect(getByText('Local Country Registration ID')).toBeDefined();
    expect(getByText('For example, your EIN in the United States')).toBeDefined();
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
    expect(handleAuthorityChange.mock.calls[0].arguments).toEqual([expect.any(Object), 'GLEIF']);
  });
});
