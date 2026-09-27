import {
    getGame,
    findGameByPlayerId,
    getWaitingPlayer,
    setWaitingPlayer,
    clearWaitingPlayer,
    createRoomId,
    setGame,
    deleteGame
} from "../game/gameManager.js";
import { createGameState } from "../game/gameState.js";


export function registerGameSocket (io,socket){
    socket.on("joinGame", ({ playerId, roomId }) => {
        console.log("Join Game. Player ID:", playerId, "Room ID:", roomId, "Socket ID:", socket.id);

        if (!playerId) {
            console.log("Player ID missing");
            return;
        }

        // ALWAYS associate playerId on socket
        socket.data.playerId = playerId;

        const waiting = getWaitingPlayer();

        // 1. If same player was waiting and refreshed
        if (waiting && waiting.data && waiting.data.playerId === playerId) {
            console.log("♻️ Updating waiting player socket");
            setWaitingPlayer(socket);
            socket.data.playerId = playerId;
            socket.emit("waiting", {
                message: "Waiting for opponent..."
            });
            return;
        }

        // 2. CHECK IF PLAYER ALREADY HAS A GAME
        let existingRoomId = roomId && getGame(roomId) ? roomId : null;
        let existingGame = existingRoomId ? getGame(existingRoomId) : null;

        // If roomId provided doesn't belong to this player, ignore stale roomId
        if (existingGame && existingGame.whitePlayerId !== playerId && existingGame.blackPlayerId !== playerId) {
            console.log("Stale roomId provided, playerId does not match room players");
            existingGame = null;
            existingRoomId = null;
        }

        // Fallback to find by playerId if roomId was missing or stale
        if (!existingGame) {
            const result = findGameByPlayerId(playerId);
            if (result) {
                existingRoomId = result.roomId;
                existingGame = result.game;
            }
        }

        // -----------------------------------------
        // 2. PLAYER IS RECONNECTING
        // -----------------------------------------
        if (existingGame) {
            console.log("♻️ Reconnecting existing game:", existingRoomId);

            let color;
            if (existingGame.whitePlayerId === playerId) {
                color = "w";
                existingGame.whitePlayer = socket.id;
            } else if (existingGame.blackPlayerId === playerId) {
                color = "b";
                existingGame.blackPlayer = socket.id;
            } else {
                console.log("Player does not belong to this game");
                existingGame = null;
                existingRoomId = null;
            }

            if (existingGame) {
                // Put new socket into old room
                socket.join(existingRoomId);

                socket.data.playerId = playerId;
                socket.data.roomId = existingRoomId;
                socket.data.color = color;

                // Send game state
                socket.emit("gameResume", {
                    roomId: existingRoomId,
                    color: color,
                    board: existingGame.playBoard,
                    turn: existingGame.turn,
                    gameOver: existingGame.gameOver || false,
                    message: existingGame.gameOverMessage || null
                });

                socket.to(existingRoomId).emit("opponentReconnected", {
                    message: "Opponent reconnected"
                });

                console.log("✅ Game resumed for:", playerId, "color:", color, "room:", existingRoomId);
                return;
            }
        }

        // -----------------------------------------
        // 4. WAITING FOR OPPONENT
        // -----------------------------------------
        if (waiting === null) {
            setWaitingPlayer(socket);
            socket.data.playerId = playerId;
            console.log("⏳ Waiting for opponent:", socket.id);
            socket.emit("waiting", {
                message: "Waiting for opponent..."
            });
            return;
        }

        if (waiting.data && waiting.data.playerId === playerId) {
            setWaitingPlayer(socket);
            socket.data.playerId = playerId;
            socket.emit("waiting", {
                message: "Waiting for opponent..."
            });
            return;
        }

        // -----------------------------------------
        // 5. CREATE NEW GAME
        // -----------------------------------------
        const whitePlayer = waiting;
        const blackPlayer = socket;
        clearWaitingPlayer();

        const newRoomId = createRoomId();

        whitePlayer.join(newRoomId);
        blackPlayer.join(newRoomId);

        whitePlayer.data.color = "w";
        blackPlayer.data.color = "b";

        whitePlayer.data.roomId = newRoomId;
        blackPlayer.data.roomId = newRoomId;

        const whitePlayerId = whitePlayer.data?.playerId;
        const blackPlayerId = blackPlayer.data?.playerId || playerId;
        whitePlayer.data.playerId = whitePlayerId;
        blackPlayer.data.playerId = blackPlayerId;

        const newGame = createGameState(
            whitePlayer,
            blackPlayer
        );
        newGame.whitePlayerId = whitePlayerId;
        newGame.blackPlayerId = blackPlayerId;

        setGame(newRoomId, newGame);

        // -----------------------------------------
        // 7. SEND GAME START
        // -----------------------------------------
        whitePlayer.emit("gameStart", {
            roomId: newRoomId,
            color: "w",
            board: newGame.playBoard,
            turn: newGame.turn
        });

        blackPlayer.emit("gameStart", {
            roomId: newRoomId,
            color: "b",
            board: newGame.playBoard,
            turn: newGame.turn
        });

        console.log("🎮 Game Created:", newRoomId, "White:", whitePlayerId, "Black:", blackPlayerId);
    });


    socket.on("newGame", ({ playerId }) => {
        console.log("New Game requested by:", playerId);
        if (!playerId) return;

        socket.data.playerId = playerId;

        const oldRoomId = socket.data.roomId;
        if (oldRoomId) {
            deleteGame(oldRoomId);
        }
        socket.data.roomId = null;
        socket.data.color = null;

        const waiting = getWaitingPlayer();

        if (waiting === null) {
            setWaitingPlayer(socket);
            socket.data.playerId = playerId;
            socket.emit("waiting", {
                message: "Waiting for opponent..."
            });
            return;
        }

        if (waiting.data && waiting.data.playerId === playerId) {
            setWaitingPlayer(socket);
            socket.data.playerId = playerId;
            socket.emit("waiting", {
                message: "Waiting for opponent..."
            });
            return;
        }

        const whitePlayer = waiting;
        const blackPlayer = socket;
        clearWaitingPlayer();

        const newRoomId = createRoomId();

        whitePlayer.join(newRoomId);
        blackPlayer.join(newRoomId);

        whitePlayer.data.color = "w";
        blackPlayer.data.color = "b";

        whitePlayer.data.roomId = newRoomId;
        blackPlayer.data.roomId = newRoomId;

        const whitePlayerId = whitePlayer.data?.playerId;
        const blackPlayerId = blackPlayer.data?.playerId || playerId;
        whitePlayer.data.playerId = whitePlayerId;
        blackPlayer.data.playerId = blackPlayerId;

        const newGame = createGameState(
            whitePlayer,
            blackPlayer
        );
        newGame.whitePlayerId = whitePlayerId;
        newGame.blackPlayerId = blackPlayerId;

        setGame(newRoomId, newGame);

        whitePlayer.emit("gameStart", {
            roomId: newRoomId,
            color: "w",
            board: newGame.playBoard,
            turn: newGame.turn
        });

        blackPlayer.emit("gameStart", {
            roomId: newRoomId,
            color: "b",
            board: newGame.playBoard,
            turn: newGame.turn
        });

        console.log("🎮 New Game Created:", newRoomId, "White:", whitePlayerId, "Black:", blackPlayerId);
    });


    socket.on("disconnect", () => {
        console.log("❌ User Disconnected:", socket.id);

        const waiting = getWaitingPlayer();
        
        if (waiting && waiting.id === socket.id) {
            // waitingPlayer = null;
            clearWaitingPlayer();
            console.log("⏳ Waiting player removed");
            return;
        }
    
        const roomId = socket.data.roomId;
    
        if (!roomId) {
            return;
        }
    
        // const game = games[roomId];
        // const game = getGame(roomId);
        const game = roomId ? getGame(roomId) : null;
    
        if (!game) {
            return;
        }
    
        console.log("♻️ Player disconnected temporarily");
        console.log("Room:", roomId);
        console.log("Player ID:", socket.data.playerId);
    
        socket.to(roomId).emit("opponentDisconnected", {
            message: "Opponent disconnected temporarily"
        });
    
        // ❌ DO NOT DELETE THE GAME
        // delete games[roomId];
   });

}