export const generateKnightMoves=(board,i,j,color)=>{
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