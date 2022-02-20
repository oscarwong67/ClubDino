
import Phaser from 'phaser'
// import TitleScreen from './titlescreen'
// import Ppong from "./ppong"
// import GameBackground from './background'
// import GameOver from './gameover'

import * as SceneKeys from '../const/scenekeys'

export default class PPMain extends Phaser.Scene{
  constructor(){
    super("PPMain");
  }

  create(prevscene) {
    this.scene.setVisible(true)
    this.scene.bringToTop();
    this.prevscene = prevscene;

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
    console.log("HERE")

    // const game = new Phaser.Game(config);

    this.quitButton = this.add.text(1000, 10, "quit", {
      fontSize: 15,
      backgroundColor: "#232323",
      color: "#FFFFFF",
      padding: 10,
      align: "center"
    }).setOrigin(0.5, 0).setInteractive();
    this.quitButton.on('pointerup', function(){
      // this.scene.scene.sendToBack('SpaceInvaders');
      this.scene.scene.stop(SceneKeys.TitleScreen);
      this.scene.scene.stop(SceneKeys.GameBackground);
      this.scene.scene.stop(SceneKeys.GameOver);
      this.scene.scene.stop(SceneKeys.Ppong);
      this.scene.scene.setVisible(false);
      
      this.scene.prevscene.scene.physics.resume();
      // this.scene.prevscene.scene.creditsText.text = `Dino Creds: ${credits + 10}`;
    })

    const scene = this;
    const escQuit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escQuit.on('down', function(){
      scene.scene.stop(SceneKeys.TitleScreen);
      scene.scene.stop(SceneKeys.GameBackground);
      scene.scene.stop(SceneKeys.GameOver);
      scene.scene.stop(SceneKeys.Ppong);
      scene.scene.setVisible(false);
      
      scene.prevscene.scene.physics.resume();
    })


    // Title Screen First
    this.cameras.main.setBackgroundColor("#00b300");
    this.physics.world.setBounds(4, 22, 1000, 600);

    this.scene.launch(SceneKeys.TitleScreen, {scene: this});
  }



}