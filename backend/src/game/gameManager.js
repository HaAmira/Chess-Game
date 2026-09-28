const games = {};

let waitingPlayer = null;
let roomCounter = 1;

// Get a game using roomId
export function getGame(roomId) {
    return games[roomId];
}

// Add/create a game
export function setGame(roomId, game) {
    games[roomId] = game;
}

// Remove a game
export function deleteGame(roomId) {
    delete games[roomId];
}

// Find a game where a player is already playing (prefer newest active game)
export function findGameByPlayerId(playerId) {
    if (!playerId) return null;
    const roomIds = Object.keys(games).reverse();

    // 1. Look for active (not ended) games first
    for (const roomId of roomIds) {
        const game = games[roomId];
        if (
            game &&
            !game.gameOver &&
            (game.whitePlayerId === playerId || game.blackPlayerId === playerId)
        ) {
            return {
                roomId,
                game
            };
        }
    }

    // 2. Fallback to most recent game even if ended
    for (const roomId of roomIds) {
        const game = games[roomId];
        if (
            game &&
            (game.whitePlayerId === playerId || game.blackPlayerId === playerId)
        ) {
            return {
                roomId,
                game
            };
        }
    }

    return null;
}

// Remove any games associated with a player
export function deleteGamesByPlayerId(playerId) {
    if (!playerId) return;
    for (const roomId in games) {
        const game = games[roomId];
        if (
            game &&
            (game.whitePlayerId === playerId || game.blackPlayerId === playerId)
        ) {
            delete games[roomId];
        }
    }
}

// Generate a new room ID
export function createRoomId() {
    const roomId = `room-${roomCounter++}`;

    return roomId;
}

// Get waiting player
export function getWaitingPlayer() {
    return waitingPlayer;
}

// Set waiting player
export function setWaitingPlayer(player) {
    waitingPlayer = player;
}

// Clear waiting player
export function clearWaitingPlayer() {
    waitingPlayer = null;
}

// module.exports = {
//     getGame,
//     setGame,
//     deleteGame,
//     findGameByPlayerId,
//     createRoomId,
//     getWaitingPlayer,
//     setWaitingPlayer,
//     clearWaitingPlayer
// };