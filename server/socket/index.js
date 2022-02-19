const gameRooms = {
  // [roomKey]: {
  // users: [],
  // randomTasks: [],
  // scores: [],
  // gameScore: 0,
  // players: {},
  // numPlayers: 0
  // }
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
  });
};