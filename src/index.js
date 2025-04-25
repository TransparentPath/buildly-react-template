// Importing React core library
import React from 'react';
// Importing ReactDOM for rendering the React application to the DOM
import ReactDOM from 'react-dom';
// Root App component which serves as the entry point of the application
import App from './App';
// Registers a service worker for offline support and caching
import registerServiceWorker from './serviceWorkerRegistration';
// Importing React Query core client and provider for data fetching and caching
import { QueryClient, QueryClientProvider } from 'react-query';
// Developer tools for inspecting React Query queries in development mode
import { ReactQueryDevtools } from 'react-query/devtools';
// Creating a new instance of QueryClient which handles cache, retries, and deduplication
const queryClient = new QueryClient();

/**
 * Rendering the application to the root HTML element.
 * The application is wrapped with QueryClientProvider to give access
 * to the React Query context for all components inside the app.
 */
ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    {/* Main application component */}
    <App />
    {/* React Query DevTools for development only — helps debug query states */}
    {!window.env.production && (
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    )}
  </QueryClientProvider>,
  // Mounts the React app inside the HTML element with id="root"
  document.getElementById('root'),
);

// Register the service worker to enable offline functionality and caching
registerServiceWorker();
