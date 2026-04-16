import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Success from './Success';
import Cancel from './Cancel';
import './styles.css';

function Router() {
  const path = window.location.pathname;

  if (path === '/success') {
    return <Success />;
  }

  if (path === '/cancel') {
    return <Cancel />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
import ChatWidget from './ChatWidget';