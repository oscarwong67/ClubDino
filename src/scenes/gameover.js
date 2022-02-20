import Phaser from 'phaser'

import { TitleScreen } from '../const/scenekeys'

export default class GameOver extends Phaser.Scene {
  
  create(data){
    this.scene.bringToTop();
    let endTitle = 'Game Over'
    if (data.leftScore > data.rightScore){
      endTitle = 'You Win!!!'
    }

    this.add.text(528,270, endTitle, {
      fontSize: 69,
      fontFamily: '"Press Start 2P"'
    })
    .setOrigin(0.5)
 
    this.add.text(528,365, 'Space to Continue (Esc to Exit)', {
      fontSize: 22,
      fontFamily: '"Press Start 2P"'
    })
    .setOrigin(0.5)

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start(TitleScreen)
    })
    // Exit scene to TFDL
    // this.input.keyboard.once('keydown-ESC', () => {
    //   this.scene.start(TFDLSCENE)
    // })
  }
}