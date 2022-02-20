import Phaser from "phaser";

export default class TFDL extends Phaser.Scene {
  constructor() {
    super("TFDL");
    this.state = {};
  }

  preload() {
    this.load.atlas(
      "amelia_idle",
      "assets/spritesheets/amelia_idle.png",
      "assets/spritesheets/amelia_idle.json"
    );
    this.load.atlas(
      "amelia_run",
      "assets/spritesheets/amelia_run.png",
      "assets/spritesheets/amelia_run.json"
    );
  }

  init() {
    // socket
    this.socket = io();
  }

  addPlayer(scene, playerInfo) {
    scene.joined = true;
    scene.astronaut = scene.physics.add
      .sprite(playerInfo.x, playerInfo.y, "amelia_idle", "idle-down-00")
      .setSize(32, 48)
      .setOrigin(0.5, 0.5)
      .setOffset(16, 16);
    scene.astronaut.anims.play("amelia-idle-down");
  }

  addOtherPlayers(scene, playerInfo) {
    const otherPlayer = scene.add.sprite(
      playerInfo.x,
      playerInfo.y,
      "amelia_idle",
      "idle-down-00"
    );
    otherPlayer.playerId = playerInfo.playerId;
    scene.otherPlayers.add(otherPlayer);
  }

  prepareCharacterAnimation() {
    const scene = this;
    scene.anims.create({
      key: "amelia-idle-down",
      frames: scene.anims.generateFrameNames("amelia_idle", {
        prefix: "idle-down-",
        start: 0,
        end: 2,
        zeroPad: 2,
      }),
      frameRate: 7,
      repeat: -1,
    });

    scene.anims.create({
      key: "amelia-idle-up",
      frames: scene.anims.generateFrameNames("amelia_idle", {
        prefix: "idle-up-",
        start: 0,
        end: 5,
        zeroPad: 2,
      }),
      frameRate: 7,
      repeat: -1,
    });

    scene.anims.create({
      key: "amelia-idle-right",
      frames: scene.anims.generateFrameNames("amelia_idle", {
        prefix: "idle-right-",
        start: 0,
        end: 5,
        zeroPad: 2,
      }),
      frameRate: 7,
      repeat: -1,
    });

    scene.anims.create({
      key: "amelia-idle-left",
      frames: scene.anims.generateFrameNames("amelia_idle", {
        prefix: "idle-left-",
        start: 0,
        end: 5,
        zeroPad: 2,
      }),
      frameRate: 7,
      repeat: -1,
    });

    scene.anims.create({
      key: "amelia-run-right",
      frames: scene.anims.generateFrameNames("amelia_run", {
        prefix: "run-right-",
        start: 0,
        end: 5,
        zeroPad: 2,
      }),
      frameRate: 7,
      repeat: -1,
    });

    scene.anims.create({
      key: "amelia-run-up",
      frames: scene.anims.generateFrameNames("amelia_run", {
        prefix: "run-up-",
        start: 0,
        end: 5,
        zeroPad: 2,
      }),
      frameRate: 7,
      repeat: -1,
    });

    scene.anims.create({
      key: "amelia-run-down",
      frames: scene.anims.generateFrameNames("amelia_run", {
        prefix: "run-down-",
        start: 0,
        end: 5,
        zeroPad: 2,
      }),
      frameRate: 7,
      repeat: -1,
    });

    scene.anims.create({
      key: "amelia-run-left",
      frames: scene.anims.generateFrameNames("amelia_run", {
        prefix: "run-left-",
        start: 0,
        end: 5,
        zeroPad: 2,
      }),
      frameRate: 7,
      repeat: -1,
    });
  }

  create() {
    this.prepareCharacterAnimation();
    // const text = this.add.text(400, 250, "Hello World!");
    // text.setOrigin(0, 0);

    const scene = this;

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

          if (oldX < playerInfo.x) {
            otherPlayer.anims.play("amelia-run-right", true);
          } else if (oldX > playerInfo.x) {
            otherPlayer.anims.play("amelia-run-left", true);
          } else if (oldY < playerInfo.y) {
            otherPlayer.anims.play("amelia-run-down", true);
          } else if (oldY > playerInfo.y) {
            otherPlayer.anims.play("amelia-run-up", true);
          }
        }
      });
    });

    this.socket.on("otherPlayerStopped", function (playerInfo, direction) {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          if (direction) {
            if (direction === "left") {
              otherPlayer.anims.play("amelia-idle-left", true);
            } else if (direction === "right") {
              otherPlayer.anims.play("amelia-idle-right", true);
            } else if (direction === "down") {
              otherPlayer.anims.play("amelia-idle-down", true);
            } else {
              otherPlayer.anims.play("amelia-idle-up", true);
            }
          }
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
      
      const prevVelocity = this.astronaut.body.velocity.clone();
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

      // Update the animation last and give left/right animations precedence over up/down animations
      if (this.cursors.left.isDown) {
        this.astronaut.anims.play("amelia-run-left", true);
        scene.astronaut.direction = 'left';
      } else if (this.cursors.right.isDown) {
        this.astronaut.anims.play("amelia-run-right", true);
        scene.astronaut.direction = "right";
      } else if (this.cursors.up.isDown) {
        this.astronaut.anims.play("amelia-run-up", true);
        scene.astronaut.direction = "up";
      } else if (this.cursors.down.isDown) {
        this.astronaut.anims.play("amelia-run-down", true);
        scene.astronaut.direction = "down";
      } else {
        // this.astronaut.anims.stop(null, true);

        // If we were moving, pick and idle frame to use
        if (prevVelocity.x < 0){
          this.astronaut.anims.play("amelia-idle-left", true);
        }
        else if (prevVelocity.x > 0){
          this.astronaut.anims.play("amelia-idle-right", true);
        }
        else if (prevVelocity.y < 0) {          
          this.astronaut.anims.play("amelia-idle-up", true);
        }
        else if (prevVelocity.y > 0) {          
          this.astronaut.anims.play("amelia-idle-down", true);
        }
      }

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
      } else if (
        this.joined &&
        this.moving &&
        !this.cursors.down.isDown &&
        !this.cursors.up.isDown &&
        !this.cursors.right.isDown &&
        !this.cursors.left.isDown
      ) {
        this.moving = false;
        this.socket.emit("playerStopped", {
          x: this.astronaut.x,
          y: this.astronaut.y,
          roomId: scene.state.roomId,
          direction: scene.astronaut.direction,
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
