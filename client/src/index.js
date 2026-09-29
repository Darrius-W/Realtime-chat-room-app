// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './chatscope-ui-client/index.css';

// Import new UI sandbox layout
import App from './chatscope-ui-client/App.jsx';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

reportWebVitals();
