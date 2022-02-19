import Phaser from "phaser";

export default class TFDL extends Phaser.Scene {
  constructor() {
    super("TFDL");
  }  

  init() {
    // socket
    this.socket = io();
  }

  create() {
    const text = this.add.text(400, 250, 'Hello World!');
    text.setOrigin(0, 0);
  }
}