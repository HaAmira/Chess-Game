// socket.js
import { io } from "socket.io-client";

let playerId = localStorage.getItem("playerId");

if (!playerId) {
  playerId = crypto.randomUUID();
  localStorage.setItem("playerId", playerId);
}

export { playerId };

export const socket = io("http://localhost:3000",{
  autoConnect: false,
});