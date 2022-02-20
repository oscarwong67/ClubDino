
import Phaser from 'phaser'
import TitleScreen from './scenes/titlescreen'
import Ppong from "./scenes/ppong"
import GameBackground from './scenes/background'
import GameOver from './scenes/gameover'

import * as SceneKeys from './const/scenekeys'

const config = {
  width:1056,
  height:608,
  type: Phaser.AUTO,
  backgroundColor: '#00b300',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y:0}
    }
  }
  
};

const game = new Phaser.Game(config);

// Title Screen First
game.scene.add(SceneKeys.TitleScreen,TitleScreen);

game.scene.add(SceneKeys.Ppong, Ppong);


game.scene.add(SceneKeys.GameBackground, GameBackground);
game.scene.add(SceneKeys.GameOver, GameOver);

game.scene.start(SceneKeys.TitleScreen);

