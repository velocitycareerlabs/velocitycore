import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App.tsx';

test('renders learn react link', () => {
  render(<App />);
  const element = screen.getByText(/Sample App/i);
  expect(element).toBeDefined();
});
