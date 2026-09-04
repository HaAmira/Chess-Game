import { useEffect, useState } from "react";
import { socket } from '../utils/socket'
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

    // // const [validMove,setValidMove] = useState({});
    const [board,setBoard] = useState(initialBoard);
    // const [updatePawn,setUpdatePawn] = useState(null);
    const [isUpdatePiece,setIsUpdatePiece] = useState(false);
    const [playerColor,setPlayerColor] = useState(null);
    const [gameOver,setGameOver] = useState(false);
    const [gameOverMessage,setGameOverMessage] = useState(null);
    const [from,setFrom] = useState("");
    const [to,setTo] = useState("");

    console.log("fromLocation:- ",from,",",to);

    useEffect(() => { 
        const handleConnect = () => { 
            console.log("✅ Connected to server");
            toast("✅ Connected to server successfully.")
            console.log("Socket ID:", socket.id); 
        }; 
        const handleDisconnect = (reason) => { 
            console.log("❌ Disconnected:", reason); 
        }; 
        const handleGameStart = (data) =>{
            console.log("🎮 Game Started:", data);
            console.log("🎨 My Color:", data.color);

            setPlayerColor(data.color);
            setBoard(data.board);        
        }

        socket.on("connect", handleConnect); 
        socket.on("disconnect", handleDisconnect); // If socket is already connected when component mounts 
        socket.on("gameStart", handleGameStart);

        if (!socket.connected) { 
            socket.connect();
            toast("✅ Socket already connected")
            console.log("✅ Socket already connected"); 
            console.log("Socket ID:", socket.id); 
        } 
        
        return () => { 
            socket.off("connect", handleConnect); 
            socket.off("disconnect", handleDisconnect); 
            socket.off("gameStart", handleGameStart);
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

        const file = String.fromCharCode(97 + col); 
        const rank = 8 - row;
        const position = `${file}${rank}`;
        const clickedPiece = board[row][col];
        console.log( "Clicked:", position, "Piece:", clickedPiece );

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
                console.log("✅ Updating board ");
                setBoard(data.board);

                if(data.gameOver){
                    setGameOver(true);
                    setGameOverMessage(data.message);
                    toast.success(data.message);
                }
            
                setFrom("");
                setTo("");
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
                    return <div key={id} className="size-4 text-2xl text-amber-500 mx-8">{(String.fromCodePoint(97+id))}</div>
                })}
            </div>

            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="">
                    {board.map((row,id)=>{
                        return <div key={id} className="my-12 mr-4 text-2xl">{8-id}</div>
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
                        return <div key={id} className="my-12 mr-4 text-2xl">{8-id}</div>
                    })}
                </div>
            </div>

            <div className="flex justify-center items-center ml-6">
                {board.map((row,id)=>{
                    return <div key={id} className="size-4 text-2xl text-amber-500 mx-8">{(String.fromCodePoint(97+id))}</div>
                })}
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

            <div>
                Socket
            </div>
        </div>
    );
}

export default Socket_con


// import { useEffect, useState } from "react";
// import { socket } from "../utils/socket";
// import Square from "../gameComponents/Square";
// import toast from "react-hot-toast";
// import PawnPromotion from "./PawnPromotion";

// const initialBoard = [
//   ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
//   ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
//   [null, null, null, null, null, null, null, null],
//   [null, null, null, null, null, null, null, null],
//   [null, null, null, null, null, null, null, null],
//   [null, null, null, null, null, null, null, null],
//   ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
//   ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
// ];

// function Socket_con() {
//   const [board, setBoard] = useState(initialBoard);

//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");

//   // Promotion related states
//   const [updatePawn, setUpdatePawn] = useState(null);
//   const [isUpdatePiece, setIsUpdatePiece] = useState(false);

//   // --------------------------------------------------
//   // SOCKET CONNECTION
//   // --------------------------------------------------

//   useEffect(() => {
//     const handleConnect = () => {
//       console.log("✅ Connected to server");
//       console.log("Socket ID:", socket.id);

//       toast.success("Connected to server successfully.");
//     };

//     const handleDisconnect = (reason) => {
//       console.log("❌ Disconnected:", reason);
//     };

//     socket.on("connect", handleConnect);
//     socket.on("disconnect", handleDisconnect);

//     if (socket.connected) {
//       console.log("✅ Socket already connected");
//       console.log("Socket ID:", socket.id);
//     }

//     return () => {
//       socket.off("connect", handleConnect);
//       socket.off("disconnect", handleDisconnect);
//     };
//   }, []);

//   // --------------------------------------------------
//   // RECEIVE MOVE FROM SERVER
//   // --------------------------------------------------

//   useEffect(() => {
//     const handleMoveReply = (data) => {
//       console.log("🔥 MOVE REPLY RECEIVED");
//       console.log("My Socket ID:", socket.id);
//       console.log("Data:", data);

//       if (data.success) {
//         console.log("✅ Updating board");

//         setBoard(data.board);

//         // Reset selection
//         setFrom("");
//         setTo("");

//         // Reset promotion
//         setUpdatePawn(null);
//         setIsUpdatePiece(false);
//       } else {
//         console.log("❌ Move rejected:", data.message);

//         setTo("");
//       }
//     };

//     socket.on("moveReply", handleMoveReply);

//     return () => {
//       socket.off("moveReply", handleMoveReply);
//     };
//   }, []);

//   // --------------------------------------------------
//   // SEND MOVE TO SERVER
//   // --------------------------------------------------

//   const sendMove = (fromPosition, toPosition, promotionPiece = null) => {
//     console.log("📤 Sending move:");
//     console.log("From:", fromPosition);
//     console.log("To:", toPosition);
//     console.log("Promotion:", promotionPiece);

//     socket.emit("move", {
//       from: fromPosition,
//       to: toPosition,
//       updatePawn: promotionPiece,
//     });
//   };

//   // --------------------------------------------------
//   // BOARD CLICK
//   // --------------------------------------------------

//   const handleClickPlace = (col, row) => {
//     if (col > 7 || col < 0 || row > 7 || row < 0) {
//       console.log("❌ Wrong selection");
//       return;
//     }

//     const file = String.fromCharCode(97 + col);
//     const rank = 8 - row;

//     const position = `${file}${rank}`;

//     const clickedPiece = board[row][col];

//     console.log(
//       "Clicked:",
//       position,
//       "Piece:",
//       clickedPiece
//     );

//     // --------------------------------------------------
//     // FIRST CLICK
//     // --------------------------------------------------

//     if (!from) {
//       if (!clickedPiece) {
//         console.log("❌ Please select a piece");
//         return;
//       }

//       setFrom(position);
//       setTo("");

//       console.log("🟢 From:", position);

//       return;
//     }

//     // --------------------------------------------------
//     // SECOND CLICK
//     // --------------------------------------------------

//     if (from) {
//       const fromCol = from.charCodeAt(0) - 97;
//       const fromRow = 8 - Number(from[1]);

//       const fromPiece = board[fromRow][fromCol];

//       if (!fromPiece) {
//         setFrom("");
//         setTo("");
//         return;
//       }

//       const fromPieceColor = fromPiece[0];

//       console.log(
//         "From:",
//         from,
//         "From piece:",
//         fromPiece,
//         "Clicked piece:",
//         clickedPiece
//       );

//       // --------------------------------------------------
//       // CLICKED SAME COLOR PIECE
//       // --------------------------------------------------

//       if (
//         clickedPiece &&
//         clickedPiece[0] === fromPieceColor
//       ) {
//         setFrom(position);
//         setTo("");

//         console.log("🔄 New From:", position);

//         return;
//       }

//       // --------------------------------------------------
//       // PROMOTION CHECK
//       // --------------------------------------------------

//       const isWhitePromotion =
//         fromPieceColor === "w" &&
//         from[1] === "7" &&
//         position[1] === "8";

//       const isBlackPromotion =
//         fromPieceColor === "b" &&
//         from[1] === "2" &&
//         position[1] === "1";

//       const isPromotion =
//         isWhitePromotion || isBlackPromotion;

//       // --------------------------------------------------
//       // PROMOTION MOVE
//       // --------------------------------------------------

//       if (isPromotion) {
//         console.log("🟢 Pawn Promotion");

//         setTo(position);

//         // Open promotion popup
//         setIsUpdatePiece(true);

//         // IMPORTANT:
//         // Don't send move yet.
//         // Wait until user selects Queen/Rook/Bishop/Knight.

//         return;
//       }

//       // --------------------------------------------------
//       // NORMAL MOVE
//       // --------------------------------------------------

//       setTo(position);

//       console.log("🟡 From:", from);
//       console.log("🟡 To:", position);

//       // Send immediately
//       sendMove(from, position);
//     }
//   };

//   // --------------------------------------------------
//   // PROMOTION PIECE SELECTED
//   // --------------------------------------------------

//   const handlePromotionSelect = (piece) => {
//     console.log("🟢 Promotion piece selected:", piece);

//     if (!from || !to) {
//       console.log("❌ Promotion data missing");

//       setIsUpdatePiece(false);
//       return;
//     }

//     // Save selected promotion piece
//     setUpdatePawn(piece);

//     // Close popup
//     setIsUpdatePiece(false);

//     // Send promotion move
//     sendMove(from, to, piece);
//   };

//   // --------------------------------------------------
//   // VALID MOVE
//   // --------------------------------------------------

//   useEffect(() => {
//     if (!from) return;

//     const handlerValidMove = ({
//       success,
//       message,
//       pieceValidMove,
//     }) => {
//       if (success) {
//         console.log(
//           `✅ Valid Move ${from}: ${message}`
//         );

//         console.log(
//           "Possible moves:",
//           pieceValidMove
//         );

//         // IMPORTANT:
//         // Show possible moves
//         if (pieceValidMove) {
//           setBoard(pieceValidMove);
//         }
//       } else {
//         console.log(
//           `❌ Invalid Move: ${message}`
//         );

//         setFrom("");
//         setTo("");
//       }
//     };

//     socket.on(
//       "vaildMoveReply",
//       handlerValidMove
//     );

//     socket.emit("validMove", {
//       from,
//     });

//     return () => {
//       socket.off(
//         "vaildMoveReply",
//         handlerValidMove
//       );
//     };
//   }, [from]);

//   // --------------------------------------------------
//   // DEBUG
//   // --------------------------------------------------

//   console.log("Current board:", board);
//   console.log("From:", from);
//   console.log("To:", to);
//   console.log("Promotion:", updatePawn);

//   // --------------------------------------------------
//   // UI
//   // --------------------------------------------------

//   return (
//     <div className="mt-8">

//       {/* TOP FILE LABELS */}

//       <div className="flex justify-center items-center ml-6">
//         {board.map((row, id) => {
//           return (
//             <div
//               key={id}
//               className="size-4 text-2xl text-amber-500 mx-8"
//             >
//               {String.fromCodePoint(97 + id)}
//             </div>
//           );
//         })}
//       </div>

//       {/* CHESS BOARD */}

//       <div className="flex justify-center items-center min-h-screen bg-gray-900">

//         {/* LEFT RANK LABELS */}

//         <div>
//           {board.map((row, id) => {
//             return (
//               <div
//                 key={id}
//                 className="my-12 mr-4 text-2xl text-white"
//               >
//                 {8 - id}
//               </div>
//             );
//           })}
//         </div>

//         {/* BOARD */}

//         <div className="grid grid-cols-8 border-4 border-gray-700">

//           {board.map((row, rowIdx) =>
//             row.map((piece, pieceIdx) => {

//               return (
//                 <Square
//                   key={`${rowIdx}-${pieceIdx}`}

//                   clickPlace={() =>
//                     handleClickPlace(
//                       pieceIdx,
//                       rowIdx
//                     )
//                   }

//                   rowId={8 - rowIdx}

//                   columId={String.fromCodePoint(
//                     97 + pieceIdx
//                   )}

//                   isDark={
//                     (pieceIdx + rowIdx) % 2 === 0
//                       ? false
//                       : true
//                   }

//                   piece={piece}
//                 />
//               );
//             })
//           )}

//         </div>

//         {/* RIGHT RANK LABELS */}

//         <div className="ml-4">
//           {board.map((row, id) => {
//             return (
//               <div
//                 key={id}
//                 className="my-12 mr-4 text-2xl text-white"
//               >
//                 {8 - id}
//               </div>
//             );
//           })}
//         </div>

//       </div>

//       {/* BOTTOM FILE LABELS */}

//       <div className="flex justify-center items-center ml-6">
//         {board.map((row, id) => {
//           return (
//             <div
//               key={id}
//               className="size-4 text-2xl text-amber-500 mx-8"
//             >
//               {String.fromCodePoint(97 + id)}
//             </div>
//           );
//         })}
//       </div>

//       {/* PAWN PROMOTION */}

//       <PawnPromotion
//         openAddask={isUpdatePiece}
//         onClose={() => {
//           setIsUpdatePiece(false);
//           setTo("");
//         }}
//         piecePromotionData={handlePromotionSelect}
//       />

//       <div>
//         Socket
//       </div>

//     </div>
//   );
// }

// export default Socket_con;