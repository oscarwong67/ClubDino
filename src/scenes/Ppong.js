import Phaser from 'phaser'
import WebFontFile from './webfont'

import { GameBackground, GameOver} from '../const/scenekeys'


const GameState = {
  Running:'running',
  PlayerWon:'player-won',
  aIWon:'ai-won'
}

class Ppong extends Phaser.Scene {

  init(){
    this.gameState= GameState.Running;
    this.paddleRightVelocity = new Phaser.Math.Vector2(0,0);
    this.leftScore = 0;
    this.rightScore = 0;
  
    this.gameOver = false;
  }
 
  preload(){
    
    this.load.image('paddle', './const/paddle.jpg')
    const fonts = new WebFontFile(this.load,"Press Start 2P");
    this.load.addFile(fonts);
  }

  create(){
    this.scene.bringToTop();
    this.scene.run(GameBackground);
    this.scene.sendToBack(GameBackground);
    
    // WORLD BOUNDARIES MATCH GAME SIZE
    this.physics.world.setBounds(0, 0, 1056, 608);

    // Ball
    this.ball = this.add.circle(400,250,10, 0xffffff, 1);
    this.physics.add.existing(this.ball);
    this.ball.body.setBounce(1,0.5);
    this.ball.body.setCircle(10);
    this.ball.body.setCollideWorldBounds(true,1,1);

    this.resetBall();

    // Main player paddle
    this.paddleLeft = this.add.rectangle(50, 279, 30,100,0xE64522,1);
    this.physics.add.existing(this.paddleLeft,true);
    this.physics.add.collider(this.paddleLeft, this.ball);
    
    // Right Paddle (bot?)
    this.paddleRight = this.add.rectangle(1006, 279, 30,100,0x0F0F0F,1);
    this.physics.add.existing(this.paddleRight, true);
    this.physics.add.collider(this.paddleRight, this.ball);

    // Score
    const scoreStyle = {
      fontSize: 35,
      fontFamily: '"Press Start 2P"'
    }

    this.leftScoreLabel = this.add.text(352,25,'0', scoreStyle).setOrigin(0.5,0,5);
    this.rightScoreLabel = this.add.text(704,25,'0', scoreStyle).setOrigin(0.5,0,5);

    this.cursors = this.input.keyboard.createCursorKeys();

    // Time delay from start screen
    this.time.delayedCall(1250, () => {
      this.resetBall()
    })
  }

  update(){
    if (this.gameState !== 'running') {
      return
    }

    this.playerInput()
    this.updateAI()
    this.checkScore()
    // this.checkOutOfBounds()

  }
  // Move play paddle
    playerInput() {
      const body = this.paddleLeft.body;

      if (this.cursors.up.isDown && this.paddleLeft.y > 50) {
        this.paddleLeft.y-=10;
        body.updateFromGameObject();
      } 
      else if (this.cursors.down.isDown && this.paddleLeft.y < 558) {
        this.paddleLeft.y+=10;
        body.updateFromGameObject();
      }
    }
    
    // Move AI paddle
    updateAI() {
      const diff = this.ball.y - this.paddleRight.y;
      if (Math.abs(diff) < 10) {
        return;
      }
      // AI speed relative to ball
      const aiSpeed = 1.5;
      // ball above bot paddle
      if (diff <0) {
        this.paddleRightVelocity.y = -aiSpeed;
        if(this.paddleRightVelocity.y < -10) {
          this.paddleRightVelocity.y = -10;
        }
      } 
      // ball above below paddle
      else if (diff > 0){
        this.paddleRightVelocity.y = aiSpeed;
        if (this.paddleRightVelocity.y > 10 && this.paddleRight.y < 558) {
          this.paddleRightVelocity.y = 10;
        }
      }
      this.paddleRight.y += 2*this.paddleRightVelocity.y;
      this.paddleRight.body.updateFromGameObject();
    }
    

    checkScore() {
      const x = this.ball.x;
      const leftBounds = 20, rightBounds = 1036;
    
      if (x >= leftBounds && x <= rightBounds) {
        return
      }

      // Scoring boundaries
      if(this.ball.x < leftBounds) {
        
        this.incrementRightScore();
      } 
      else if (this.ball.x > rightBounds) {
    
        this.incrementLeftScore();
      }

      // End game if max score reached
      const maxScore = 7;
      if (this.leftScore >= maxScore) {
        
        this.gameState = GameState.PlayerWon;
      }
      else if (this.rightScore >= maxScore){
        
        this.gameState = GameState.aIWon;
      }

      if (this.gameState === GameState.Running){
        this.resetBall();
      }

      // Game over screen
      else {
        this.ball.active = false;
        this.physics.world.remove(this.ball.body);

        this.scene.stop(GameBackground);

        this.scene.start(GameOver, {
          leftScore: this.leftScore,
          rightScore: this.rightScore
        })
      }
    }

    // Increment Scores and reset
    incrementLeftScore() {
      this.leftScore+=1;
      this.leftScoreLabel.text = this.leftScore;
    }
    incrementRightScore() {
      this.rightScore+=1;
      this.rightScoreLabel.text = this.rightScore;
    }
    // Reset after out of bounds or you score
    resetBall() {
      this.ball.setPosition(528,300);

      const angle = Phaser.Math.Between(0, 360);
      const vec = this.physics.velocityFromAngle(angle,200);
  
      this.ball.body.setVelocity(vec.x*5,vec.y*1.3);
  
    }

}

export default Ppong

