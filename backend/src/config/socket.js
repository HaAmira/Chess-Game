import { Server } from "socket.io";

export function createSocket(server) {
    return new Server(server, {
        cors: {
            // credentials : true,
            origin : process.env.FRONTEND_URL
        }
    });
}