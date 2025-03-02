class Game extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 350;
        this.DRAG = 20000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -750
        ;


    }

    create() {
        
        this.map = this.add.tilemap("Ocean", 64, 64, 64, 64);


        this.tileset = this.map.addTilesetImage("fishSpritesheet@2", "tilemap_tiles");

        this.Layer = this.map.createLayer("Tile Layer 1", this.tileset, 0, 0);

        this.Layer.setCollisionByProperty({
            collide: true
        });

        my.sprite.player = this.physics.add.sprite(0, 350, "platformer_characters", "tile_0000.png").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(true);

        this.physics.add.collider(my.sprite.player, this.Layer);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        document.getElementById('description').innerHTML = '<h2>Game.js</h2>  <h2><b>CMPM 169 - Surfer Game</b> </h2>';

    }

    // Never get here since a new scene is started in create()
    update() {

        // Left and right key inputs
        if(cursors.left.isDown) {

            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();

        } else if(cursors.right.isDown) {


            my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);


        } else {

            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
  
        }  

        // Jump key input
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {

            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }
    }
}