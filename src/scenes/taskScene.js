import Phaser from "phaser";

export default class TaskScene extends Phaser.Scene {
  constructor() {
    super("TaskScene");
  }
  init(data) {
    this.roomId = data.roomId;
    this.players = data.players;
    this.numPlayers = data.numPlayers;
    this.socket = data.socket;
  }
  preload() {
    this.load.image("computer", "assets/backgrounds/computer.png");
  }
  create() {
    console.log('create scene');
    const scene = this;
    this.add.image(400, 320, "computer");
  }
}