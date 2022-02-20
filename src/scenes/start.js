import Phaser from "phaser";

export default class Start extends Phaser.Scene {
  constructor() {
    super("Start");

  }

  preload() {
    this.load.atlas(
      "amelia_idle",
      "assets/spritesheets/amelia_idle.png",
      "assets/spritesheets/amelia_idle.json"
    );
    this.load.html("usernameInput", "start.html");
  }

  init () {

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
  }

  create() {
    this.prepareCharacterAnimation();
    const scene = this;

    this.textInput = this.add.dom(this.cameras.main.width/2, 600).createFromCache("usernameInput").setOrigin(0.5);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on("down", event => {
      let chatbox = this.textInput.getChildByName("usernameInput");
      if (chatbox.value != "") {
        this.scene.transition({target: 'TFDL', duration: 0, data: chatbox.value})
      }
    });
    scene.add.sprite(this.cameras.main.width/2,500,"amelia_idle","idle-down-00").setOrigin(0.5)
  }
}