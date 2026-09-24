import { useEffect, useState } from "react";
import { socket,playerId } from '../utils/socket'
import Square from "../gameComponents/Square";
import toast from 'react-hot-toast';
import PawnPromotion from "./PawnPromotion";
import GameOver from "./GameOver";

const initialBoard = [
      ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
      ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
      ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
    ];


function Socket_con() {

    const [board,setBoard] = useState(initialBoard);
    const [isUpdatePiece,setIsUpdatePiece] = useState(false);
    const [playerColor,setPlayerColor] = useState(null);
    const [gameOver,setGameOver] = useState(false);
    const [gameOverMessage,setGameOverMessage] = useState(null);
    const [from,setFrom] = useState("");
    const [to,setTo] = useState("");

    // const [roomCount, setRoomCount] = useState(0);
    console.log("Enter in game function");

    console.log("fromLocation:- ",from,",",to, ":- ", playerColor);

    useEffect(() => {

        const handleConnect = () => {
            console.log("Connected to server");
            toast("✅ Connected to server successfully.")
            console.log("Socket ID:", socket.id); 
            console.log("Socket: ", socket);

            socket.emit("joinGame", {
                playerId
            });
        };

        const handleGameStart = (data) => {
            console.log("Game Started:", data);
            console.log("My Color:", data.color);

            setPlayerColor(data.color);
            setBoard(data.board);

            localStorage.setItem("roomId", data.roomId);
        };

        const handleGameResume = (data) => {
            console.log("Game Resumed:", data);

            setPlayerColor(data.color);
            setBoard(data.board);

            localStorage.setItem("roomId", data.roomId);
        };

        socket.on("connect", handleConnect);
        socket.on("gameStart", handleGameStart);
        socket.on("gameResume", handleGameResume);

        socket.connect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("gameStart", handleGameStart);
            socket.off("gameResume", handleGameResume);
        };

    }, []);

    console.log("fromLocation:- ",from,",",to);

    const handlerNewGame = () =>{
        console.log("🟢 New Game started");
        setBoard(initialBoard);
        setFrom("");
        setTo("");
        setGameOver(false);
        setGameOverMessage(null);
    }


    const sendMove = (from,to,piece=null)=>{
        console.log("📤 Sending move:");
        console.log("From send:", from);
        console.log("To send:", to);
        console.log("Promotion send:", piece);

        socket.emit("move", {
          from: from,
          to: to,
          updatePawn: piece,
        });
    }

    const handlePromotionSelect =  (piece) =>{
        console.log("🟢 Promotion piece selected:", piece);

        if (!from || !to) {
          console.log("❌ Promotion data missing");
          setIsUpdatePiece(false);
          return;
        }

        setIsUpdatePiece(false);
        sendMove(from, to, piece);
    }

    
    const handleClickPlace = (col,row) =>{
        if(col>7 || col<0 || row>7 || row<0){
            console.log(" wrong Selection: fornt end side");
            alert("wrong Selection");
            return;
        }

        console.log(`handleClickPlace:- ${col}, ${row}, ${from}, ${to} :- ${playerColor}`)

        const file = String.fromCharCode(97 + col); 
        const rank = 8 - row;
        const position = `${file}${rank}`;
        const clickedPiece = board[row][col];
        console.log( `Clicked: ${position}| Piece: ${clickedPiece}` );

        // if(!from){
        //     if(!clickedPiece){
        //         console.log("❌ Please select a piece"); 
        //         return;
        //     }
        //     setFrom(position); 
        //     setTo("");
        //     console.log("🟢 From:", position); 
        //     return;
        // }
        if(!from){
            if(!clickedPiece){
                console.log("❌ Please select a piece"); 
                return;
            }
        
            if(clickedPiece[0] !== playerColor){
                console.log("❌ You cannot select opponent's piece");
                toast.error("You can only move your own pieces");
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

            if (!fromPiece) {
                setFrom("");
                setTo("");
                return;
            }

            const fromPieceColor = fromPiece[0];

            console.log("from:- ",clickedPiece," | ",from,",",fromRow,",",fromCol,":- ",board[fromRow][fromCol],",",fromPieceColor);

            if(clickedPiece && clickedPiece[0]===fromPieceColor){
                setFrom(position);
                setTo("");
                console.log("🔄 New From:", position); 
                return;
            }
            const whitePawnPromotion = fromPieceColor==='w' && from[1]==='7' && position[1]==='8';
            const blackPawnPromotion = fromPieceColor==='b' && from[1]==='2' && position[1]==='1';
            const promotionPiece = whitePawnPromotion || blackPawnPromotion;
            if(promotionPiece){
                setTo(position);
                setIsUpdatePiece(true);
                return ;
            }

            setTo(position);
            console.log("🟡 From:", from); 
            console.log("🟡 To:", to);
            console.log("🟡 position:", position); 
            sendMove(from,position);
        }
    }

    useEffect(() => {

        const handleMoveReply = (data) => {
            console.log("🔥🔥 MOVE REPLY RECEIVED 🔥🔥");
            console.log("My Socket ID:", socket.id);
            console.log("Data:", data);

            if (data.success) {
                // if(data.gameOver){
                //     const winner = from[0]==='w'?'Black':'White';
                //     console.log("✅ Game Over",winner,"wins!");
                //     toast.success(`Game Over! ${winner} wins!`);
                //     setBoard(initialBoard);
                // }
                // else{
                //     console.log("✅ Updating board");
                //     setBoard(data.board);
                // }
                // setFrom("");
                // setTo("");
                console.log("✅ Updating board ", data);
                setBoard(data.board);

                if(data.gameOver){
                    setGameOver(true);
                    setGameOverMessage(data.message);
                    toast.success(data.message);
                }
            
                setFrom("");
                setTo("");
                setPlayerColor(data.turn);
                // setUpdatePawn(null);
            } else {
                console.log("❌ Move rejected:", data.message);
                setTo("");
            }
        };

        socket.on("moveReply", handleMoveReply);

        return () => {
            socket.off("moveReply", handleMoveReply);
        };

    }, []);

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
        socket.on("vaildMoveReply",handlerValidMove);
        // if(from){
        socket.emit("validMove",{
            from,
            // board
        });
        // }
        return () => {
            socket.off("vaildMoveReply",handlerValidMove);
        };
        // }
    },[from]);

    console.log("sockectBoard:- ",board);
    console.log("From:", from);
    console.log("To:", to);
    // console.log("Promotion:", updatePawn);
    

    return (
        <div className="mt-8">
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="w-full max-w-[620px] bg-gray-700/70 border-gray-700 p-6 rounded-2xl border-3 aspect-square grid grid-cols-8">
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
            </div>

            <PawnPromotion
                openComponent={isUpdatePiece}
                onClose={()=> setIsUpdatePiece(false)}
                piecePromotionData={(piece)=> handlePromotionSelect(piece)}
            />
            <GameOver
                openComponent={gameOver}
                onClose={()=> handlerNewGame()}
                message={gameOverMessage}
            />
            {/* <GameOver/> */}
        </div>
    );
}

export default Socket_con