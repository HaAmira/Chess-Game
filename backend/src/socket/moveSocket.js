import { castlingAllowed } from "../chess/castling.js";
import { kingPosition } from "../chess/king.js";
import { checkOutKing, generateMoves, hasAnyLegalMove, moveToSaveKing } from "../chess/moveValidator.js";
import { boardChange } from "../constants/board.js";
import { getGame } from "../game/gameManager.js";

export function registerMoveSocket (io,socket){

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

        // const game = games[roomId];
        const game = getGame(roomId);

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
            if(castlingAllowed(changeBoard,f,l,ft,lt,color,game)){
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

              if(changeBoard[ft][lt][1] === 'k' ||  changeBoard[ft][lt][1] === 'r') {
                if (game.castling) {
                    game.castling[color] = false;
                }
              }

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
              return;
            }
          }

          else{
            console.log("Not Castling Moves")
            const moves = generateMoves(changeBoard,f,l,game.enPassantTarget);

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

            // Remove captured pawn for en-passant
            if (
                Math.abs(f - ft) === 1 &&
                Math.abs(l - lt) === 1 &&
                changeBoard[f][l][1] === "p" &&
                changeBoard[ft][lt] === null &&
                game.enPassantTarget &&
                game.enPassantTarget.row === f &&
                game.enPassantTarget.col === lt
            ) {
                tempBoard[game.enPassantTarget.row][game.enPassantTarget.col] = null;
            }


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
            console.log("En passant Target:- ",game.enPassantTarget,",",changeBoard[f][l],",",changeBoard[ft][lt]);
            if(game && Math.abs(f-ft)===1 && Math.abs(l-lt)===1 && changeBoard[f][l][1]==='p' && changeBoard[ft][lt]===null && game.enPassantTarget && changeBoard[f][l][0]!==game.enPassantTarget.color && game.enPassantTarget.row===f && game.enPassantTarget.col===lt){
              changeBoard[game.enPassantTarget.row][game.enPassantTarget.col]=null;
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
              if (game.castling) {
                game.castling[color] = false;
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
            opponentHasValidMoves = hasAnyLegalMove(changeBoard,opponentColor,game.enPassantTarget);
          }
          else{
            stalemate = !hasAnyLegalMove(changeBoard,opponentColor,game.enPassantTarget);
          }

          console.log("Opponent is in check:- ",opponentInCheck," , Opponent has any valid move:- ",opponentHasValidMoves," , is in stalment:- ", stalemate);

          if(opponentInCheck && !opponentHasValidMoves){
            console.log("Reply Game Over with checkmate Opponent is in check:- ",opponentInCheck," , Opponent has any valid move:- ",opponentHasValidMoves," , is in stalment:- ", stalemate);
            const winMsg = `✅ Game Over! ${game.turn === 'w' ? 'White' : 'Black'} wins!`;
            game.gameOver = true;
            game.gameOverMessage = winMsg;
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
              message: winMsg
            });
            return ;
          }

          if(stalemate){
            console.log("Reply Game with stalemate Opponent is in check:- ",opponentInCheck," , Opponent has any valid move:- ",opponentHasValidMoves," , is in stalment:- ", stalemate);
            const drawMsg = "Stalemate! The game is a draw";
            game.gameOver = true;
            game.gameOverMessage = drawMsg;
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
              message: drawMsg
            });
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

          if(game && Math.abs(ft-f)===2 && l===lt && changeBoard[ft][lt][1]==='p'){
            game.enPassantTarget = { row: ft, col: lt, color: changeBoard[ft][lt][0] };
          }
          else{
            game.enPassantTarget = null;
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

    // const game = games[roomId];
    const game = getGame(roomId);

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
    // const changeBoard = boardChange(board);
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

        let ValidMoves = generateMoves(pieceValidMove, f, l, game.enPassantTarget);
        console.log("Valid Moves Generated:- ",ValidMoves);
        ValidMoves = moveToSaveKing(changeBoard,ValidMoves,f,l,color);

        // Include castling moves if king
        if (changeBoard[f][l][1] === 'k') {
          if (castlingAllowed(changeBoard, f, l, f, l + 2, color, game)) {
            ValidMoves.push([f, l + 2]);
          }
          if (castlingAllowed(changeBoard, f, l, f, l - 2, color, game)) {
            ValidMoves.push([f, l - 2]);
          }
        }

        console.log("validMove: total legal moves for piece:- ", ValidMoves.length);

        if(ValidMoves.length===0){
          socket.emit("vaildMoveReply", {
            success: false,
            from,
            board,
            kingIsSafe: false,
            message: "No legal moves available for this piece.",
          });
          return;
        }


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
}