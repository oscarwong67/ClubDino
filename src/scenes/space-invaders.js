import Phaser from "phaser";

export default class SpaceInvaders extends Phaser.Scene {
  constructor() {
    super("SpaceInvaders");

    this.left;
    this.right;

    this.ship;

    this.invaders;
    this.mothership;
    this.bullet;

    this.topLeft;
    this.bottomRight;

    this.bulletTimer;
    this.mothershipTimer;

    this.isGameOver = false;

    this.invadersBounds = { x: 12, y: 64, right: 1000 };
  }

  preload() {
    this.load.image("invaders.boom", "assets/invaders/boom.png");
    this.load.spritesheet("invaders.bullet", "assets/invaders/bullet.png", {
      frameWidth: 12,
      frameHeight: 14,
    });
    this.load.image("invaders.bullet2", "assets/invaders/bullet2.png");
    this.load.image("invaders.explode", "assets/invaders/explode.png");
    this.load.spritesheet("invaders.invader1", "assets/invaders/invader1.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("invaders.invader2", "assets/invaders/invader2.png", {
      frameWidth: 22,
      frameHeight: 16,
    });
    this.load.spritesheet("invaders.invader3", "assets/invaders/invader3.png", {
      frameWidth: 24,
      frameHeight: 16,
    });
    this.load.image("invaders.mothership", "assets/invaders/mothership.png");
    this.load.image("invaders.ship", "assets/invaders/ship.png");
  }

  create(prevscene) {
    this.scene.setVisible(true)
    this.scene.bringToTop();
    this.prevscene = prevscene;
    this.anims.create({
      key: "bullet",
      frames: this.anims.generateFrameNumbers("invaders.bullet"),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "invader1",
      frames: this.anims.generateFrameNumbers("invaders.invader1"),
      frameRate: 2,
      repeat: -1,
    });

    this.anims.create({
      key: "invader2",
      frames: this.anims.generateFrameNumbers("invaders.invader2"),
      frameRate: 2,
      repeat: -1,
    });

    this.anims.create({
      key: "invader3",
      frames: this.anims.generateFrameNumbers("invaders.invader3"),
      frameRate: 2,
      repeat: -1,
    });

    this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.right = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    );

    const scene = this;
    
    this.quitButton = this.add.text(1000, 10, "quit", {
      fontSize: 15,
      backgroundColor: "#232323",
      color: "#FFFFFF",
      padding: 10,
      align: "center"
    }).setOrigin(0.5, 0).setInteractive();
    this.quitButton.on('pointerup', function(){
      // this.scene.scene.sendToBack('SpaceInvaders');
      console.log(scene)
      this.scene.scene.stop();
      this.scene.scene.setVisible(false);
      
      this.scene.prevscene.scene.physics.resume();
      // this.scene.prevscene.scene.creditsText.text = `Dino Creds: ${credits + 10}`;
    })

    this.physics.world.setBounds(4, 22, 1000, 600);

    this.cameras.main.setBackgroundColor("#000");

    this.createInvaders();

    this.bullet = this.physics.add.image(200, 290, "invaders.bullet2");

    this.mothership = this.physics.add.image(1100, 40, "invaders.mothership");

    this.ship = this.physics.add.image(400, 500, "invaders.ship");

    this.ship.setCollideWorldBounds(true);

    this.physics.add.overlap(
      this.bullet,
      this.invaders,
      this.bulletHit,
      null,
      this
    );
    this.physics.add.overlap(
      this.bullet,
      this.mothership,
      this.bulletHitMothership,
      null,
      this
    );

    this.launchBullet();

    this.mothershipTimer = this.time.addEvent({
      delay: 10000,
      callback: this.launchMothership,
      callbackScope: this,
      repeat: -1,
    });

    this.invaders.setVelocityX(50);
  }


  launchMothership() {
    this.mothership.setVelocityX(-100);
  }

  bulletHit(bullet, invader) {
    this.launchBullet();

    invader.body.enable = false;

    this.invaders.killAndHide(invader);

    this.refreshOutliers();
  }

  bulletHitMothership(bullet, mothership) {
    this.launchBullet();

    this.mothership.body.reset(1100, 40);
  }

  refreshOutliers() {
    var list = this.invaders.getChildren();

    var first = this.invaders.getFirst(true);
    var last = this.invaders.getLast(true);

    for (var i = 0; i < list.length; i++) {
      var vader = list[i];

      if (vader.active) {
        if (vader.x < first.x) {
          first = vader;
        } else if (vader.x > last.x) {
          last = vader;
        }
      }
    }

    this.topLeft = first;
    this.bottomRight = last;
  }

  launchBullet() {
    this.bullet.body.reset(this.ship.x, this.ship.y);

    this.bullet.body.velocity.y = -400;
  }

  createInvaders() {
    this.invaders = this.physics.add.group();

    var x = this.invadersBounds.x;
    var y = this.invadersBounds.y;

    for (var i = 0; i < 20; i++) {
      this.invaders
        .create(x, y, "invaders.invader1")
        .setTint(0xff0000)
        .play("invader1");

      x += 26;
    }

    x = this.invadersBounds.x;
    y += 28;

    for (var i = 0; i < 32; i++) {
      this.invaders
        .create(x, y, "invaders.invader2")
        .setTint(0x00ff00)
        .play("invader2");

      x += 33;

      if (i === 15) {
        x = this.invadersBounds.x;
        y += 28;
      }
    }

    x = this.invadersBounds.x;
    y += 28;

    for (var i = 0; i < 28; i++) {
      this.invaders
        .create(x, y, "invaders.invader3")
        .setTint(0x00ffff)
        .play("invader3");

      x += 38;

      if (i === 13) {
        x = this.invadersBounds.x;
        y += 28;
      }
    }

    //  We can use these markers to work out where the whole Group is and how wide it is
    this.topLeft = this.invaders.getFirst(true);
    this.bottomRight = this.invaders.getLast(true);
  }

  refresh() {
    this.cameras.main.setPosition(this.parent.x, this.parent.y);

    this.scene.bringToTop();
  }

  gameOver() {
    this.invaders.setVelocityX(0);

    this.ship.setVisible(false);

    this.bullet.setVisible(false);

    this.isGameOver = true;
  }



  update() {
    if (this.isGameOver) {
      return;
    }

    if (this.left.isDown) {
      this.ship.body.velocity.x = -400;
    } else if (this.right.isDown) {
      this.ship.body.velocity.x = 400;
    } else {
      this.ship.body.velocity.x = 0;
    }

    //  Bullet bounds
    if (this.bullet.y < -32) {
      this.launchBullet();
    }

    //  Invaders bounds

    if(!this.bottomRight && !this.topLeft) {
      this.gameOver();
    }

    var moveDown = false;

    if (this.bottomRight && this.bottomRight.body.velocity.x > 0 && this.bottomRight.x >= 1000) {
      this.invaders.setVelocityX(-50);
      moveDown = true;
    } else if (this.topLeft && this.topLeft.body.velocity.x < 0 && this.topLeft.x <= 12) {
      this.invaders.setVelocityX(50);
      moveDown = true;
    }

    if (moveDown) {
      var list = this.invaders.getChildren();
      var lowest = 0;

      for (var i = 0; i < list.length; i++) {
        var vader = list[i];

        vader.body.y += 4;

        if (vader.active && vader.body.y > lowest) {
          lowest = vader.body.y;
        }
      }

      if (lowest > 240) {
        this.gameOver();
      }
    }
  }
}

SpaceInvaders.WIDTH = 800;
SpaceInvaders.HEIGHT = 700;
