import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

/**
 * React entry point for Sanjog Matrimonial Homepage
 * Mounts the React application into the #root DOM element.
 */
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
