import Phaser from "phaser";

export default class TFDL extends Phaser.Scene {
  constructor() {
    super("TFDL");
    this.state = {};
  }  

  preload() {
    this.load.spritesheet("astronaut", "assets/spritesheets/astronaut3.png", {
      frameWidth: 29,
      frameHeight: 37,
    });

    this.load.image("generic", "../assets/game_map/1_Generic_32x32.png");
    this.load.image("classroom-and-library", "../assets/game_map/5_Classroom_and_library_32x32.png");
    this.load.image("basement", "../assets/game_map/14_Basement_32x32.png");
    this.load.image("visible upstaris", "../assets/game_map/17_Visibile_Upstairs_System_32x32.png");
    this.load.image("jail", "../assets/game_map/18_Jail_32x32.png");
    this.load.image("hospital", "../assets/game_map/19_Hospital_32x32.png");
    this.load.image("japanese", "../assets/game_map/20_Japanese_interiors_32x32.png");
    this.load.image("museum", "../assets/game_map/22_Museum_32x32.png");
    this.load.image("walls", "../assets/game_map/Room_Builder_3d_walls_32x32.png");
    this.load.image("floor", "../assets/game_map/Room_Builder_Floors_32x32.png");
    
    this.load.tilemapTiledJSON('map', "../assets/game_map/tfdl.json")
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
    // const text = this.add.text(400, 250, 'Hello World!');
    // text.setOrigin(0, 0);

    const scene = this;
    
    this.cursors = this.input.keyboard.createCursorKeys();


    // Tilemap
    // this.add.image(0, 0, 'generic');

    scene.map = scene.make.tilemap({key: "map"}); // tilemap with out JSON
    scene.tileset = scene.map.addTilesetImage('generic', 'generic'); // Putting the image data we loaded into the JSON (tilemap)
    scene.tileset = scene.map.addTilesetImage('classroom and library', 'classroom-and-library');
    scene.tileset = scene.map.addTilesetImage('basement', 'basement');
    scene.tileset = scene.map.addTilesetImage('visible upstaris', 'visible upstaris');
    scene.tileset = scene.map.addTilesetImage('jail', 'jail');
    scene.tileset = scene.map.addTilesetImage('hospital', 'hospital');
    scene.tileset = scene.map.addTilesetImage('japanese', 'japanese');
    scene.tileset = scene.map.addTilesetImage('museum', 'museum');
    scene.tileset = scene.map.addTilesetImage('walls', 'walls');
    scene.tileset = scene.map.addTilesetImage('floor', 'floor');

    // scene.map.createLayer('floor', scene.tileset, 100, 10); // the key has to be the same name from the tiled .tmx file
    scene.map.createLayer('floor', scene.tileset, 0, 0);
    scene.map.createLayer('walls (collide)', scene.tileset, 0, 0);
    scene.map.createLayer('back furniture (collide)', scene.tileset, 0, 0);
    scene.map.createLayer('back furniture (collide)', scene.tileset, 0, 0);



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