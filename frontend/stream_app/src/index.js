// client/src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { SocketProvider } from './context/SocketContext';
import './App.css';

ReactDOM.render(
  <React.StrictMode>
    <SocketProvider>
      <App />
    </SocketProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
