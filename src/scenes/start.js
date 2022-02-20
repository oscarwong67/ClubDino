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
    this.load.image("logo", "assets/ClubDinoLogo.png");
    this.load.audio('bgm', 'assets/04_sleeping_on_the_susuki_grasslands.ogg')
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
    this.bgm = this.sound.add('bgm');
    this.bgm.play({loop: true, mute: false, seek: 3000});
    this.prepareCharacterAnimation();
    const scene = this;
    this.logo = this.add.image(this.cameras.main.width/2, 200, "logo").setOrigin(0.5);
    this.textInput = this.add.dom(this.cameras.main.width/2, 600).createFromCache("usernameInput").setOrigin(0.5);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on("down", event => {
      let chatbox = this.textInput.getChildByName("usernameInput");
      if (chatbox.value != "") {
        this.scene.transition({target: 'MacHall', duration: 0, data: chatbox.value})
      }
    });
    scene.add.sprite(this.cameras.main.width/2,500,"amelia_idle","idle-down-00").setOrigin(0.5)
  }
}