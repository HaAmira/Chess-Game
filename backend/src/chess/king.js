export const generateKingMoves=(board,i,j,color)=>{
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

export const kingPosition=(board,a)=>{
  let name = `${a}k`
  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      if(board[i][j] && board[i][j].slice(0, 2) === name){
        return {i,j};
      }
    }
  }
  return null;
}