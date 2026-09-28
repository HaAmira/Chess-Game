export const generatePawnMoves=(board, i, j, color, enPassantTarget)=>{
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
      if(enPassantTarget && enPassantTarget.color!==color && enPassantTarget.row===i && Math.abs(enPassantTarget.col-j)===1 && board[i + 1][enPassantTarget.col] === null){
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
      if(enPassantTarget && enPassantTarget.color!==color && enPassantTarget.row===i && Math.abs(enPassantTarget.col-j)===1 && board[i - 1][enPassantTarget.col] === null){
        moves.push([i-1,enPassantTarget.col]);
      }
  }
  console.log("validMoves: Pawn",moves);
  return moves;
}