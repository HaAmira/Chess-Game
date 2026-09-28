export const initialBoard = [
  ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
  ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
  ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
];

export const createBoard = () => {
  return initialBoard.map((row) => [...row]);
};

export const boardChange=(board)=>{
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