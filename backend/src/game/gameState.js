import { createBoard } from "../constants/board.js";

export function createGameState(whitePlayer, blackPlayer) {
    return {
        playBoard: createBoard(),

        turn: "w",

        whitePlayer: whitePlayer.id,
        blackPlayer: blackPlayer.id,

        whitePlayerId: whitePlayer.data.playerId,
        blackPlayerId: blackPlayer.data.playerId,

        gameOver: false,
        gameOverMessage: null,

        castling: {
            w: true,
            b: true
        },

        enPassantTarget: null
    };
}