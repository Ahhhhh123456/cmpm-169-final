class Game extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }


    create() {
        
        document.getElementById('description').innerHTML = '<h2>Game.js</h2>  <h2><b>CMPM 169 - Surfer Game</b> </h2>';
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}