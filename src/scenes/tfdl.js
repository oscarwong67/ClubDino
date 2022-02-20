import Phaser from "phaser";
import PPMain from 'ppmain';

export default class TFDL extends Phaser.Scene {
  constructor() {
    super("TFDL");
    this.roomId = "tfdl";
    this.chatMessages = [];
    this.state = {};
    this.isTransitioning = false;
  }

  preload() {
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
    this.load.image(
      "zipper",
      "../assets/game_map/Zipper.png"
    );
    
    this.load.tilemapTiledJSON("tfdl_tilemap", "../assets/game_map/tfdl.json");
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
    this.load.html("chatInput", "chat.html");
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
      .setOffset(16, 24);
    scene.astronaut.anims.play("amelia-idle-down");

    scene.physics.add.collider(scene.astronaut, this.backFurnitureLayer);
    scene.physics.add.collider(scene.astronaut, this.wallsLayer);
    scene.physics.add.collider(scene.astronaut, this.furnitureLayer);
    scene.physics.add.collider(scene.astronaut, this.moreFurnitureLayer);

    let credits = localStorage.getItem("credits");
    if (credits) {
      this.state.credits = credits;
    } else {
      localStorage.setItem("credits", 0);
      this.state.credits = 0;
    }

    this.creditsText = this.add.text(800, 825, `Dino Creds: ${this.state.credits}`);
    this.creditsText.setOrigin(0, 0);
    const nametag = scene.add.text(playerInfo.x, playerInfo.y-45, playerInfo.name, {
      fontSize: 15,
      color: "#FFFFFF",
      padding: 10,
      wordWrap: {width: 50},
      align: "center"
    }).setOrigin(0.5,0);
    scene.astronaut.nametag = nametag;
  }

  addOtherPlayers(scene, playerInfo) {
    const otherPlayer = scene.add.sprite(
      playerInfo.x,
      playerInfo.y,
      "amelia_idle",
      "idle-down-00"
    );
    const nametag = scene.add.text(playerInfo.x, playerInfo.y-45, playerInfo.name, {
      fontSize: 15,
      color: "#FFFFFF",
      padding: 10,
      wordWrap: {width: 50},
      align: "center"
    }).setOrigin(0.5,0);
    otherPlayer.name = playerInfo.name;
    otherPlayer.playerId = playerInfo.playerId;
    otherPlayer.nametag = nametag;
    scene.otherPlayers.add(otherPlayer);
  }

  highlightControlPanel(astronaut, controlPanel) {
    controlPanel.setTint(0xbdef83);
    controlPanel.setInteractive();
  }

  checkOverlap(scene, player, controlPanel, SceneTitle) {
    const boundsPlayer = player.getBounds();
    const boundsPanel = controlPanel.getBounds();
    if (
      !Phaser.Geom.Intersects.RectangleToRectangle(boundsPlayer, boundsPanel)
    ) {
      scene.deactivateControlPanel(controlPanel);
    } else {
      console.log('overlap');
      scene.astronaut.x = 500;
      scene.astronaut.y = 350;
      scene.scene.launch(SceneTitle, { scene: scene, socket: scene.socket });
      scene.physics.pause();
    }
  }

  deactivateControlPanel(controlPanel) {
    controlPanel.clearTint();
    controlPanel.disableInteractive();
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
      frameRate: 4,
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
      frameRate: 4,
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
      frameRate: 4,
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
      frameRate: 4,
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

  create(name) {
    this.isTransitioning = false;
    
    console.log(`${name} has arrived in TFDL.`);
    // this.scene.setVisible(false, 'MacHall');
    // this.scene.setVisible(true);
    this.prepareCharacterAnimation();

    const scene = this;

    // Create Chat
    this.textInput = this.add.dom(5, 820).createFromCache("chatInput").setOrigin(0);
    this.chat = this.add
      .text(5, 820, "", {
        fontSize: 12,
        backgroundColor: "#242424CD",
        color: "#FFFFFF",
        padding: 10,
        fixedWidth: 450,
        wordWrap: { width: 450 },
      })
      .setOrigin(0, 1);
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
    
    this.cursors = this.input.keyboard.createCursorKeys();


    // Tilemap
    // this.add.image(0, 0, 'generic');

    scene.map = scene.make.tilemap({ key: "tfdl_tilemap" }); // tilemap with out JSON
    const tilesets = [];

    tilesets.push(
      scene.map.addTilesetImage("generic", "generic")
    ); // Putting the image data we loaded into the JSON (tilemap)
    tilesets.push(scene.map.addTilesetImage('classroom and library', 'classroom-and-library'));
    tilesets.push(scene.map.addTilesetImage('basement', 'basement'));
    tilesets.push(scene.map.addTilesetImage('visible upstaris', 'visible upstaris'));
    tilesets.push(scene.map.addTilesetImage('jail', 'jail'));
    tilesets.push(scene.map.addTilesetImage('hospital', 'hospital'));
    tilesets.push(scene.map.addTilesetImage('japanese', 'japanese'));
    tilesets.push(scene.map.addTilesetImage('museum', 'museum'));
    tilesets.push(scene.map.addTilesetImage("walls", "walls"));
    tilesets.push(scene.map.addTilesetImage("floor", "floor"));
    tilesets.push(scene.map.addTilesetImage("zipper", "zipper"));

    scene.map.createLayer('floor', tilesets, 0, 0); // the key has to be the same name from the tiled .tmx file
    scene.wallsLayer = scene.map.createLayer("walls (collide)", tilesets, 0, 0);
    scene.backFurnitureLayer = scene.map.createLayer("back furniture (collide)", tilesets, 0, 0);
    scene.bottomChairsLayer = scene.map.createLayer(
      "bottom chairs (no collide)",
      tilesets,
      0,
      0
    );
    scene.furnitureLayer = scene.map.createLayer("furniture (collide)", tilesets, 0, 0);
    scene.moreFurnitureLayer = scene.map.createLayer(
      " more furniture (collide)",
      tilesets,
      0,
      0
    );
    scene.evenMoreFurnitureLayer = scene.map.createLayer(
      "even more furniture (no collide)",
      tilesets,
      0,
      0,
    );
    scene.stuffOnTopLayer = scene.map.createLayer("stuff on top", tilesets, 0, -10);


    scene.wallsLayer.setCollisionByProperty({ collides: true });
    scene.backFurnitureLayer.setCollisionByProperty({ collides: true });
    scene.furnitureLayer.setCollisionByProperty({ collides: true });
    scene.moreFurnitureLayer.setCollisionByProperty({ collides: true });


    // TASKS
    scene.specialComputer = scene.map.createFromObjects('special computer')[0];
    scene.studyDesk = scene.map.createFromObjects('study desk')[0];
    scene.pinpongTable = scene.map.createFromObjects('pingpong table')[0];
    scene.pinpongTable.y = scene.pinpongTable.y + 90;
    scene.specialComputer.y = scene.specialComputer.y + 40;
    scene.studyDesk.y = scene.studyDesk.y + 40;
    console.log('got pingpong table 5: ', scene.pinpongTable);

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
      const { roomId, players, numPlayers, credits } = state;
      scene.physics.resume();

      // STATE
      scene.state.roomId = roomId;
      scene.state.players = players;
      scene.state.numPlayers = numPlayers;
      scene.state.credits = credits;
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

          let nametag = otherPlayer.nametag;
          nametag.x = playerInfo.x;
          nametag.y = playerInfo.y-45;
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
          otherPlayer.nametag.destroy();
        }
      });
    });
    this.cursors = this.input.keyboard.createCursorKeys();

    scene.socket.emit("joinRoom", "tfdl", name);
  }

  update() {
    const scene = this;
    if (scene.astronaut) {
      if (!scene.astronaut.body) {
        return;
      }
      const prevVelocity = scene.astronaut.body.velocity.clone();
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

        const { x, y } = scene.astronaut.body.position;
        if (y >= 540 && x >= 768 && x <= 820 && !this.isTransitioning) {
          this.isTransitioning = true;
          this.socket.disconnect();
          scene.scene.stop("TFDL");
          scene.scene.transition({
            target: "MacHall",
            duration: 0,
            data: scene.astronaut.nametag.text,
            moveAbove: true,
          });
          console.log("Leaving TFDL");
        }
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

      scene.astronaut.nametag.x = scene.astronaut.x;
      scene.astronaut.nametag.y = scene.astronaut.y-45;

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

    // CONTROL PANEL OVERLAP
    if (scene.astronaut) {
      this.physics.add.overlap(
        scene.astronaut,
        scene.pinpongTable,
        scene.highlightControlPanel,
        null,
        this
      );
      this.physics.add.overlap(
        scene.astronaut,
        scene.specialComputer,
        scene.highlightControlPanel,
        null,
        this
      );
      this.physics.add.overlap(
        scene.astronaut,
        scene.studyDesk,
        scene.highlightControlPanel,
        null,
        this
      );
      //CONTROL PANEL: NOT OVERLAPPED
      PPMain.checkOverlap(
        PPMain,
        PPMain.astronaut,
        PPMain.pinpongTable,
        "PPMain"
      );
      scene.checkOverlap(
        scene,
        scene.astronaut,
        scene.specialComputer,
        "TaskScene"
      );
      scene.checkOverlap(
        scene,
        scene.astronaut,
        scene.studyDesk,
        "Idle"
      );
    }

  }
}
