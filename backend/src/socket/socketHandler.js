import { registerGameSocket } from "./gameSocket.js";
import { registerMoveSocket } from "./moveSocket.js";

export function socketHandler(io){
    io.on("connection", (socket) => {

        console.log("User connected:", socket.id);

        registerGameSocket(io, socket);
        registerMoveSocket(io, socket);

    });
}