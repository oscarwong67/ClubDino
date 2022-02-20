
import Phaser from 'phaser'
import WebFontFile from './webfont'

export default class SpaceInvadersStart extends Phaser.Scene{
  constructor(){
    super("SpaceInvadersStart");
  }

  preload(){ 
    const fonts = new WebFontFile(this.load,"Press Start 2P");
    this.load.addFile(fonts);
    
  }

  create(prevscene) {
    this.scene.setVisible(true)
    this.scene.bringToTop();
    this.prevscene = prevscene;

    const title = this.add.text(528,270, 'SPACE INVADERS', {
      fontSize: 69,
      fontFamily: '"Press Start 2P"'
    })
    title.setOrigin(0.5,0.5)

    const starttext = this.add.text(528, 365, 'Press Space to Play', {
      fontSize: 24,
      fontFamily: '"Press Start 2P"'
      
    })
    .setOrigin(0.5)

    this.input.keyboard.once('keydown-SPACE', ()=> {
      this.scene.launch('SpaceInvaders', {scene: scene});
      title.setVisible(false);
      starttext.setVisible(false);
    })

    this.quitButton = this.add.text(1000, 10, "quit", {
      fontSize: 15,
      backgroundColor: "#232323",
      color: "#FFFFFF",
      padding: 10,
      align: "center"
    }).setOrigin(0.5, 0).setInteractive();
    this.quitButton.on('pointerup', function(){
      // this.scene.scene.sendToBack('SpaceInvaders');
      this.scene.scene.stop('SpaceInvaders');
      this.scene.scene.stop();
      this.scene.scene.setVisible(false);
      
      this.scene.prevscene.scene.physics.resume();
      // this.scene.prevscene.scene.creditsText.text = `Dino Creds: ${credits + 10}`;
    })

    const scene = this;
    const escQuit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escQuit.on('down', function(){
      scene.scene.stop('SpaceInvaders');
      scene.scene.stop();
      scene.scene.setVisible(false);
      
      scene.prevscene.scene.physics.resume();
    })


    // Title Screen First
    this.cameras.main.setBackgroundColor("#000");
    this.physics.world.setBounds(4, 22, 1000, 600);
  }



}