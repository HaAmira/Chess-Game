import { generateBishopMoves } from "./bishop.js";
import { generateRookMoves } from "./rook.js";

export const generateQueenMoves=(board,i,j,color)=>{
  console.log("generateQueenMoves:- ",i,",",j,":- ",board[i][j]);
  const rookMoves = generateRookMoves(board,i,j,color);
  const bishopMoves = generateBishopMoves(board,i,j,color);
  return [...rookMoves,...bishopMoves];
}