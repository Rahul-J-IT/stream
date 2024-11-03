// client/src/context/SocketContext.js

import React, { createContext } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socket = io('http://localhost:5000'); // Update with your server URL

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
