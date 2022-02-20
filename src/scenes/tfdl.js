import Phaser from "phaser";

export default class TFDL extends Phaser.Scene {
  constructor() {
    super("TFDL");
    this.roomId = "tfdl";
    this.chatMessages = [];
    this.state = {};
  }  

  preload() {
    this.load.spritesheet("astronaut", "assets/spritesheets/astronaut3.png", {
      frameWidth: 29,
      frameHeight: 37,
    });
    this.load.html("chatInput", "chat.html");
  }

  init() {
    // socket
    this.socket = io();
  }  

  addPlayer(scene, playerInfo) {
    scene.joined = true;
    scene.astronaut = scene.physics.add
      .sprite(playerInfo.x, playerInfo.y, "astronaut")
      .setOrigin(0.5, 0.5)
      .setSize(30, 40)
      .setOffset(0, 24);
  }

  addOtherPlayers(scene, playerInfo) {
    const otherPlayer = scene.add.sprite(
      playerInfo.x,
      playerInfo.y,
      "astronaut"
    );
    otherPlayer.playerId = playerInfo.playerId;
    scene.otherPlayers.add(otherPlayer);
  }

  create() {
    const scene = this;

    // Create Chat
    this.textInput = this.add.dom(5, 660).createFromCache("chatInput").setOrigin(0);
    this.chat = this.add.text(5, 660, "", {
      fontSize: 12,
      backgroundColor: "#242424CD",
      color: "#FFFFFF",
      padding: 10,
      fixedWidth: 450,
      wordWrap: {width: 450}
    }).setOrigin(0,1);
    // Listen for enter key
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on("down", event => {
      let chatbox = this.textInput.getChildByName("chatInput");
      if (chatbox.value != "") {
        scene.socket.emit("sendChat", { roomId: scene.roomId, message: chatbox.value });
        chatbox.value = "";
      }
    });

    this.socket.on("receiveChat", function(chat){
      const { timestamp, message, id } = chat;
      console.log(timestamp, message, id);
      scene.chatMessages.push(`[${timestamp}] ${id}: ${message}`);
      if(scene.chatMessages.length > 15) {
        scene.chatMessages.shift();
      }
      scene.chat.setText(scene.chatMessages);
    })

    // Connect to chat socket

    // const text = this.add.text(400, 250, 'Hello World!');
    // text.setOrigin(0, 0);
    
    this.cursors = this.input.keyboard.createCursorKeys();

    // CREATE OTHER PLAYERS GROUP
    this.otherPlayers = this.physics.add.group();

    this.socket.on("newPlayer", function (arg) {
      const { playerInfo, numPlayers, roomId } = arg;
      scene.addOtherPlayers(scene, playerInfo);
      scene.state.numPlayers = numPlayers;

      console.log(scene.state.players);
    });

    // JOINED ROOM - SET STATE
    this.socket.on("setState", function (state) {
      const { roomId, players, numPlayers } = state;
      scene.physics.resume();

      // STATE
      scene.state.roomId = roomId;
      scene.state.players = players;
      scene.state.numPlayers = numPlayers;

      console.log(scene.state);
    });

    // PLAYERS
    this.socket.on("currentPlayers", function (arg) {
      const { players, numPlayers } = arg;
      scene.state.numPlayers = numPlayers;
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId === scene.socket.id) {
          scene.addPlayer(scene, players[id]);
        } else {
          scene.addOtherPlayers(scene, players[id]);
        }
      });
    });

    this.socket.on("playerMoved", function (playerInfo) {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          const oldX = otherPlayer.x;
          const oldY = otherPlayer.y;
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });

    this.socket.on("otherPlayerStopped", function (playerInfo) {
      this.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.anims.stop(null, true);
        }
      });
    });

    // DISCONNECT
    this.socket.on("disconnected", function (arg) {
      const { playerId, numPlayers } = arg;
      scene.state.numPlayers = numPlayers;
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });    
    this.cursors = this.input.keyboard.createCursorKeys();

    scene.socket.emit("joinRoom", "tfdl");
  }  

  update() {
    const scene = this;
    if (scene.astronaut) {
      const speed = 225;
      // Stop any previous movement from the last frame
      scene.astronaut.body.setVelocity(0);
      // Horizontal movement
      if (scene.cursors.left.isDown) {
        scene.astronaut.body.setVelocityX(-speed);
      } else if (scene.cursors.right.isDown) {
        scene.astronaut.body.setVelocityX(speed);
      }
      // Vertical movement
      if (scene.cursors.up.isDown) {
        scene.astronaut.body.setVelocityY(-speed);
      } else if (scene.cursors.down.isDown) {
        scene.astronaut.body.setVelocityY(speed);
      }
      // Normalize and scale the velocity so that astronaut can't move faster along a diagonal
      this.astronaut.body.velocity.normalize().scale(speed);

      // emit player movement
      var x = scene.astronaut.x;
      var y = scene.astronaut.y;
      if (
        scene.astronaut.oldPosition &&
        (x !== scene.astronaut.oldPosition.x ||
          y !== scene.astronaut.oldPosition.y)
      ) {
        scene.moving = true;
        scene.socket.emit("playerMovement", {
          x: scene.astronaut.x,
          y: scene.astronaut.y,
          roomId: scene.state.roomId,
        });
      }
      // save old position data
      scene.astronaut.oldPosition = {
        x: scene.astronaut.x,
        y: scene.astronaut.y,
        rotation: scene.astronaut.rotation,
      };
    }
  }
}