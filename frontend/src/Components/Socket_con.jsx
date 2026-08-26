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


function Socket_con() {

    // const [validMove,setValidMove] = useState({});
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

    const [from,setFrom] = useState("");
    const [to,setTo] = useState("");
    console.log("fromLocation:- ",from,",",to);

    const handleClickPlace = (col,row) =>{
        if(col>7 || col<0 || row>7 || row<0){
            console.log(" wrong Selection: fornt end side");
            alert("wrong Selection");
        }
        let a=String.fromCharCode('a'.charCodeAt(0) + col);
        let b=8-row;
        let pos = a+b;
        // const pieceColor = board[row][col][0];
        // if(!from){
            setFrom(pos);
        // }
        // let fromRow = from.charCodeAt(0) - 97;
        // let fromCol = 8-Number(from[1]);
        // let fromPieceColor = board[fromRow][fromCol];
        // if(from && (board[row][col]===null || pieceColor!==fromPieceColor)){
        //     setTo(pos);
        // }
        // else if(from && pieceColor===fromPieceColor){
        //     setFrom(pos);
        // }
        // setFrom(pos);
        console.log("handleClickPlace:- ",col,",",row," | ",a,",",b,":- ",pos);
    }

    useEffect(() => {
        console.log("In UseEffect")
        socket.on("connect", () => {
            console.log(socket.id);
            console.log(socket.data);
        });
        // console.log("socketData:- ",socket.data);

        // socket.emit("move", {
        //     from: 'g2',
        //     to: 'g3',
        //     board
        // });
        // const handleMoveReply = ({ success, message, board }) => {
        //     if (success) {
        //         console.log(`✅ Valid Move: ${message}`);
        //         setFrom("");
        //     } else {
        //         console.log(`❌ Invalid Move: ${message}`);
        //     }
        //     console.log("handleMoveReply Board: ",board);
        //     setBoard(board);
        // };
        // socket.on("moveReply",handleMoveReply);

        // socket.emit("move", {
        //     from: 'g2',
        //     to: 'c6',
        //     board
        // });
        // const handleMoveReply = ({ success, message, board }) => {
        //     if (success) {
        //         setFrom("");
        //       console.log(`✅ Valid Move: ${message}`);
        //     } else {
        //         console.log(`❌ Invalid Move: ${message}`);
        //     }
        //     console.log("handleMoveReply Board: ",board);
        //     setBoard(board);
        // };
        // socket.on("moveReply",handleMoveReply);

        // socket.emit("move", {
        //     from: 'b7',
        //     to: 'c6',
        //     board
        // });
        // const handleMoveReply = ({ success, message, board }) => {
        //     if (success) {
        //         setFrom("");
        //       console.log(`✅ Valid Move: ${message}`);
        //     } else {
        //         console.log(`❌ Invalid Move: ${message}`);
        //     }
        //     console.log("handleMoveReply Board: ",board);
        //     setBoard(board);
        // };
        // socket.on("moveReply",handleMoveReply);

        return () => {
            socket.off("connect");
            // socket.off("moveReply",handleMoveReply);
            // socket.off("vaildMoveReply",handlerValidMove);
        };
    }, [socket]);

    useEffect(()=>{
            console.log(from,",");          
            const handlerValidMove = ({ success, message, pieceValidMove }) => {
                if(success){
                    console.log(`✅ Valid Move ${from}: ${message}`)
                    console.log("handlerValidMove:- ",pieceValidMove);
                    setBoard(pieceValidMove);
                }
                else{
                    console.log(`❌ Invalid Move: ${message}`);
                }
            }
            if(from){
                socket.emit("validMove",{
                    from: from,
                    board:  board
                });

                socket.on("vaildMoveReply",handlerValidMove);
            }
            return () => {
                // socket.off("connect");
                // socket.off("moveReply",handleMoveReply);
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