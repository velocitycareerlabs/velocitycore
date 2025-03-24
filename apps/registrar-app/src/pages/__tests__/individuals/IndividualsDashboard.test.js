// eslint-disable-next-line import/no-extraneous-dependencies
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import IndividualsDashboard from '../../individuals/IndividualsDashboard';

const queryClient = new QueryClient();

// Todo: investigate how to cover with tests UI of react-admin
describe('IndividualsDashboard', () => {
  it('renders the component without errors', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <IndividualsDashboard />
        </Router>
      </QueryClientProvider>,
    );
  });
});
