// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 800,
    height: 960,
    scene: [Load, Game]

}

var cursors;
const SCALE = 2.0;
var my = {sprite: {}, text: {}, vfx: {}};

const game = new Phaser.Game(config);