import Phaser from "phaser";

export default class TFDL extends Phaser.Scene {
  constructor() {
    super("Idle");
    this.timeRemaining = 60 * 1000;
    this.timerRunning = false;
  }

  preload() {
    this.load.image("panel", "../assets/backgrounds/panel-big.png");
  }

  create(prevscene) {
    const scene = this;
    this.add.image(525, 400, "panel");
    this.scene.setVisible(true);
    this.scene.bringToTop("Idle");
    this.prevscene = prevscene;

    const heading = scene.add
      .text(200, 200, "25 Minute Study Sessions!", {
        fontSize: 24,
        color: "#000",
        padding: 10,
        wordWrap: { width: 400 },
        align: "center",
      })
      .setOrigin(0, 0);

    this.startButton = this.add.text(200, 400, "Start!", {
      fill: "#0f0",
    });
    this.startButton
      .setInteractive()
      .on("pointerdown", () => this.startTimer());

    this.timerText = this.add.text(500, 400, `Time Remaining: 25:00`);
  }

  startTimer() {
    this.timeRemaining = 60 * 1000;
    this.cancelButton = this.add.text(200, 400, "Cancel", {
      fill: "FF0000",
    });

    this.timerRunning = true;
    this.cancelButton
      .setInteractive()
      .on("pointerdown", () => this.cancelTimer());

    this.timer = setInterval(() => {
      this.timeRemaining -= 1000;
    }, 1000);

    this.startButton.setVisible(false);
  }

  cancelTimer() {
    this.timerRunning = false;
    this.startButton.setVisible(false);
    this.timeRemaining = 60 * 1000;

    this.startButton.setVisible(true);
    this.cancelButton.setVisible(false);

     this.scene.stop();
     this.scene.setVisible(false);

    this.prevscene.scene.physics.resume();
  }

  update() {
    this.timerText.text = `Time Remaining: ${this.millisToMinutesAndSeconds(
      this.timeRemaining
    )}`;

    // CHANGE THIS
    if (this.timeRemaining === 1000 * 55) {
      this.timerText.text = `Time Remaining: 00:00`;
      if (this.timerRunning) {
        let credits = localStorage.getItem("credits");
        if (!credits) {
          credits = 0;
        } else {
          credits = parseInt(credits);
        }
        localStorage.setItem("credits", 10 + credits);
        alert(
          "You have been rewarded with 10 credits for completing a study session!"
        );

        // EXIT GAME
        this.scene.stop();
        this.scene.setVisible(false);

        this.prevscene.scene.physics.resume();
        this.prevscene.scene.creditsText.text = `Dino Creds: ${credits + 10}`;
      }
      this.timerRunning = false;
    }
  }

  millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000) + 24;
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }
}
