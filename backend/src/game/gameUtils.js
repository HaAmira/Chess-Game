export function getOpponentColor(color) {
    return color === "w" ? "b" : "w";
}

export function getPlayerColor(game, socketId) {
    if (game.whitePlayer === socketId) {
        return "w";
    }

    if (game.blackPlayer === socketId) {
        return "b";
    }

    return null;
}

export function isPlayerInGame(game, playerId) {
    return (
        game.whitePlayerId === playerId ||
        game.blackPlayerId === playerId
    );
}

export function isPlayerTurn(game, color) {
    return game.turn === color;
}

// module.exports = {
//     getOpponentColor,
//     getPlayerColor,
//     isPlayerInGame,
//     isPlayerTurn
// };