import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

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

const createBoard = () => {
  return initialBoard.map((row) => [...row]);
};

let games = {};
let waitingPlayer=null;
let roomCounter = 1;

const kingPosition=(board,a)=>{
  let name = `${a}k`
  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      if(board[i][j]===name){
        return {i,j};
      }
    }
  }
  return null;
}

const getOpponentColor=(color)=>{
  return color === "w"?"b":"w";
}

const checkOutKing=(board,i,j,a)=>{
    const f = i;
    const l = j;

    const piece = board[f][l];

    let t='w';

    if(a==='w'){
      t='b';
    }

    console.log("Black and White Queen");

    let p=`${t}p`;
    let r=`${t}r`;
    let n=`${t}n`;
    let b=`${t}b`;
    let q=`${t}q`;
    let k=`${t}k`;

// =================================================================

//Pawn check------------------------------------------
    if(a==='b'){
      if(f+1<8 && l+1<8 && (board[f+1][l+1]===p)){
        console.log("King is not save by pawn");
        return false;
      }
      else if(f+1<7 && l-1>=0 && (board[f+1][l-1]===p)){
        console.log("King is not save by pawn");
        return false;
      }
    }
    else if(a==='w'){
      if(f-1>=0 && l+1<8 && (board[f-1][l+1]===p)){
        console.log("King is not save by pawn");
        return false;
      }
      else if(f-1>=1 && l-1>=0 && (board[f-1][l-1]===p)){
        console.log("King is not save by pawn");
        return false;
      }
    }

//Rook check-----------------------------
    //Vertical Down 

    for(let x=f+1; x<8; x++){
      if(board[x][l]===r || board[x][l]===q){
        console.log("King is not save by rook or queen");
        return false;
      }
      else if(board[x][l]!==null){
        break;
      }
    }

    //vertical Up
    for(let x=f-1; x>=0; x--){
      if(board[x][l]===r || board[x][l]===q){
        console.log("King is not save by rook or queen");
        return false;
      }
      else if(board[x][l]!==null){
        break;
      }
    }

    //Horizontal Right 
    for(let x=l+1; x<8; x++){
      if(board[f][x]===r || board[f][x]===q){
        console.log("King is not save by rook or queen");
        return false;
      }
      else if(board[f][x]!==null){
        break;
      }
    }

    //Horizontal left
    for(let x=l-1; x>=0; x--){
      if(board[f][x]===r || board[f][x]===q){
        console.log("King is not save by rook or queen");
        return false;
      }
      else if(board[f][x]!==null){
        break;
      }
    }


//Knight check-----------------------------
    const knightMoves = [
      [f + 2, l + 1],
      [f + 2, l - 1],
      [f - 2, l + 1],
      [f - 2, l - 1],
      [f + 1, l + 2],
      [f + 1, l - 2],
      [f - 1, l + 2],
      [f - 1, l - 2],
    ];

    for(const [x,y] of knightMoves){
      if(x<0 || x>=8 || y<0 || y>=8){
        continue;
      }
      else{
        if(board[x][y]===n){
          console.log("King is not save by knight");
          return false;
        }
      }
    }

//Bishop check-----------------------------
    let x=f+1;
    let y=l+1;

    //Down + Right
    while(x<8 && y<8){
      if(board[x][y]===b || board[x][y]===q){
        console.log("King is not save by Bishop or Queen");
        return false;
      }
      else if(board[x][y]!==null){
        break;
      }
      x++;
      y++;
    }

    x=f+1;
    y=l-1;

    //Down + Left
    while(x<8 && y>=0){
      if(board[x][y]===b || board[x][y]===q){
        console.log("King is not save by Bishop or Queen");
        return false;
      }
      else if(board[x][y]!==null){
        break;
      }
      x++;
      y--;
    }

    x=f-1;
    y=l+1;

    //Up + Right
    while(x>=0 && y<8){
      if(board[x][y]===b || board[x][y]===q){
        console.log("King is not save by Bishop or Queen");
        return false;
      }
      else if(board[x][y]!==null){
        break;
      }
      x--;
      y++;
    }

    x=f-1;
    y=l-1;

    //Up + Left
    while(x>=0 && y>=0){
      if(board[x][y]===b || board[x][y]===q){
        console.log("King is not save by Bishop or Queen");
        return false;
      }
      else if(board[x][y]!==null){
        break;
      }
      x--;
      y--;
    }

//King check-----------------------------
    const kingMoves = [
      [f+1,l],
      [f-1,l],
      [f,l+1],
      [f,l-1],
      [f-1,l-1],
      [f-1,l+1],
      [f+1,l+1],
      [f+1,l-1],
    ]

    for(const [x,y] of kingMoves){
      if(x<0 || x>=8 || y<0 || y>=8){
        continue;
      }
      else{
        if(board[x][y]===k){
          console.log("King is not save by King");
          return false;
        }
      }
    }
 

// ============================================================

    console.log("King is Save");

    return true;
}

const generatePawnMoves=(board, i, j, color)=>{
  const moves = [];
  if(color==='b'){
    // if(i==2){
      if(i+1<8 && j+1<8 && board[i+1][j+1]!==null && board[i+1][j+1][0]!==color){
        moves.push([i+1,j+1]);
      }
      if(i+1<8 && j-1>=0 && board[i+1][j-1]!==null && board[i+1][j-1][0]!==color){
        moves.push([i+1,j-1]);
      }
      if(i+1<8 && board[i+1][j]===null){
        moves.push([i+1,j]);
        if(i==1 && board[i+2][j]===null){
          moves.push([i+2,j]);
        }
      }
    // }
    // else{
    //   if(i-1>=0 && j+1<8 && board[i-1][j+1]!==null && board[i-1][j+1][0]!==color){
    //     moves.push([i-1,j+1]);
    //   }
    //   if(i-1>=0 && j-1>=0 && board[i-1][j-1]!==null && board[i-1][j-1][0]!==color){
    //     moves.push([i-1,j-1]);
    //   }
    //   if(i-1>=0 && board[i-1][j]===null){
    //     moves.push([i-1,j]);
    //   }
    // }
  }
  if(color==='w'){
    // if(i==7){
      if(i-1>=0 && j-1>=0 && board[i-1][j-1]!==null && board[i-1][j-1][0]!==color){
        moves.push([i-1,j-1]);
      }
      if(i-1>=0 && j+1<8 && board[i-1][j+1]!==null && board[i-1][j+1][0]!==color){
        moves.push([i-1,j+1]);
      }
      if(i-1>=0 && board[i-1][j]===null){
        moves.push([i-1,j]);
        if(i==6 && board[i-2][j]===null){
          moves.push([i-2,j]);
        }
      }
    // }
    // else{
    //   if(i+1<8 && j+1<8 && board[i+1][j+1]!==null && board[i+1][j+1][0]!==color){
    //     moves.push([i+1,j+1]);
    //   }
    //   if(i+1<8 && j-1>=0 && board[i+1][j-1]!==null && board[i+1][j-1][0]!==color){
    //     moves.push([i+1,j-1]);
    //   }
    //   if(i+1<8 && board[i+1][j]===null){
    //     moves.push([i+1,j]);
    //   }
    // }
  }
  console.log("validMoves: Pawn",moves);
  return moves;
}

const generateRookMoves=(board,i,j,color)=>{
  const moves = [];

  //Down Move
  for(let x=i+1; x<8; x++){
    if(board[x][j]===null){
      moves.push([x,j]);
    }
    else if(board[x][j][0]!==color){
      moves.push([x,j]);
      break;
    }
    else if(board[x][j][0]===color){
      break;
    }
  }

  //Up Move
  for(let x=i-1; x>=0; x--){
    if(board[x][j]===null){
      moves.push([x,j]);
    }
    else if(board[x][j][0]!==color){
      moves.push([x,j]);
      break;
    }
    else if(board[x][j][0]===color){
      break;
    }
  }

  //Right Move
  for(let y=j+1; y<8; y++){
    if(board[i][y]===null){
      moves.push([i,y]);
    }
    else if(board[i][y][0]!==color){
      moves.push([i,y]);
      break;
    }
    else if(board[i][y][0]===color){
      break;
    }
  }

  //Left Move
  for(let y=j-1; y>=0; y--){
    if(board[i][y]===null){
      moves.push([i,y]);
    }
    else if(board[i][y][0]!==color){
      moves.push([i,y]);
      break;
    }
    else if(board[i][y][0]===color){
      break;
    }
  }
  return moves;
}

const generateBishopMoves = (board,i,j,color)=>{
  const moves =  [];

  const steps=(x,y)=>{
    if(board[x][y]===null){
      moves.push([x,y]);
      return true;
    }
    else if(board[x][y][0]!==color){
      moves.push([x,y]);
      return false;
    }
    else if(board[x][y][0]===color){
      return false;
    }
  }

  let x=i+1;
  let y=j+1;
  while(x<8 && y<8 && steps(x,y)){
    x++;
    y++;
  }

  x=i-1;
  y=j-1;
  while(x>=0 && y>=0 && steps(x,y)){
    x--;
    y--;
  }

  x=i+1;
  y=j-1;
  while(x<8 && y>=0 && steps(x,y)){
    x++;
    y--;
  }

  x=i-1;
  y=j+1;
  while(x>=0 && y<8 && steps(x,y)){
    x--;
    y++;
  }

  return moves;
}

const generateKnightMoves=(board,i,j,color)=>{
  const moves = [];
  const knightMoves = [
    [i + 2, j + 1],
    [i + 2, j - 1],
    [i - 2, j + 1],
    [i - 2, j - 1],
    [i + 1, j + 2],
    [i + 1, j - 2],
    [i - 1, j + 2],
    [i - 1, j - 2],
  ];

  for (const [x, y] of knightMoves) {
    if (x >= 0 && x < 8 && y >= 0 && y < 8) {
      if (board[x][y] === null || board[x][y][0] !== color) {
        moves.push([x, y]);
      }
    }
  }

  return moves;
}

const generateQueenMoves=(board,i,j,color)=>{
  const rookMoves = generateRookMoves(board,i,j,color);
  const bishopMoves = generateBishopMoves(board,i,j,color);
  return [...rookMoves,...bishopMoves];
}

const generateKingMoves=(board,i,j,color)=>{
  const moves = [];
  const kingMoves = [
    [i+1,j],
    [i-1,j],
    [i,j+1],
    [i,j-1],
    [i+1,j+1],
    [i-1,j-1],
    [i+1,j-1],
    [i-1,j+1]
  ]

  for (const [x, y] of kingMoves) {
    if (x >= 0 && x < 8 && y >= 0 && y < 8) {
      if (board[x][y] === null || board[x][y][0] !== color) {
        moves.push([x, y]);
      }
    }
  }
  return moves;
}

const generateMoves = (board, i, j) => {
  const piece = board[i][j];
  if (!piece) return [];
  const color = piece[0];
  switch (piece[1]) {
      case "p":
          return generatePawnMoves(board, i, j, color);
      case "r":
          return generateRookMoves(board, i, j, color);
      case "n":
          return generateKnightMoves(board, i, j, color);
      case "b":
          return generateBishopMoves(board, i, j, color);
      case "q":
          return generateQueenMoves(board, i, j, color);
      case "k":
          return generateKingMoves(board, i, j, color);
      default:
          return [];
  }
}

// const getLegalMovesForPiece=(board,i,j,color)=>{
//   const pseudoLegalMoves=generateMoves(board,i,j);

//   const legalMoves=[];
//   for(const [toRow,toCol] of pseudoLegalMoves){
//     if(isLegalMove(board))
//   }
// }

const hasAnyLegalMove = (board, color) => {
  for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
          const piece = board[i][j];
          if (!piece || piece[0] !== color) continue;
          const moves = generateMoves(board, i, j);
          for (const [x, y] of moves) {
              const tempBoard = board.map(row => [...row]);
              tempBoard[x][y] = tempBoard[i][j];
              tempBoard[i][j] = null;
              const king = kingPosition(tempBoard, color);
              if (!king) continue;
              if (checkOutKing(tempBoard, king.i, king.j, color)) {
                  return true;
              }
          }
      }
  }
  return false;
}

  // const isCheckOut=()=>{
  //   j
  // }

app.get("/", (req, res) => {
  res.send("Socket Server Running");
});

// let Castling = true;

const castlingAllowed=(board,f,l,ft,lt,color)=>{
  if(color==='w' && !whiteOppenet.data.Castling){
    return false;
  }
  else if(color==='b' && !blackOppenet.data.Castling){
    return false;
  }
  // if(!whiteOppenet.data.Castling || !blackOppenet.data.Castling){
  //   return false;
  // }
  if(checkOutKing(board,f,l,color)){
    return false;
  }
  if(lt<l){
    for(let i=l-1; i>0; i--){
      if(board[f][i]!=null){
        return false;
      }
    }
  }
  else if(lt>l){
    for(let i=l+1; i<7; i++){
      if(board[f][i]!=null){
        return false;
      }
    }
  }
  // if(checkOutKing(board,ft,lt,color)){
  //   return false;
  // }
  return true;
}

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  if(waitingPlayer===null){
    waitingPlayer=socket;
    console.log(`Waiting Player: ${socket.id}`);

    socket.emit("waiting",{
      message: "Waiting for oppenent..."
    })
  }
  else{
    let whiteOppenet = waitingPlayer;
    let blackOppenet = socket;

    let roomId = `room-${roomCounter++}`;

    whiteOppenet.join(roomId);
    blackOppenet.join(roomId);

    whiteOppenet.data.color = 'w';
    blackOppenet.data.color = 'b';

    whiteOppenet.data.roomId = roomId;
    blackOppenet.data.roomId = roomId;

    whiteOppenet.data.Castling=true;
    blackOppenet.data.Castling=true;

    games[roomId]={
      playBoard: createBoard(),
      turn: 'w',
      whitePlayer: whiteOppenet.id,
      blackPlayer: blackOppenet.id,
    }

    console.log("Game Created:", roomId);

    console.log(
      "White:",
      whiteOppenet.id,
      "Black:",
      blackOppenet.id
    );

    whiteOppenet.emit("gameStart",{
      roomId,
      color: 'w',
      board: games[roomId].playBoard,
      turn: games[roomId].turn
    })
    blackOppenet.emit("gameStart",{
      roomId,
      color: 'b',
      board: games[roomId].playBoard,
      turn: games[roomId].turn
    })

    waitingPlayer=null;

  }

  socket.on("move", ({from,to,updatePawn})=>{
    
    const roomId = socket.data.roomId;
    const color = socket.data.color;
    console.log("Move:",socket.id,from,"->",to," :: ",color,",",roomId);
    
    if(!roomId){
      console.log("You are not currently in a games");
      socket.emit("moveReply", {
        success: false,
        message: "You are not currently in a games",
        // socket
      });

      return;
    }

    const game = games[roomId];

    if(!game){
      console.log("Game not found");
      socket.emit("moveReply", {
        success: false,
        message: "Game not found",
      });

      return;
    }
    
    if(game.turn!==color){
      console.log("Not your turn");
      socket.emit("moveReply", {
        success: false,
        message: "Not your turn",
        // socket
      });

      return;
    }


    const board = games[roomId].playBoard;

    
    // let success=false;
    // if(from.length===2 && to.length===2){
      const l = from.charCodeAt(0) - 97;
      const f = 8-Number(from[1]);
      
      const lt = to.charCodeAt(0) - 97;
      const ft = 8-Number(to[1]);
      console.log("ready for search",f,",",l," -- ",ft,",",lt);
      
      if (
        f < 0 || f > 7 ||
        l < 0 || l > 7 ||
        ft < 0 || ft > 7 ||
        lt < 0 || lt > 7
      ) {
        socket.emit("moveReply", {
          success: false,
          message: "Invalid board position",
        });
      
        return;
      }

      const piece = board[f][l];
      const destinationPiece = board[ft][lt];

      for(let i=0; i<board.length; i++){
        console.log(board[i]);
      }

      if(board[f][l]===null){
        socket.emit("moveReply", {
          success: false,
          message: "No piece at selected position",
        });

        return;
      }

      if(piece[0]!==color){
        console.log("You cannot move opponent's piece")
        socket.emit("moveReply", {
          success: false,
          message: "You cannot move opponent's piece",
        });

        return;
      }

      if(destinationPiece!==null && destinationPiece[0]===color){
        socket.emit("moveReply", {
          success: false,
          message: "Your own piece is on destination",
        });

        return;
      }

      // ----------------------------------------------------
      // STEP 1: Piece ka normal movement check
      // ----------------------------------------------------

      if(board[f][l][1]==='k' && Math.abs(l-lt)===2){
        if(castlingAllowed(board,f,l,ft,lt,color)){
          const tempBoard = board.map((row)=>[...row]);
          tempBoard[ft][lt]=tempBoard[f][l];
          tempBoard[f][l]=null;
          if(l>lt){
            tempBoard[f][l-1]=tempBoard[f][0];
            tempBoard[f][0]=null;
          }
          else{
            tempBoard[f][l+1]=tempBoard[f][7];
            tempBoard[f][7]=null;
          }


          // ----------------------------------------------------
          // STEP 5: Check karo ki apna King safe hai ya nahi
          // ----------------------------------------------------

          const myKingSafe = checkOutKing(
            tempBoard,
            ft,
            lt,
            color
          );
        
        
          // Agar move ke baad apna King check me aa raha hai
          if (!myKingSafe) {
            socket.emit("moveReply", {
              success: false,
              from,
              to,
              board,
              kingIsSafe: false,
              opponentKingIssafe: false,
              turn: game.turn,
              gameOver: false,
              checkmate: false,
              stalemate: false,
              message: "You cannot make this move. Your King would be in check.",
            });
          
            return;
          }

          board[ft][lt]=board[f][l];
          board[f][l]=null;
          if(l>lt){
            board[f][l-1]=board[f][0];
            board[f][0]=null;
          }
          else{
            board[f][l+1]=board[f][7];
            board[f][7]=null;
          }
          Castling=false;

        }
        else{
          socket.emit("moveReply", {
            success: false,
            from,
            to,
            board,
            kingIsSafe: false,
            opponentKingIssafe: false,
            turn: game.turn,
            gameOver: false,
            checkmate: false,
            stalemate: false,
            message: "You cannot make this move. Illegal castling.",
          });
        }
      }

      else{
        const moves = generateMoves(board,f,l);

        const success = moves.some(
            ([x,y]) => x===ft && y===lt
        );

        // ----------------------------------------------------
        // STEP 2: Piece ka movement hi invalid hai
        // ----------------------------------------------------

        if (!success) {
          socket.emit("moveReply", {
            success: false,
            from,
            to,
            board,
            kingIsSafe: true,
            opponentKingIssafe: true,
            turn: game.turn,
            gameOver: false,
            checkmate: false,
            stalemate: false,
            message: "Invalid piece movement",
          });
        
          return;
        }


        // ----------------------------------------------------
        // STEP 3: Temporary board banao
        // Real board ko abhi touch nahi karna
        // ----------------------------------------------------

        const tempBoard = board.map((row) => [...row]);


        // proposed move sirf temporary board par
        tempBoard[ft][lt] = tempBoard[f][l];
        tempBoard[f][l] = null;


        // ----------------------------------------------------
        // STEP 4: Apna King find karo AFTER proposed move
        // ----------------------------------------------------

        const myKingPosition = kingPosition(tempBoard, color);

        if (!myKingPosition) {
          socket.emit("moveReply", {
            success: false,
            from,
            to,
            board,
            kingIsSafe: false,
            opponentKingIssafe: false,
            turn: game.turn,
            gameOver: true,
            checkmate: false,
            stalemate: false,
            message: "King not found",
          });
        
          return;
        }


        // ----------------------------------------------------
        // STEP 5: Check karo ki apna King safe hai ya nahi
        // ----------------------------------------------------

        const myKingSafe = checkOutKing(
          tempBoard,
          myKingPosition.i,
          myKingPosition.j,
          color
        );


        // Agar move ke baad apna King check me aa raha hai
        if (!myKingSafe) {
          socket.emit("moveReply", {
            success: false,
            from,
            to,
            board,
            kingIsSafe: false,
            opponentKingIssafe: false,
            turn: game.turn,
            gameOver: false,
            checkmate: false,
            stalemate: false,
            message: "You cannot make this move. Your King would be in check.",
          });
        
          return;
        }


        // ----------------------------------------------------
        // STEP 6: Ab move completely legal hai
        // Isliye REAL BOARD update karo
        // ----------------------------------------------------

        board[ft][lt] = board[f][l];
        board[f][l] = null;
        if(board[ft][lt][1]==='p' && updatePawn){
          const validPromotionPieces = ["q","r","b","n"];
          if(((color==='w' && ft===0) || (color==='b' && ft===7)) && validPromotionPieces.includes(updatePawn)){
            board[ft][lt] = color+updatePawn;
          }
          else{
            board[f][l] = board[ft][lt];
            board[ft][lt] = null;
            socket.emit("moveReply", {
              success: false,
              from,
              to,
              board,
              kingIsSafe: false,
              opponentKingIssafe: false,
              turn: game.turn,
              gameOver: false,
              checkmate: false,
              stalemate: false,
              message: "You cannot make this move. wrong Pawn Promotion.",
            });
          
            return;
          }
        }

        if(board[ft][lt][1]==='k' || board[ft][lt][1]==='r'){
          if(board[ft][lt][0]==='b'){
            blackOppenet.data.Castling=false;
          }
          if(board[ft][lt][0]==='w'){
            whiteOppenet.data.Castling=false;
          }
          // Castling=false;
        }
      }

      // ----------------------------------------------------
      // STEP 7: Opponent color nikalo
      // ----------------------------------------------------

      const opponentColor = color === "w" ? "b" : "w";


      // ----------------------------------------------------
      // STEP 8: Successful move ke baad opponent King find
      // ----------------------------------------------------

      const opponentKingPosition = kingPosition(
        board,
        opponentColor
      );

      if (!opponentKingPosition) {
        socket.emit("moveReply", {
          success: false,
          position,
          newPiece,
          board,
          kingIsSafe: true,
          opponentKingIssafe: true,
          turn: game.turn,
          gameOver: true,
          checkmate: false,
          stalemate: false,
          message: "King not found",
        });
      
        return;
      }

      let opponentInCheck = false;

      if (opponentKingPosition) {
      
        const opponentKingSafe = checkOutKing(
          board,
          opponentKingPosition.i,
          opponentKingPosition.j,
          opponentColor
        );
      
        opponentInCheck = !opponentKingSafe;
      }

      if(!opponentKingPosition){
        io.to(roomId).emit("moveReply",{
          success: true,
          from,
          to,
          board,
          kingIsSafe: true,
          opponentKingIssafe: false,
          turn: game.turn,
          checkmate: true,
          gameOver: true,
          stalemate: false,
          message: "Checkmate! you won the game"
        })
        return ;
      }

      
      // ----------------------------------------------------
      // STEP 9: if opponent in Checkout, 
      // then check, is oppenent has any valid moves left
      // ----------------------------------------------------
      
      let opponentHasValidMoves = false;
      let stalemate = false;

      if(opponentInCheck){
        opponentHasValidMoves = hasAnyLegalMove(board,opponentColor);
      }
      else{
        stalemate = !hasAnyLegalMove(board,opponentColor);
      }

      // if (opponentInCheck) {
      //   checkmate = !hasAnyLegalMove(board, opponentColor);
      // }
      // else {
      //   stalemate = !hasAnyLegalMove(board, opponentColor);
      // }

      // if(checkmate){

      // }

      if(opponentInCheck && !opponentHasValidMoves){
        io.to(roomId).emit("moveReply",{
          success: true,
          from,
          to,
          board,
          kingIsSafe: true,
          opponentKingIssafe: false,
          turn: game.turn,
          checkmate: true,
          gameOver: true,
          stalemate: false,
          message: "Checkmate! you won the game"
        })
        return ;
      }

      if(stalemate){
        io.to(roomId).emit("moveReply",{
          success: true,
          from,
          to,
          board,
          kingIsSafe: true,
          opponentKingIssafe: false,
          turn: game.turn,
          checkmate: opponentInCheck,
          gameOver: true,
          stalemate: true,
          message: "Stalemate! The game is a draw"
        })
        return ;
      }


      // ----------------------------------------------------
      // STEP 10: Turn change
      // ----------------------------------------------------

      game.turn = opponentColor;


      // ----------------------------------------------------
      // STEP 11: Dono players ko result bhejo
      // ----------------------------------------------------

      io.to(roomId).emit("moveReply", {
        success: true,
        from,
        to,
        board,
        kingIsSafe: true,
        opponentKingIssafe: true,
        turn: game.turn,
        checkmate: opponentInCheck,
        stalemate,
        gameOver: false,
        message: "successful move",
      });
      return ;
    // }

  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);

    if(waitingPlayer && waitingPlayer.id===socket.id){
      waitingPlayer=null;
      console.log("waiting palyer removed");
      return;
    }

    const roomId = socket.data.roomId;

    if(!roomId){
      return;
    }

    const game = games[roomId];

    if (!game) {
      return;
    } 

    socket.to(roomId).emit("opponentDisconnected", {
      message: "Opponent disconnected",
    });

    delete games[roomId];

    console.log(
      "Game Deleted:",
      roomId
    );

  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});