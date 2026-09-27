import { generateBishopMoves } from "./bishop.js";
import { generateKingMoves, kingPosition } from "./king.js";
import { generateKnightMoves } from "./knight.js";
import { generatePawnMoves } from "./pawn.js";
import { generateQueenMoves } from "./queen.js";
import { generateRookMoves } from "./rook.js";

export const generateMoves = (board, i, j,enPassantTarget) => {
  console.log("generateMoves:- -------------------",i,",",j,":- ",board[i][j]);
        for(let i=0; i<board.length; i++){
        console.log(board[i]);
      }
  const piece = board[i][j];
  if (!piece) return [];
  const color = piece[0];
  switch (piece[1]) {
      case "p":
          return generatePawnMoves(board, i, j, color,enPassantTarget);
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



export const checkOutKing=(board,i,j,a)=>{
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
      else if(f+1<8 && l-1>=0 && (board[f+1][l-1]===p)){
        console.log("King is not save by pawn");
        return false;
      }
    }
    else if(a==='w'){
      if(f-1>=0 && l+1<8 && (board[f-1][l+1]===p)){
        console.log("King is not save by pawn");
        return false;
      }
      else if(f-1>=0 && l-1>=0 && (board[f-1][l-1]===p)){
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
    console.log("King is Save");

    return true;
}


export const hasAnyLegalMove = (board, color, enPassantTarget) => {
  for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
          const piece = board[i][j];
          if (!piece || piece[0] !== color) continue;
          const moves = generateMoves(board, i, j, enPassantTarget);
          for (const [x, y] of moves) {
              const tempBoard = board.map(row => [...row]);
              console.log("Checking move for piece:",piece,"from",i,j,"to",x,y);
              tempBoard[x][y] = tempBoard[i][j];
              tempBoard[i][j] = null;
              // const king = kingPosition(tempBoard, color);
              if (enPassantTarget && tempBoard[i][j] === null && tempBoard[x][y] && tempBoard[x][y][1] === "p" && 
                Math.abs(x - i) === 1 && Math.abs(y - j) === 1 && enPassantTarget.row === i && enPassantTarget.col === y
              ) {
                  tempBoard[enPassantTarget.row][enPassantTarget.col] = null;
              }

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


export const moveToSaveKing = (board,ValidMoves,f,l,color)=>{
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