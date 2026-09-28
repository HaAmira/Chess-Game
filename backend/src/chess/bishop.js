export const generateBishopMoves = (board,i,j,color)=>{
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