import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './i18n';
import registerServiceWorker from './serviceWorkerRegistration';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Notifications } from 'react-push-notification';

const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Notifications />
    {!window.env.production && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
  </QueryClientProvider>,
  document.getElementById('root'),
);

registerServiceWorker();
