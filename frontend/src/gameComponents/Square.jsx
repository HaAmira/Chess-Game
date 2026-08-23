// import React from 'react'
import { socket } from "../utils/socket";
import Piece from "./Piece"

const Square = ({rowId,columId,isDark,piece}) => {
  const handlerClick=()=>{

    // const from = columId+rowId;
    console.log("Click on Square: ", columId+rowId);

    // socket.emit("validMove",{
    //   from
    // });

    // const handlerValidMove = ({ success, message, pieceValidMove }) => {
    //   if(success){
    //     console.log(`✅ Valid Move ${from}: ${message}`)
    //     console.log(pieceValidMove);
    //   }
    //   else{
    //     console.log(`❌ Invalid Move: ${message}`);
    //   }
    // }

    // socket.on("vaildMoveReply",handlerValidMove);
  }
  return (
    <div
        className={`w-20 h-20 ${isDark?"bg-gray-600": "bg-amber-500"}`}
        onClick={handlerClick}
    >
        <Piece piece={piece}/>
        {
          piece=="vm" && <div className="bg-black">vm</div>
        }
    </div>
  )
}

export default Square