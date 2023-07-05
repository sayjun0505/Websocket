import socketio  from "socket.io-client";
import { createContext } from 'react';
export const socket = socketio.io( "http://localhost:7000",{
    extraHeaders: {
      "Access-Control-Allow-Origin": "*",
    }
  });
export const SocketContext = createContext();

// SOCKET_SERVER=  "http://localhost:7000"


