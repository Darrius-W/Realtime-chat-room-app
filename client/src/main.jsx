import React from 'react'
import ReactDOM from 'react-dom/client'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import App from './chatscope-ui-client/App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
