import Phaser from 'phaser'

export default class GameBackground extends Phaser.Scene {
  preload() {

  }

  create() {
    const white = 0xffffff;
    this.add.line(528,304, 0, 0, 0, 608, white,1).setOrigin(0.5,0.5).setLineWidth(5,5);
    this.add.line(528,304, 0, 0, 1056, 0, white,1).setOrigin(0.5,0.5).setLineWidth(3,3);
  }
}