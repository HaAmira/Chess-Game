import { useEffect, useState } from "react";
import { socket, playerId } from '../utils/socket';
import Square from "../gameComponents/Square";
import toast from 'react-hot-toast';
import PawnPromotion from "./PawnPromotion";
import GameOver from "./GameOver";

const initialBoard = [
  ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
  ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
  ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
];

const cleanBoardMarkers = (b) => {
  if (!b) return initialBoard;
  return b.map((row) =>
    row.map((cell) => {
      if (!cell) return null;
      if (cell === "m") return null;
      if (cell.length === 3 && cell[2] === "m") return cell.slice(0, 2);
      return cell;
    })
  );
};

function Socket_con() {
  const [board, setBoard] = useState(() => {
    try {
      const saved = sessionStorage.getItem("chessBoard");
      return saved ? cleanBoardMarkers(JSON.parse(saved)) : initialBoard;
    } catch {
      return initialBoard;
    }
  });
  const [isUpdatePiece, setIsUpdatePiece] = useState(false);
  const [playerColor, setPlayerColor] = useState(() => {
    return sessionStorage.getItem("playerColor") || null;
  });
  const [currentTurn, setCurrentTurn] = useState(() => {
    return sessionStorage.getItem("currentTurn") || "w";
  });
  const [gameStatus, setGameStatus] = useState(() => {
    return sessionStorage.getItem("roomId") ? "playing" : "connecting";
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [opponentConnected, setOpponentConnected] = useState(true);
  console.log("checks:- ",from,",",to);

  // Setup main socket listeners and reconnect logic
  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected to server, socket ID:", socket.id);
      const storedRoomId = sessionStorage.getItem("roomId");
      socket.emit("joinGame", {
        playerId,
        roomId: storedRoomId || null,
      });
    };

    const handleWaiting = (data) => {
      console.log("⏳ Waiting for opponent:", data);
      setGameStatus("waiting");
      setPlayerColor(null);
      setBoard(initialBoard);
      sessionStorage.removeItem("roomId");
      sessionStorage.removeItem("playerColor");
      sessionStorage.removeItem("currentTurn");
      sessionStorage.removeItem("chessBoard");
    };

    const handleGameStart = (data) => {
      console.log("🎮 Game Started:", data);
      setPlayerColor(data.color);
      setCurrentTurn(data.turn || "w");
      const cleanB = cleanBoardMarkers(data.board);
      setBoard(cleanB);
      setGameStatus("playing");
      setGameOver(false);
      setGameOverMessage(null);
      setOpponentConnected(true);
      sessionStorage.setItem("roomId", data.roomId);
      sessionStorage.setItem("playerColor", data.color);
      sessionStorage.setItem("currentTurn", data.turn || "w");
      sessionStorage.setItem("chessBoard", JSON.stringify(cleanB));
      toast.success(`Game started! You are ${data.color === 'w' ? 'White ♔' : 'Black ♚'}`);
    };

    const handleGameResume = (data) => {
      console.log("♻️ Game Resumed:", data);
      setPlayerColor(data.color);
      setCurrentTurn(data.turn || "w");
      const cleanB = cleanBoardMarkers(data.board);
      setBoard(cleanB);
      setOpponentConnected(true);
      sessionStorage.setItem("roomId", data.roomId);
      sessionStorage.setItem("playerColor", data.color);
      sessionStorage.setItem("currentTurn", data.turn || "w");
      sessionStorage.setItem("chessBoard", JSON.stringify(cleanB));

      if (data.gameOver) {
        setGameOver(true);
        setGameOverMessage(data.message || "Game Over");
        setGameStatus("ended");
      } else {
        setGameOver(false);
        setGameStatus("playing");
      }
      toast.success(`Game restored! You are ${data.color === 'w' ? 'White ♔' : 'Black ♚'}`);
    };

    const handleMoveReply = (data) => {
      console.log("Move reply:", data);
      if (data.success) {
        const cleanB = cleanBoardMarkers(data.board);
        setBoard(cleanB);
        setFrom("");
        setTo("");
        sessionStorage.setItem("chessBoard", JSON.stringify(cleanB));

        if (data.turn) {
          setCurrentTurn(data.turn);
          sessionStorage.setItem("currentTurn", data.turn);
        }

        if (data.gameOver) {
          setGameOver(true);
          setGameOverMessage(data.message);
          setGameStatus("ended");
          toast.success(data.message);
        }
      } else {
        console.log("❌ Move rejected:", data.message);
        toast.error(data.message || "Invalid move");
        setFrom("");
        setTo("");
        if (data.board) {
          const cleanB = cleanBoardMarkers(data.board);
          setBoard(cleanB);
          sessionStorage.setItem("chessBoard", JSON.stringify(cleanB));
        }
      }
    };

    const handleOpponentDisconnected = () => {
      setOpponentConnected(false);
      toast("Opponent temporarily disconnected...", { icon: "⚠️" });
    };

    const handleOpponentReconnected = () => {
      setOpponentConnected(true);
      toast.success("Opponent reconnected!");
    };

    socket.on("connect", handleConnect);
    socket.on("waiting", handleWaiting);
    socket.on("gameStart", handleGameStart);
    socket.on("gameResume", handleGameResume);
    socket.on("moveReply", handleMoveReply);
    socket.on("opponentDisconnected", handleOpponentDisconnected);
    socket.on("opponentReconnected", handleOpponentReconnected);

    // If socket is already connected (e.g. fast refresh/HMR)
    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("waiting", handleWaiting);
      socket.off("gameStart", handleGameStart);
      socket.off("gameResume", handleGameResume);
      socket.off("moveReply", handleMoveReply);
      socket.off("opponentDisconnected", handleOpponentDisconnected);
      socket.off("opponentReconnected", handleOpponentReconnected);
    };
  }, []);

  // Request valid moves whenever 'from' changes
  useEffect(() => {
    if (!from) return;

    const handlerValidMove = ({ success, message, pieceValidMove, board: cleanBoard }) => {
      if (success) {
        if (pieceValidMove) {
          setBoard(pieceValidMove);
        }
      } else {
        setFrom("");
        setTo("");
        if (cleanBoard) {
          setBoard(cleanBoardMarkers(cleanBoard));
        } else {
          setBoard((prev) => cleanBoardMarkers(prev));
        }
        // Don't show aggressive error toast for pieces that simply have no moves
        if (message && message !== "No legal moves available for this piece.") {
          toast.error(message);
        }
      }
    };

    socket.on("vaildMoveReply", handlerValidMove);
    socket.emit("validMove", { from });

    return () => {
      socket.off("vaildMoveReply", handlerValidMove);
    };
  }, [from]);

  const handlerNewGame = () => {
    console.log("🟢 Starting New Game");
    sessionStorage.removeItem("roomId");
    sessionStorage.removeItem("playerColor");
    sessionStorage.removeItem("currentTurn");
    sessionStorage.removeItem("chessBoard");
    setBoard(initialBoard);
    setFrom("");
    setTo("");
    setGameOver(false);
    setGameOverMessage(null);
    setPlayerColor(null);
    setGameStatus("waiting");
    socket.emit("newGame", { playerId });
    toast("Looking for an opponent...");
  };

  const sendMove = (moveFrom, moveTo, piece = null) => {
    console.log("📤 Sending move:", moveFrom, "->", moveTo, piece);
    socket.emit("move", {
      from: moveFrom,
      to: moveTo,
      updatePawn: piece,
    });
  };

  const handlePromotionSelect = (piece) => {
    console.log("handlePromotionSelect:- ",from,",",to,",",piece);
    console.log("🟢 Promotion piece selected:", piece);
    if (!from || !to) {
      setIsUpdatePiece(false);
      return;
    }
    setIsUpdatePiece(false);
    sendMove(from, to, piece);
    setBoard((prev) => cleanBoardMarkers(prev));
    setFrom("");
    setTo("");
  };

  const handleClickPlace = (col, row) => {
    if (col > 7 || col < 0 || row > 7 || row < 0) return;

    if (gameOver) {
      toast.error("Game is over! Click 'New Game' to play again.");
      return;
    }

    if (gameStatus === "waiting") {
      toast("Waiting for an opponent to join...");
      return;
    }

    if (!playerColor) {
      toast.error("Connecting to game server...");
      return;
    }

    if (currentTurn !== playerColor) {
      toast.error(`It's ${currentTurn === 'w' ? "White's" : "Black's"} turn! Please wait.`);
      return;
    }

    const file = String.fromCharCode(97 + col);
    const rank = 8 - row;
    const position = `${file}${rank}`;
    const rawPiece = board[row][col];
    const clickedPiece =
      rawPiece && (rawPiece.length === 2 || rawPiece.length === 3)
        ? rawPiece.slice(0, 2)
        : rawPiece === "m"
        ? null
        : rawPiece;

    if (!from) {
      if (!clickedPiece) {
        return;
      }

      if (clickedPiece[0] !== playerColor) {
        toast.error("You can only move your own pieces");
        return;
      }

      setFrom(position);
      setTo("");
      return;
    } else {
      // 1. If clicked the EXACT SAME piece again, deselect!
      if (from === position) {
        setFrom("");
        setTo("");
        setBoard((prev) => cleanBoardMarkers(prev));
        return;
      }

      const fromCol = from.charCodeAt(0) - 97;
      const fromRow = 8 - Number(from[1]);
      const fromRaw = board[fromRow][fromCol];
      const fromPiece =
        fromRaw && (fromRaw.length === 2 || fromRaw.length === 3)
          ? fromRaw.slice(0, 2)
          : null;

      if (!fromPiece) {
        setFrom("");
        setTo("");
        setBoard((prev) => cleanBoardMarkers(prev));
        return;
      }

      const fromPieceColor = fromPiece[0];

      // 2. If clicked another of our own pieces, switch selection!
      if (clickedPiece && clickedPiece[0] === fromPieceColor) {
        setFrom(position);
        setTo("");
        return;
      }

      // 3. Check if target position is actually a valid move ('m' marker)
      const isTargetValidMove =
        rawPiece === "m" || (rawPiece && rawPiece.length === 3 && rawPiece[2] === "m");

      if (!isTargetValidMove) {
        // Clicked outside valid moves: cleanly cancel selection
        setFrom("");
        setTo("");
        setBoard((prev) => cleanBoardMarkers(prev));
        return;
      }

      console.log("pawnPromotion:- ",from,",",position);

      const l = from.charCodeAt(0) - 97;
      const f = 8-Number(from[1]);
      const lt = position.charCodeAt(0) - 97;
      const ft = 8-Number(position[1]);

      
      // 4. Check pawn promotion
      const whitePawnPromotion =
      fromPieceColor === "w" && from[1] === "7" && position[1] === "8";
      const blackPawnPromotion =
      fromPieceColor === "b" && from[1] === "2" && position[1] === "1";
      if ((whitePawnPromotion || blackPawnPromotion) && board[f][l][1]==='p') {
        console.log("location Pawn:- ", l, ",", f," | ",lt,",",ft,":- ",board[l][f],",",board[f][l],"|",board[lt][ft],",",board[ft][lt]);
        console.log("pawnPromotion1:- ",from,",",position);
        setTo(position);
        setIsUpdatePiece(true);
        return;
      }

      // 5. Send move
      setTo(position);
      sendMove(from, position);
      setBoard((prev) => cleanBoardMarkers(prev));
      setFrom("");
      setTo("");
    }
  };

  const isMyTurn = currentTurn === playerColor;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {/* Game Header & Status Dashboard */}
      <div className="w-full max-w-[620px] mb-4 bg-gray-800/90 border border-gray-700 p-4 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">You are:</span>
            {playerColor ? (
              <span className={`font-bold px-2.5 py-0.5 rounded-full text-sm ${
                playerColor === "w"
                  ? "bg-gray-700 text-white border border-amber-300"
                  : "bg-amber-100 text-gray-900 border border-gray-500"
              }`}>
                {playerColor === "w" ? "White ♔" : "Black ♚"}
              </span>
            ) : (
              <span className="text-gray-400 text-sm italic">Assigning...</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gameStatus === "waiting" && (
            <span className="flex items-center gap-2 text-sm bg-blue-900/60 border border-blue-500/50 text-blue-300 px-3 py-1 rounded-full animate-pulse">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              Waiting for opponent...
            </span>
          )}

          {gameStatus === "playing" && (
            <span className={`text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-2 ${
              isMyTurn
                ? "bg-emerald-900/70 text-emerald-300 border border-emerald-500/60"
                : "bg-amber-900/50 text-amber-300 border border-amber-600/40"
            }`}>
              <span className={`inline-block w-2 h-2 rounded-full ${
                isMyTurn ? "bg-emerald-400" : "bg-amber-400"
              }`}></span>
              {isMyTurn ? "Your Turn" : "Opponent's Turn"}
            </span>
          )}

          {gameStatus === "ended" && (
            <span className="text-sm bg-purple-900/60 text-purple-300 border border-purple-500/50 px-3 py-1 rounded-full">
              Game Over
            </span>
          )}

          {!opponentConnected && gameStatus === "playing" && (
            <span className="text-xs bg-red-900/70 text-red-300 border border-red-500/50 px-2 py-0.5 rounded-full">
              Opponent Reconnecting...
            </span>
          )}

          <button
            onClick={handlerNewGame}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-600 transition-colors cursor-pointer"
          >
            New Game
          </button>
        </div>
      </div>

      {/* Chessboard Container */}
      <div className="w-full max-w-[620px] bg-gray-700/70 border-gray-700 p-4 rounded-2xl border-3 aspect-square grid grid-cols-8 shadow-2xl">
        {board.map((row, rowIdx) =>
          row.map((piece, pieceIdx) => {
            const squarePos = `${String.fromCharCode(97 + pieceIdx)}${8 - rowIdx}`;
            const isSelected = from === squarePos;
            return (
              <Square
                clickPlace={() => handleClickPlace(pieceIdx, rowIdx)}
                rowId={8 - rowIdx}
                columId={String.fromCharCode(97 + pieceIdx)}
                key={`${rowIdx}-${pieceIdx}`}
                isDark={(pieceIdx + rowIdx) % 2 !== 0}
                piece={piece}
                isSelected={isSelected}
              />
            );
          })
        )}
      </div>

      <PawnPromotion
        openComponent={isUpdatePiece}
        onClose={() => setIsUpdatePiece(false)}
        piecePromotionData={(piece) => handlePromotionSelect(piece)}
      />

      <GameOver
        openComponent={gameOver}
        onClose={handlerNewGame}
        message={gameOverMessage}
      />
    </div>
  );
}

export default Socket_con;