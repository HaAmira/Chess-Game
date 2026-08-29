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


import { useEffect, useState } from "react";
import { socket } from '../utils/socket'
import Square from "../gameComponents/Square";
const initialBoard = [ ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"], ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"], ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"], ];


function Socket_con() {

    // // const [validMove,setValidMove] = useState({});
    const [board,setBoard] = useState([
      ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
      ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
      ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
    ]);

    // sonst

    const [from,setFrom] = useState("");
    const [to,setTo] = useState("");

    useEffect(() => { 
        const handleConnect = () => { 
            console.log("✅ Connected to server"); 
            console.log("Socket ID:", socket.id); 
        }; 
        const handleDisconnect = (reason) => { 
            console.log("❌ Disconnected:", reason); 
        }; 
        socket.on("connect", handleConnect); 
        socket.on("disconnect", handleDisconnect); // If socket is already connected when component mounts 
        if (socket.connected) { 
            console.log("✅ Socket already connected"); 
            console.log("Socket ID:", socket.id); 
        } 
        
        return () => { 
            socket.off("connect", handleConnect); 
            socket.off("disconnect", handleDisconnect); 
        }; 
    }, []);



    // const [from,setFrom] = useState("");
    // const [to,setTo] = useState("");
    console.log("fromLocation:- ",from,",",to);
    
    const handleClickPlace = (col,row) =>{
        if(col>7 || col<0 || row>7 || row<0){
            console.log(" wrong Selection: fornt end side");
            alert("wrong Selection");
            return;
        }

        const file = String.fromCharCode(97 + col); 
        const rank = 8 - row;
        const position = `${file}${rank}`;
        const clickedPiece = board[row][col];
        console.log( "Clicked:", position, "Piece:", clickedPiece );

        if(!from){
            if(!clickedPiece){
                console.log("❌ Please select a piece"); 
                return;
            }
            setFrom(position); 
            setTo("");
            console.log("🟢 From:", position); 
            return;
        }
        else if(from){
            const fromCol = from.charCodeAt(0) - 97;
            const fromRow = 8-Number(from[1]);
            const fromPiece = board[fromRow][fromCol];

            const fromPieceColor = fromPiece[0];

            console.log("from:- ",clickedPiece," | ",from,",",fromRow,",",fromCol,":- ",board[fromRow][fromCol],",",fromPieceColor);

            if(clickedPiece && clickedPiece[0]===fromPieceColor){
                setFrom(position);
                setTo("");
                console.log("🔄 New From:", position); 
                return;
            }
            else{
                setTo(position);
            }
            console.log("🟡 From:", from); 
            console.log("🟡 To:", position);
        }
    }

    useEffect(() => {
        console.log("In UseEffect:- ",from,",",to);

        if (!from || !to) return;

        const handleMoveReply = ({ success, message, board }) => {
            if (success) {
                console.log(`✅ Valid Move: ${message}`);
                setFrom("");
                setTo("");
            } else {
                console.log(`❌ Invalid Move: ${message}`);
                setTo("");
            }
            console.log("handleMoveReply Board: ",board);
            setBoard(board);
        };
        socket.on("moveReply",handleMoveReply);
        socket.emit("move", {
            from,
            to,
            board
        });

        return () => {
            socket.off("moveReply",handleMoveReply);
        };
    }, [to]);

    useEffect(()=>{
        console.log(from,",");  
        if(!from) return;        
        const handlerValidMove = ({ success, message, pieceValidMove }) => {
            if(success){
                console.log(`✅ Valid Move ${from}: ${message}`)
                console.log("handlerValidMove:- ",pieceValidMove);
                if(pieceValidMove){
                    setBoard(pieceValidMove);
                }
            }
            else{
                console.log(`❌ Invalid Move: ${message}`);
                setFrom("");
                setTo("");
            }
        }
        // if(from){
            socket.emit("validMove",{
                from,
                board
            });
            socket.on("vaildMoveReply",handlerValidMove);
        // }
        return () => {
            socket.off("vaildMoveReply",handlerValidMove);
        };
        // }
    },[from]);

    console.log("sockectBoard:- ",board);
    

    return (
        <div className="mt-8">
            {/* <ChessBoard
                newBorad={board}
            /> */}
            {/* <div className="bg-amber-700">
                {
                    board.map((row,rowId)=>(
                        row.map((p,pId)=>{
                            return <div key={pId+rowId}>{p}</div>
                        })
                    ))
                }
            </div> */}
            <div className="flex justify-center items-center ml-6">
                {board.map((row,id)=>{
                    return <div className="size-4 text-2xl text-amber-500 mx-8">{(String.fromCodePoint(97+id))}</div>
                })}
            </div>

            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="">
                    {board.map((row,id)=>{
                        return <div className="my-12 mr-4 text-2xl">{8-id}</div>
                    })}
                </div>
                <div className="grid grid-cols-8 border-4 border-gray-700">
                    {board.map((row,rowIdx)=>(
                        row.map((piece,pieceIdx)=>{
                            return <Square
                                clickPlace={()=>handleClickPlace(pieceIdx,rowIdx)}
                                rowId={8-rowIdx}
                                columId={(String.fromCodePoint(97+pieceIdx))}
                                key={`${rowIdx}-${pieceIdx}`}
                                isDark={(pieceIdx+rowIdx)%2==0?false:true}
                                piece={piece}
                            />
                        })
                    ))
                    }
                </div>
                <div className="ml-4">
                    {board.map((row,id)=>{
                        return <div className="my-12 mr-4 text-2xl">{8-id}</div>
                    })}
                </div>
            </div>

            <div className="flex justify-center items-center ml-6">
                {board.map((row,id)=>{
                    return <div className="size-4 text-2xl text-amber-500 mx-8">{(String.fromCodePoint(97+id))}</div>
                })}
            </div>

            <div>
                Socket
            </div>
        </div>
    );
}

export default Socket_con