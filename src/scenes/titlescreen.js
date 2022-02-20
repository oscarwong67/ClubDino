import Phaser from 'phaser'
import WebFontFile from './webfont'
import {Ppong } from '../const/scenekeys'

export default class TitleScreen extends Phaser.Scene{
  preload(){ 
    const fonts = new WebFontFile(this.load,"Press Start 2P");
    this.load.addFile(fonts);
    
  }

  create(){
    this.scene.bringToTop();
    const title = this.add.text(528,270, 'Ping Pong', {
      fontSize: 69,
      fontFamily: '"Press Start 2P"'
    })
    title.setOrigin(0.5,0.5)

    this.add.text(528, 365, 'Press Space to Play', {
      fontSize: 24,
      fontFamily: '"Press Start 2P"'
      
    })
    .setOrigin(0.5)

    this.input.keyboard.once('keydown-SPACE', ()=> {
      this.scene.start(Ppong);
    })
    
  }
}

