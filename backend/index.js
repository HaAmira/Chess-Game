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

const boardChange=(board)=>{
  const tempBoard = board.map(row => [...row]);
  for(let i=0; i<tempBoard.length; i++){
    for(let j=0; j<tempBoard[0].length; j++){
      if(tempBoard[i][j]!==null && tempBoard[i][j].length===3){
        let p=tempBoard[i][j];
        tempBoard[i][j]=p.slice(0,2);
      }
      else if(tempBoard[i][j]!==null && tempBoard[i][j].length===1){
        tempBoard[i][j]=null;
      }
    }
  }
  return tempBoard;
}

const createBoard = () => {
  return initialBoard.map((row) => [...row]);
};

let games = {};
let waitingPlayer=null;
// let whiteOppenet;
// let blackOppenet;
let roomCounter = 1;
let enPassantTarget = null;

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
  console.log("generatePawnMoves:- ",i,",",j,":- ",board[i][j]);
  const moves = [];
  if(color==='b'){
    console.log("validMove: white",board[i][j])
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
      if(enPassantTarget && enPassantTarget.color!==color && enPassantTarget.row===i && Math.abs(enPassantTarget.col-j)===1){
        moves.push([i+1,enPassantTarget.col]);
      }
  }
  if(color==='w'){
    console.log("validMove: white",board[i][j])
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
      if(enPassantTarget && enPassantTarget.color!==color && enPassantTarget.row===i && Math.abs(enPassantTarget.col-j)===1){
        moves.push([i-1,enPassantTarget.col]);
      }
  }
  console.log("validMoves: Pawn",moves);
  return moves;
}

const generateRookMoves=(board,i,j,color)=>{
  console.log("generateRookMoves:- ",i,",",j,":- ",board[i][j]);
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
  console.log("generateBishopMoves:- ",i,",",j,":- ",board[i][j]);
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
  console.log("generateKnightMoves:- ",i,",",j,":- ",board[i][j]);
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
  console.log("generateQueenMoves:- ",i,",",j,":- ",board[i][j]);
  const rookMoves = generateRookMoves(board,i,j,color);
  const bishopMoves = generateBishopMoves(board,i,j,color);
  return [...rookMoves,...bishopMoves];
}

const generateKingMoves=(board,i,j,color)=>{
  console.log("generateKingMoves:- ",i,",",j,":- ",board[i][j]);
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
  console.log("generateMoves:- -------------------",i,",",j,":- ",board[i][j]);
        for(let i=0; i<board.length; i++){
        console.log(board[i]);
      }
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
              console.log("Checking move for piece:",piece,"from",i,j,"to",x,y);
              tempBoard[x][y] = tempBoard[i][j];
              tempBoard[i][j] = null;
              const king = kingPosition(tempBoard, color);
              if (!king) continue;
              if (checkOutKing(tempBoard, king.i, king.j, color)) {
                console.log("Legal move found for piece:",piece,"from",i,j,"to",x,y);
                  return true;
              }
          }
      }
  }
  return false;
}

const moveToSaveKing = (board,ValidMoves,f,l,color)=>{
  console.log("validMove: your king is in check:- ",f,",",l,",",color,",",board[f][l]);
  const updateValidMove=[];
  for(let a=0; a<ValidMoves.length; a++){
    const tempBoard = board.map(row => [...row]);
    const [x,y]=ValidMoves[a];
    console.log("moveToSaveKing validMoves Position:- ",a,"from",f,l,"to",x,y,":- ",tempBoard[x][y],",",tempBoard[f][l]);
    tempBoard[x][y]=tempBoard[f][l];
    tempBoard[f][l]=null;
    const king = kingPosition(tempBoard, color);
    if (!king) continue;
    if (checkOutKing(tempBoard, king.i, king.j, color)) {
      console.log("Legal move found for piece: valid move",tempBoard[x][y],",",tempBoard[f][l],", from:- ",f,",",l,"to:- ",x,",",y);
        // return true;
        updateValidMove.push(ValidMoves[a]);
    }
    // const isKingSafe = checkOutKing(tempBoard,i,j,color);
    // if(isKingSafe){
    //   updateValidMove.push(ValidMoves[a]);
    // }
  }
  return updateValidMove;
}




app.get("/", (req, res) => {
  res.send("Socket Server Running");
});


const castlingAllowed=(board,f,l,ft,lt,color)=>{
  if(color==='w' && !whiteOppenet.data.Castling){
    return false;
  }
  else if(color==='b' && !blackOppenet.data.Castling){
    return false;
  }

  if(!checkOutKing(board,f,l,color)){
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

  return true;
}

io.on("connection", (socket) => {
  // console.log("User Connected:", socket.id);

  // console.log("Socket ID:", socket.id);
  // console.log("Waiting Player:", waitingPlayer ? waitingPlayer.id : null);

  // if(waitingPlayer===null){
  //   waitingPlayer=socket;
  //   console.log(`Waiting Player: ${socket.id}`);

  //   socket.emit("waiting",{
  //     message: "Waiting for oppenent..."
  //   })
  // }
  // else{
  //   whiteOppenet = waitingPlayer;
  //   blackOppenet = socket;

  //   let roomId = `room-${roomCounter++}`;

  //   whiteOppenet.join(roomId);
  //   blackOppenet.join(roomId);

  //   // const count = io.sockets.adapter.rooms.get(roomId)?.size || 0;
  //   // console.log("Room member count:- ",count);
  //   // io.to(roomId).emit('room_count', count);

  //   whiteOppenet.data.color = 'w';
  //   blackOppenet.data.color = 'b';

  //   console.log("========== ROOM CREATED ==========");
  //   console.log("Room ID:", roomId);
  //   console.log("White Socket:", whiteOppenet.id);
  //   console.log("Black Socket:", blackOppenet.id);

  //   console.log(
  //       "Sockets in room:",
  //       io.sockets.adapter.rooms.get(roomId)
  //   );

  //   console.log("==================================");

  //   whiteOppenet.data.roomId = roomId;
  //   blackOppenet.data.roomId = roomId;

  //   whiteOppenet.data.Castling=true;
  //   blackOppenet.data.Castling=true;

  //   games[roomId]={
  //     playBoard: createBoard(),
  //     turn: 'w',
  //     whitePlayer: whiteOppenet.id,
  //     blackPlayer: blackOppenet.id,
  //   }

  //     whiteOppenet.emit("gameStart", {
  //       roomId,
  //       color: 'w',
  //       board: games[roomId].playBoard,
  //       turn: games[roomId].turn
  //     });
  //     blackOppenet.emit("gameStart", {
  //       roomId,
  //       color: 'b',
  //       board: games[roomId].playBoard,
  //       turn: games[roomId].turn
  //     });

  //   console.log("Game Created:", roomId);

  //   console.log(
  //     "White:",
  //     whiteOppenet.id,
  //     "Black:",
  //     blackOppenet.id
  //   );

  //   waitingPlayer=null;

  // }

    console.log("User Connected:", socket.id);

    socket.on("joinGame", ({ playerId }) => {

        console.log("Join Game");
        console.log("Player ID:", playerId);
        console.log("Socket ID:", socket.id);


        // -----------------------------------------
        // 1. CHECK IF PLAYER ALREADY HAS A GAME
        // -----------------------------------------

        let existingRoomId = null;
        let existingGame = null;

        for (const [roomId, game] of Object.entries(games)) {

            if (
                game.whitePlayerId === playerId ||
                game.blackPlayerId === playerId
            ) {
                existingRoomId = roomId;
                existingGame = game;
                break;
            }
        }


        // -----------------------------------------
        // 2. PLAYER IS RECONNECTING
        // -----------------------------------------

        if (existingGame) {

            console.log("♻️ Reconnecting existing game");
            console.log("Room:", existingRoomId);

            let color;

            if (existingGame.whitePlayerId === playerId) {
                color = "w";
                existingGame.whitePlayer = socket.id;
            } 
            else {
                color = "b";
                existingGame.blackPlayer = socket.id;
            }


            // Put new socket into old room
            socket.join(existingRoomId);

            socket.data.playerId = playerId;
            socket.data.roomId = existingRoomId;
            socket.data.color = color;
            socket.data.Castling = true;


            // Send OLD game state
            socket.emit("gameResume", {
                roomId: existingRoomId,
                color: color,
                board: existingGame.playBoard,
                turn: existingGame.turn,
                gameOver: existingGame.gameOver || false
            });


            console.log("✅ Game resumed:", existingRoomId);

            return;
        }


        // -----------------------------------------
        // 3. NEW PLAYER
        // -----------------------------------------

        socket.data.playerId = playerId;


        // -----------------------------------------
        // 4. WAITING FOR OPPONENT
        // -----------------------------------------

        if (waitingPlayer === null) {

            waitingPlayer = socket;

            console.log("⏳ Waiting for opponent:", socket.id);

            socket.emit("waiting", {
                message: "Waiting for opponent..."
            });

            return;
        }


        // -----------------------------------------
        // 5. CREATE NEW GAME
        // -----------------------------------------

        const whitePlayer = waitingPlayer;
        const blackPlayer = socket;

        const roomId = `room-${roomCounter++}`;


        whitePlayer.join(roomId);
        blackPlayer.join(roomId);


        whitePlayer.data.color = "w";
        blackPlayer.data.color = "b";

        whitePlayer.data.roomId = roomId;
        blackPlayer.data.roomId = roomId;

        whitePlayer.data.Castling = true;
        blackPlayer.data.Castling = true;


        // -----------------------------------------
        // 6. SAVE GAME
        // -----------------------------------------

        games[roomId] = {

            playBoard: createBoard(),

            turn: "w",

            whitePlayer: whitePlayer.id,
            blackPlayer: blackPlayer.id,

            // IMPORTANT
            whitePlayerId: whitePlayer.data.playerId,
            blackPlayerId: blackPlayer.data.playerId,

            gameOver: false
        };


        // -----------------------------------------
        // 7. SEND GAME START
        // -----------------------------------------

        whitePlayer.emit("gameStart", {
            roomId,
            color: "w",
            board: games[roomId].playBoard,
            turn: games[roomId].turn
        });


        blackPlayer.emit("gameStart", {
            roomId,
            color: "b",
            board: games[roomId].playBoard,
            turn: games[roomId].turn
        });


        console.log("🎮 Game Created:", roomId);

        waitingPlayer = null;
    });


  // socket.on("move", ({from,to,board,updatePawn})=>{
  socket.on("move", ({from,to,updatePawn})=>{
    console.log("<<<<<------------------>>>",":- ");

    
    const roomId = socket.data.roomId;
    const color = socket.data.color;
    console.log("Move:",socket.id,",",roomId);

    console.log("================================");
    console.log("MOVE RECEIVED");
    console.log("Moving Socket:", socket.id);
    console.log("Room ID:", roomId);

    console.log(
        "Players in this room:",
        io.sockets.adapter.rooms.get(roomId)
    );

    console.log("================================");
    
    if(!roomId){
      console.log("You are not currently in a games");
      socket.emit("moveReply", {
        success: false,
        message: "You are not currently in a games",
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

    const board = game.playBoard;

    const changeBoard = boardChange(board);

    
    const l = from.charCodeAt(0) - 97;
    const f = 8-Number(from[1]);
    
    const lt = to.charCodeAt(0) - 97;
    const ft = 8-Number(to[1]);
    console.log("ready for search",f,",",l," -- ",ft,",",lt);
    
    console.log("moveReply board and changeBoard:- ",board[f][l],",",changeBoard[f][l])
    console.log("moveReply: board:- ",board);
    console.log("moveReply: changeBoard:- ",changeBoard);

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

    const piece = changeBoard[f][l];
    const destinationPiece = changeBoard[ft][lt];

    for(let i=0; i<changeBoard.length; i++){
      console.log(board[i]);
    }

    if(changeBoard[f][l]===null){
      socket.emit("moveReply", {
        success: false,
        message: "No piece at selected position",
        board
      });
      return;
    }

    console.log("Move color: ",socket.id,":- ",from,"->",to," :: ",game.turn,",",color,"!")

    
    if(game.turn!==color){
      console.log("Not your turn ",game.turn,",",color);
      socket.emit("moveReply", {
        success: false,
        message: "Not your turn",
        board
      });
      
      return;
    }
    
    if(piece[0]!==color){
      console.log("You cannot move opponent's piece")
      socket.emit("moveReply", {
        success: false,
        message: "You cannot move opponent's piece",
        board
      });
      return;
    }

      if(destinationPiece!==null && destinationPiece[0]===color){

        socket.emit("moveReply", {
          success: false,
          message: "Your own piece is on destination",
          board
        });

        return;
      }

      // ----------------------------------------------------
      // STEP 1: Piece ka normal movement check
      // ----------------------------------------------------

      if(changeBoard[f][l][1]==='k' && Math.abs(l-lt)===2){
        if(castlingAllowed(changeBoard,f,l,ft,lt,color)){
          const tempBoard = changeBoard.map((row)=>[...row]);
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
              success: false ,
              from,
              to,
              board,
              kingIsSafe: false,
              opponentKingIssafe: true,
              turn: game.turn,
              gameOver: false,
              checkmate: false,
              stalemate: false,
              message: "You cannot make this move. Your King would be in check.",
            });
          
            return;
          }

          changeBoard[ft][lt]=changeBoard[f][l];
          changeBoard[f][l]=null;
          if(l>lt){
            changeBoard[f][l-1]=changeBoard[f][0];
            changeBoard[f][0]=null;
          }
          else{
            changeBoard[f][l+1]=changeBoard[f][7];
            changeBoard[f][7]=null;
          }

          if(changeBoard[ft][lt][0]==='b'){
            blackOppenet.data.Castling=false;
          }
          else if(changeBoard[ft][lt][0]==='w'){
            whiteOppenet.data.Castling=false;
          }
          // Castling=false;

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
        console.log("Not Castling Moves")
        const moves = generateMoves(changeBoard,f,l);

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

        const tempBoard = changeBoard.map((row) => [...row]);


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

        //Check En Passant and perform
        console.log("En passant Target:- ",enPassantTarget,",",changeBoard[f][l],",",changeBoard[ft][lt]);
        if(Math.abs(f-ft)===1 && Math.abs(l-lt)===1 && changeBoard[f][l][1]==='p' && changeBoard[ft][lt]===null && enPassantTarget && changeBoard[f][l][0]!==enPassantTarget.color && enPassantTarget.row===f && enPassantTarget.col===lt){
          changeBoard[enPassantTarget.row][enPassantTarget.col]=null;
        }
        changeBoard[ft][lt] = changeBoard[f][l];
        changeBoard[f][l] = null;
        if(changeBoard[ft][lt][1]==='p' && updatePawn){
          const validPromotionPieces = ["q","r","b","n"];
          if(((color==='w' && ft===0) || (color==='b' && ft===7)) && validPromotionPieces.includes(updatePawn)){
            changeBoard[ft][lt] = color+updatePawn;
          }
          else{
            changeBoard[f][l] = changeBoard[ft][lt];
            changeBoard[ft][lt] = null;
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

        if(changeBoard[ft][lt][1]==='k' || changeBoard[ft][lt][1]==='r'){
          if(changeBoard[ft][lt][0]==='b'){
            blackOppenet.data.Castling=false;
          }
          if(changeBoard[ft][lt][0]==='w'){
            whiteOppenet.data.Castling=false;
          }
        }
      }

      game.playBoard = changeBoard;

      // ----------------------------------------------------
      // STEP 7: Opponent color nikalo
      // ----------------------------------------------------

      const opponentColor = color === "w" ? "b" : "w";


      // ----------------------------------------------------
      // STEP 8: Successful move ke baad opponent King find
      // ----------------------------------------------------

      const opponentKingPosition = kingPosition(
        changeBoard,
        opponentColor
      );

      if (!opponentKingPosition) {
        socket.emit("moveReply", {
          success: false,
          from,
          to,
          // position,
          // newPiece,
          board,
          kingIsSafe: true,
          opponentKingIssafe: false,
          turn: game.turn,
          gameOver: true,
          checkmate: false,
          stalemate: false,
          message: "Opponent King not found",
        });
      
        return;
      }

      let opponentInCheck = false;

      if (opponentKingPosition) {
      
        const opponentKingSafe = checkOutKing(
          changeBoard,
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
          board: changeBoard,
          kingIsSafe: true,
          opponentKingIssafe: false,
          turn: game.turn,
          checkmate: true,
          gameOver: true,
          stalemate: false,
          message: "✅ Game Over! You win! Opponent King not found"
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
        opponentHasValidMoves = hasAnyLegalMove(changeBoard,opponentColor);
      }
      else{
        stalemate = !hasAnyLegalMove(changeBoard,opponentColor);
      }

      console.log("Opponent is in check:- ",opponentInCheck," , Opponent has any valid move:- ",opponentHasValidMoves," , is in stalment:- ", stalemate);
      
      if(opponentInCheck && !opponentHasValidMoves){
        console.log("Reply Game Over with checkmate Opponent is in check:- ",opponentInCheck," , Opponent has any valid move:- ",opponentHasValidMoves," , is in stalment:- ", stalemate);
        io.to(roomId).emit("moveReply",{
          success: true,
          from,
          to,
          board: changeBoard,
          kingIsSafe: true,
          opponentKingIssafe: false,
          turn: game.turn,
          checkmate: true,
          gameOver: true,
          stalemate: false,
          message: `✅ Game Over! ${game.turn === 'w' ? 'White' : 'Black'} wins!`
        })
        return ;
      }

      if(stalemate){
        console.log("Reply Game with stalemate Opponent is in check:- ",opponentInCheck," , Opponent has any valid move:- ",opponentHasValidMoves," , is in stalment:- ", stalemate);
        io.to(roomId).emit("moveReply",{
          success: true,
          from,
          to,
          board: changeBoard,
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

      console.log("📤 BROADCASTING MOVE");
      console.log("Room:", roomId);
      console.log(
          "Room members:",
          io.sockets.adapter.rooms.get(roomId)
      );
      console.log("From:", from);
      console.log("To:", to);
      console.log("Board:", game.playBoard);

      if(Math.abs(ft-f)===2 && l===lt && changeBoard[ft][lt][1]==='p'){
        enPassantTarget = { row: ft, col: lt, color: changeBoard[ft][lt][0] };
      }
      else{
        enPassantTarget = null;
      }


      io.to(roomId).emit("moveReply", {
        success: true,
        from,
        to,
        board: game.playBoard,
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


  //-------------------------------------------------------------------------

  socket.on("validMove", ({from})=>{
    console.log("vaild:  <<<<<------------------>>>  :valid");

    console.log("Move: validMove1",socket.id,":- ");
    
    const roomId = socket.data.roomId;
    const color = socket.data.color;
    
    if(!roomId){
      console.log("You are not currently in a games: validMove");
      socket.emit("vaildMoveReply", {
        success: false,
        message: "You are not currently in a games: validMove",
      });
      
      return;
    }

    const game = games[roomId];

    if(!game){
      console.log("Game not found: validMove");
      socket.emit("vaildMoveReply", {
        success: false,
        message: "Game not found: validMove",
      });

      return;
    }

    const board = game.playBoard;

    const l = from.charCodeAt(0) - 97;
    const f = 8-Number(from[1]);

    if (
      f < 0 || f > 7 ||
      l < 0 || l > 7
    ) {
      socket.emit("vaildMoveReply", {
        success: false,
        message: "Invalid board position: validMove",
        board
      });
    
      return;
    }

    console.log("ValidMoves ready for search",f,",",l,);

    // const board = games[roomId].playBoard;
    const changeBoard = boardChange(board);

    console.log("ValidMoves board and changeBoard:- ",board[f][l],",",changeBoard[f][l])
    console.log("ValidMoves: board:- ",board);
    console.log("ValidMoves: changeBoard:- ",changeBoard);


    if(changeBoard[f][l]===null){
      socket.emit("vaildMoveReply", {
        success: false,
        message: "No piece at selected position: validMove",
        board
      });
      return;
    }


    console.log("Move: validMove2 ",socket.id," | ",from,"-> :: ",color,",",roomId);
    
    if(game.turn!==color){
      console.log(`Not your turn ${game.turn}, color: ${color}: validMove`);
      socket.emit("vaildMoveReply", {
        success: false,
        message: `Not your turn ${game.turn}, color: ${color}: validMove`,
        board
        // socket
      });

      return;
    }

      const piece = changeBoard[f][l];

      console.log("validMove board---------------")

      for(let i=0; i<board.length; i++){
        console.log(board[i]);
      }

      console.log("validMove changeBoard---------------")

      for(let i=0; i<changeBoard.length; i++){
        console.log(changeBoard[i]);
      }

      if(piece[0]!==color){
        console.log("You cannot move opponent's piece: validMove")
        socket.emit("vaildMoveReply", {
          success: false,
          message: "You cannot move opponent's piece: validMove",
          board
        });

        return;
      }

      const myKingPosition = kingPosition(changeBoard, color);

        if (!myKingPosition) {
          socket.emit("vaildMoveReply", {
            success: false,
            from,
            changeBoard,
            kingIsSafe: true,
            message: "King not found: validMove",
          });
        
          return;
        }

        const pieceValidMove = changeBoard.map(row=>[...row])

        let ValidMoves = generateMoves(pieceValidMove, f, l);
        console.log("Valid Moves Generated:- ",ValidMoves);
        ValidMoves = moveToSaveKing(changeBoard,ValidMoves,f,l,color);
        console.log("validMove: Your King is in check, so you can only make moves that save king: validMove:- ",ValidMoves.length);

        // const myKingSafe = checkOutKing(
        //   changeBoard,
        //   myKingPosition.i,
        //   myKingPosition.j,
        //   color
        // );

        // if(!myKingSafe){
          // ValidMoves = moveToSaveKing(changeBoard,ValidMoves,f,l,color);
          if(ValidMoves.length===0){
            socket.emit("vaildMoveReply", {
              success: false,
              from,
              board,
              kingIsSafe: false,
              message: "You cannot make this move. Your King would be in check: validMove.",
            });
            return;
          }
        // }


        // ----------------------------------------------------
        // STEP 5: Check karo ki apna King safe hai ya nahi
        // ----------------------------------------------------

      //   const myKingSafe = checkOutKing(
      //     changeBoard,
      //     myKingPosition.i,
      //     myKingPosition.j,
      //     color
      //   );

      //   if (!myKingSafe) {
      //     socket.emit("vaildMoveReply", {
      //       success: false,
      //       from,
      //       board,
      //       kingIsSafe: false,
      //       message: "You cannot make this move. Your King would be in check: validMove.",
      //     });
        
      //     return;
      //   }

      // const tempBoard = changeBoard.map(row=>[...row])
      // tempBoard[f][l]=null;
      
      // const myKingSafeMove = checkOutKing(
      //     tempBoard,
      //     myKingPosition.i,
      //     myKingPosition.j,
      //     color
      //   );

      //   if (!myKingSafeMove) {
      //     socket.emit("vaildMoveReply", {
      //       success: false,
      //       from,
      //       board,
      //       kingIsSafe: false,
      //       message: "You cannot make this move. Your King would be in check: validMove.",
      //     });
        
      //     return;
      //   }

        // const pieceValidMove = changeBoard.map(row=>[...row])

        // const ValidMoves = generateMoves(pieceValidMove, f, l);

        console.log("---No change pieceValidMove = board.map: validMove-------");
            
        for(let i=0; i<pieceValidMove.length; i++){
          console.log(pieceValidMove[i]);
        }



        console.log("---ValidMoves = generateMoves: validMove-------",ValidMoves.length);
          
        for(let i=0; i<ValidMoves.length; i++){
          console.log(ValidMoves[i][0],",",ValidMoves[i][1]);
          const p=pieceValidMove[ValidMoves[i][0]][ValidMoves[i][1]];
          if(p===null){
            pieceValidMove[ValidMoves[i][0]][ValidMoves[i][1]] = 'm';
          }
          else{
            pieceValidMove[ValidMoves[i][0]][ValidMoves[i][1]] = p+'m';
          }
        }

        console.log("---pieceValidMove = board.map: validMove-------");
            
      for(let i=0; i<pieceValidMove.length; i++){
        console.log(pieceValidMove[i]);
      }

        socket.emit("vaildMoveReply", {
            success: true,
            from,
            board: changeBoard,
            pieceValidMove,
            kingIsSafe: true,
            message: `You can successfully make this move ${from}: validMove.`,
        });
      

  });

  // socket.on("disconnect", () => {
  //   console.log("User Disconnected:", socket.id);

  //   if(waitingPlayer && waitingPlayer.id===socket.id){
  //     waitingPlayer=null;
  //     console.log("⏳ Waiting player removed");
  //     return;
  //   }

  //   const roomId = socket.data.roomId;

  //   if(!roomId){
  //     return;
  //   }

  //   const game = games[roomId];

  //   if (!game) {
  //     return;
  //   } 

  //   console.log("♻️ Player disconnected from game");
  //   console.log("Room:", roomId);
  //   console.log("Player ID:", socket.data.playerId);

  //   socket.to(roomId).emit("opponentDisconnected", {
  //     message: "Opponent disconnected temporarily",
  //   });

  //   // delete games[roomId];

  //   // console.log(
  //   //   "Game Deleted:",
  //   //   roomId
  //   // );

  // });

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", socket.id);

    if (waitingPlayer && waitingPlayer.id === socket.id) {
        waitingPlayer = null;
        console.log("⏳ Waiting player removed");
        return;
    }

    const roomId = socket.data.roomId;

    if (!roomId) {
        return;
    }

    const game = games[roomId];

    if (!game) {
        return;
    }

    console.log("♻️ Player disconnected temporarily");
    console.log("Room:", roomId);
    console.log("Player ID:", socket.data.playerId);

    socket.to(roomId).emit("opponentDisconnected", {
        message: "Opponent disconnected temporarily"
    });

    // ❌ DO NOT DELETE THE GAME
    // delete games[roomId];
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});