// eslint-disable-next-line import/no-extraneous-dependencies
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { render } from '@testing-library/react';
import IndividualsEdit from '../../individuals/IndividualsEdit';

const queryClient = new QueryClient();

// Todo: investigate how to cover with tests UI of react-admin
describe('IndividualsEdit', () => {
  it('renders the component without errors', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/edit/:id" element={<IndividualsEdit />} />
          </Routes>
        </Router>
      </QueryClientProvider>,
    );
  });
});
