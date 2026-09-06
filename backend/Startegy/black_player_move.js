io.on("connection", (socket) => {

  const playerId = socket.handshake.query.playerId;

  console.log("User Connected:", socket.id);
  console.log("Player ID:", playerId);

  if (!playerId) {
    console.log("Player ID missing");
    socket.disconnect();
    return;
  }

  // -----------------------------------------
  // CHECK IF THIS PLAYER ALREADY HAS A GAME
  // -----------------------------------------

  const oldPlayer = players.get(playerId);

  if (oldPlayer && oldPlayer.roomId) {

    const roomId = oldPlayer.roomId;
    const color = oldPlayer.color;

    const game = games[roomId];

    if (game) {

      console.log(
        "♻️ Reconnecting player:",
        playerId,
        "Room:",
        roomId,
        "Color:",
        color
      );

      // New socket replaces old socket
      oldPlayer.socketId = socket.id;

      socket.data.playerId = playerId;
      socket.data.roomId = roomId;
      socket.data.color = color;

      socket.join(roomId);

      // Update game player socket
      if (color === "w") {
        game.whitePlayer = socket.id;
      } else {
        game.blackPlayer = socket.id;
      }

      // Send current game state
      socket.emit("gameStart", {
        roomId,
        color,
        board: game.playBoard,
        turn: game.turn,
      });

      console.log("✅ Reconnected successfully");

      return;
    }
  }


  // -----------------------------------------
  // NEW PLAYER
  // -----------------------------------------

  if (waitingPlayer) {

    const whiteSocket = waitingPlayer;
    const blackSocket = socket;

    const roomId = `room-${roomCounter++}`;

    whiteSocket.join(roomId);
    blackSocket.join(roomId);

    const whitePlayerId =
      whiteSocket.handshake.query.playerId;

    const blackPlayerId =
      blackSocket.handshake.query.playerId;


    // Socket data
    whiteSocket.data.playerId = whitePlayerId;
    whiteSocket.data.roomId = roomId;
    whiteSocket.data.color = "w";

    blackSocket.data.playerId = blackPlayerId;
    blackSocket.data.roomId = roomId;
    blackSocket.data.color = "b";


    // Persistent player data
    players.set(whitePlayerId, {
      playerId: whitePlayerId,
      socketId: whiteSocket.id,
      roomId,
      color: "w",
    });

    players.set(blackPlayerId, {
      playerId: blackPlayerId,
      socketId: blackSocket.id,
      roomId,
      color: "b",
    });


    // Create game
    games[roomId] = {
      playBoard: createBoard(),
      turn: "w",

      whitePlayer: whiteSocket.id,
      blackPlayer: blackSocket.id,
    };


    console.log("=================================");
    console.log("🎮 GAME CREATED");
    console.log("Room:", roomId);
    console.log("White:", whiteSocket.id);
    console.log("Black:", blackSocket.id);
    console.log("=================================");


    // Send white
    whiteSocket.emit("gameStart", {
      roomId,
      color: "w",
      board: games[roomId].playBoard,
      turn: games[roomId].turn,
    });


    // Send black
    blackSocket.emit("gameStart", {
      roomId,
      color: "b",
      board: games[roomId].playBoard,
      turn: games[roomId].turn,
    });


    waitingPlayer = null;

  } else {

    // First player waits
    waitingPlayer = socket;

    console.log(
      "⏳ Waiting for opponent:",
      socket.id
    );
  }


  // -----------------------------------------
  // MOVE
  // -----------------------------------------

  socket.on("move", ({ from, to, updatePawn }) => {

    const roomId = socket.data.roomId;
    const color = socket.data.color;

    console.log(
      "MOVE:",
      socket.id,
      playerId,
      roomId,
      color
    );

    if (!roomId) {
      socket.emit("moveReply", {
        success: false,
        message: "You are not currently in a game",
      });

      return;
    }

    const game = games[roomId];

    if (!game) {
      socket.emit("moveReply", {
        success: false,
        message: "Game not found",
      });

      return;
    }

    // -----------------------------------------
    // YOUR EXISTING MOVE CODE
    // -----------------------------------------

    // Keep your current move validation code here.

  });


  // -----------------------------------------
  // VALID MOVE
  // -----------------------------------------

  socket.on("validMove", ({ from }) => {

    const roomId = socket.data.roomId;
    const color = socket.data.color;

    // Keep your existing validMove code here.

  });


  // -----------------------------------------
  // DISCONNECT
  // -----------------------------------------

  socket.on("disconnect", () => {

    console.log("User Disconnected:", socket.id);

    const playerId = socket.data.playerId;

    if (!playerId) {
      return;
    }

    const player = players.get(playerId);

    if (!player) {
      return;
    }

    const roomId = player.roomId;

    // -----------------------------------------
    // PLAYER REFRESH / TEMPORARY DISCONNECT
    // -----------------------------------------

    console.log(
      "Player disconnected temporarily:",
      playerId,
      "Room:",
      roomId
    );

    /*
      IMPORTANT:

      DO NOT DELETE THE GAME HERE.

      Browser refresh causes disconnect.
      We keep the game alive.
    */

    const game = games[roomId];

    if (game) {

      socket.to(roomId).emit("opponentDisconnected", {
        message: "Opponent disconnected",
      });

    }

  });

});