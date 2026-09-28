export const generateRookMoves=(board,i,j,color)=>{
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