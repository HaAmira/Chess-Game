import { checkOutKing } from "./moveValidator.js";

export const castlingAllowed=(board,f,l,ft,lt,color,game)=>{
  if(game && game.castling && !game.castling[color]){
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