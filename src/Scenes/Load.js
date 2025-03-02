class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load spritesheets
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");


        // Load images
        this.load.image("tilemap_tiles", "fishSpritesheet@2.png");

        this.load.tilemapTiledJSON("Ocean", "Ocean.tmj");

        this.load.spritesheet("tilemap_sheet", "fishSpritesheet@2.png", {
            frameWidth: 64,
            frameHeight: 64
        });


    }

    create() {
        
        this.scene.start("gameScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}