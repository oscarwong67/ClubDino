/** @type {import("../typings/phaser")} */
/* The above loads the phaser.d.ts file so that VSCode has autocomplete for the Phaser API.
If you experience problems with autocomplete, try opening the phaser.d.ts file and scrolling up and down in it.
That may fix the problem -- some weird quirk with VSCode. A new typing file is released with
every new release of Phaser. Make sure it's up-to-date!

At some point, the typings will
be officially added to the official release so that all you'll have to do is do:

npm install @types/phaser

But this hasn't happened yet!
*/

import Phaser from 'phaser';
import config from "./config/config";
import TaskScene from './scenes/taskScene';
import TFDL from './scenes/tfdl';
import MacHall from './scenes/machall';
import Start from "./scenes/start";
import Idle from './scenes/idle';
import PPMain from './scenes/ppmain';


class Game extends Phaser.Game {
  constructor() {
    // Add the config file to the game
    super(config);
    // Add all the scenes
    // << ADD ALL SCENES HERE >>
    this.scene.add("TFDL", TFDL)
    this.scene.add("Start", Start)
    this.scene.add("MacHall", MacHall);
    this.scene.add("TaskScene", TaskScene);
    this.scene.add("Idle", Idle);

    // Ping pong controller scene
    this.scene.add("PPMain",PPMain);

    // Start the game with the mainscene
    // << START GAME WITH MAIN SCENE HERE >>
    this.scene.start("Start");
  }
}
// Create new instance of game
window.onload = function () {
  window.game = new Game();
};