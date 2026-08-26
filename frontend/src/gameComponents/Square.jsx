// import React from 'react'
// import { socket } from "../utils/socket";
// import { useState } from "react";
import Piece from "./Piece"

const Square = ({clickPlace,isDark,piece}) => {
  // const handlerClick=()=>{

  //   // const from = columId+rowId;
  //   console.log("Click on Square: ", columId+rowId);
  // }
  let pieces=null;
  if(piece!==null && (piece.length===3 || piece.length===2)){
    const p=piece.slice(0,2);
    pieces=p;
  }

  return (
    <div
        className={`w-20 h-20 relative flex items-center justify-center ${isDark?"bg-gray-600": "bg-amber-500"}`}
        onClick={clickPlace}
    >
        <Piece piece={pieces}/>
        {
          piece!==null && piece[piece.length-1]==='m' && <div className="bg-green-600/50 absolute z-2 w-1/4 h-1/4 rounded-2xl"></div>
        }
        {/* <div className="bg-green-600/50 absolute z-2 w-1/4 h-1/4 rounded-2xl "></div> */}
    </div>
  )
}

export default Square