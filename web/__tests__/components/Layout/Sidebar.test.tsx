import React from 'react';
import { render } from '@testing-library/react';
import Sidebar from '../../../src/components/Layout/Sidebar';

test('renders Sidebar component', () => {
  const { getByText } = render(<Sidebar />);
  const linkElement = getByText(/sidebar/i);
  expect(linkElement).toBeInTheDocument();
});