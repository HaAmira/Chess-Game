import { io } from "socket.io-client";

const getSessionPlayerId = () => {
  let id = sessionStorage.getItem("playerId");

  if (!id) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id =
        "p-" +
        Math.random().toString(36).substring(2, 11) +
        Date.now().toString(36);
    }

    sessionStorage.setItem("playerId", id);
  }

  return id;
};

export const playerId = getSessionPlayerId();

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://chess-game-sive.onrender.com";

console.log("Socket backend:", BACKEND_URL);

export const socket = io(BACKEND_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
});