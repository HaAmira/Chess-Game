import { Server } from "socket.io";

export function createSocket(server) {
    return new Server(server, {
        cors: {
            origin: "*"
        }
    });
}