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
    pieces=piece.slice(0,2);
  }

  return (
    <div
        className={`relative aspect-square w-full flex items-center justify-center select-none cursor-pointer ${isDark?"bg-gray-600": "bg-amber-500"} hover:brightness-110 transition-all duration-100`}
        onClick={clickPlace}
    >
        <Piece piece={pieces}/>
        {
          piece!==null && piece[piece.length-1]==='m' && <div className="absolute z-20 w-[22%] aspect-square rounded-full bg-green-500/70 pointer-events-none"></div>
        }
        {/* <div className="bg-green-600/50 absolute z-2 w-1/4 h-1/4 rounded-2xl "></div> */}
    </div>
  )
}

export default Square



// import wk from "../assets/WhitePiece/wK.png";
// import wkn from "../assets/WhitePiece/wKn.png";
// import wq from "../assets/WhitePiece/wQ.png";
// import wb from "../assets/WhitePiece/wB.png";
// import wr from "../assets/WhitePiece/wR.png";
// import wp from "../assets/WhitePiece/wP.png";
// import bk from "../assets/BlackPiece/bk.png";
// import bkn from "../assets/BlackPiece/bkn.png";
// import bq from "../assets/BlackPiece/bq.png";
// import bb from "../assets/BlackPiece/bb.png";
// import br from "../assets/BlackPiece/br.png";
// import bp from "../assets/BlackPiece/bp.png";

// const pieces = {
//   wr: wr,
//   wn: wkn,
//   wb: wb,
//   wq: wq,
//   wk: wk,
//   wp: wp,

//   br: br,
//   bn: bkn,
//   bb: bb,
//   bq: bq,
//   bk: bk,
//   bp: br,
// };


// const Piece = ({piece}) => {
//     if(!piece){
//         return null;
//     }
//     const currentPiece = pieces[piece];
//   return (
//     <Typography
//       sx={{
//         fontSize: "42px",
//         userSelect: "none",
//         padding: 2,
//         // textSize: "4px",
//       }}
//       className='text-center cursor-pointer relative z-1'
//     >
//       {/* {pieces[piece]} */}
//       {piece === "wk" ? (
//         <img
//           src={currentPiece}
//           alt="White King"
//           className="w-12 h-12 object-contain"
//         />
//       ) : (
//         currentPiece
//       )}
//     </Typography>
//   )
// }