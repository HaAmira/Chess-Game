// import React, { useEffect } from 'react'
// import { socket } from '../utils/socket'

// const Socket_con = () => {

//     useEffect(()=>{
//         socket.on('connect',()=>{
//             console.log('connected to server', socket.id);
//             socket.emit("move", "gta");
//         })
//         // socket.emit("move",'gta')
//         return () => {
//             socket.off("connect");
//             socket.disconnect();
//         };
//     },[socket])

//   return (
//     <div>Socket_con</div>
//   )
// }

// export default Socket_con


import { useEffect } from "react";
import { socket } from '../utils/socket'
import ChessBoard from "../gameComponents/ChessBoard";


function Socket_con() {

    useEffect(() => {
        socket.on("connect", () => {
            console.log(socket.id);
            console.log(socket.data);
        });
        // console.log("socketData:- ",socket.data);

        socket.emit("move", {
            from: 'd7',
            to: 'd5'
        });

        const handleMoveReply = ({ success, message, board }) => {
            if (success) {
              console.log(`✅ Valid Move: ${message}`);
            } else {
                console.log(`❌ Invalid Move: ${message}`);
            }
            console.log("handleMoveReply Board: ",board);
        };

        socket.on("moveReply",handleMoveReply);

        return () => {
            socket.off("connect");
            socket.off("moveReply",handleMoveReply);
        };
    }, [socket]);
    

    return (
        <div>
            <ChessBoard/>
        </div>
    );
}

export default Socket_con