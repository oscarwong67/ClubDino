const gameRooms = {
  // [roomId]: {
  // users: [],
  // randomTasks: [],
  // scores: [],
  // gameScore: 0,
  // players: {},
  // numPlayers: 0
  // }

  tfdl: {
    players: {},
    numPlayers: 0,
    roomId: 'tfdl',
  }
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}`
    )
    socket.on("isKeyValid", function (input) {
      const keyArray = Object.keys(gameRooms)
      ? socket.emit("keyIsValid", input)
      : socket.emit("keyNotValid");
    });

    socket.on("joinRoom", (roomId, name) => {
      socket.join(roomId);
      const roomInfo = gameRooms[roomId];
      // console.log("roomInfo", roomInfo);
      roomInfo.players[socket.id] = {
        rotation: 0,
        x: 400,
        y: 300,
        playerId: socket.id,
        name
      };

      // update number of players
      roomInfo.numPlayers = Object.keys(roomInfo.players).length;

      // set initial state
      socket.emit("setState", roomInfo);

      // send the players object to the new player
      socket.emit("currentPlayers", {
        players: roomInfo.players,
        numPlayers: roomInfo.numPlayers,
        roomId: roomInfo.roomId,
      });

      // update all other players of the new player
      socket.to(roomId).emit("newPlayer", {
        playerInfo: roomInfo.players[socket.id],
        numPlayers: roomInfo.numPlayers,
        roomId: roomInfo.roomId,
      });
    });

    // when a player moves, update the player data
    socket.on("playerMovement", function (data) {
      const { x, y, roomId } = data;
      // console.log(gameRooms[roomId].players);
      // console.log(socket.id);
      gameRooms[roomId].players[socket.id].x = x;
      gameRooms[roomId].players[socket.id].y = y;
      // emit a message to all players about the player that moved
      socket
        .to(roomId)
        .emit("playerMoved", gameRooms[roomId].players[socket.id]);
    });

    socket.on("playerStopped", function (data) {
      const { x, y, roomId, direction } = data;
      gameRooms[roomId].players[socket.id].x = x;
      gameRooms[roomId].players[socket.id].y = y;
      socket
        .to(roomId)
        .emit("otherPlayerStopped", gameRooms[roomId].players[socket.id], direction);
    });

    // when a player disconnects, remove them from our players object
    socket.on("disconnect", function () {
      console.log('disconnecting player');
      //find which room they belong to
      let roomId = 0;
      for (let keys1 in gameRooms) {
        for (let keys2 in gameRooms[keys1]) {
          Object.keys(gameRooms[keys1][keys2]).map((el) => {
            if (el === socket.id) {
              roomId = keys1;
            }
          });
        }
      }

      const roomInfo = gameRooms[roomId];

      if (roomInfo) {
        console.log("user disconnected: ", socket.id);
        // remove this player from our players object
        delete roomInfo.players[socket.id];
        // update numPlayers
        roomInfo.numPlayers = Object.keys(roomInfo.players).length;
        // emit a message to all players to remove this player
        io.to(roomId).emit("disconnected", {
          playerId: socket.id,
          numPlayers: roomInfo.numPlayers,
          roomId: roomInfo.roomId,
        });
      }
    });

    socket.on("sendChat", function(data) {
      // TODO room id stuff
      const { message, roomId } = data;
      let chat = {
        timestamp: (new Date()).toLocaleTimeString(),
        id: gameRooms[roomId].players[socket.id].name,
        message: message
      };
      console.log('sending: \"[' + chat.timestamp + "] " + chat.id + ": " + chat.message + '\" to room: ' + roomId);
      io.to(roomId).emit("receiveChat", chat);
    })


  });
};