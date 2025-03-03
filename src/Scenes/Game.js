class Game extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 350;
        this.DRAG = 20000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -750;

        // Game state
        this.gameOver = false;
        this.score = 0;
        this.baseTrashSpeed = 150;
        this.trashSpawnTime = 2500; // milliseconds between trash spawns
        
        // Ocean boundary
        this.oceanStartY = 448; // Row 7 * 64 pixels (where water begins)
    }

    create() {
        // Create the tilemap
        this.map = this.add.tilemap("Ocean", 64, 64, 64, 64);
        this.tileset = this.map.addTilesetImage("fishSpritesheet@2", "tilemap_tiles");
        this.Layer = this.map.createLayer("Tile Layer 1", this.tileset, 0, 0);
        this.Layer.setCollisionByProperty({
            collide: true
        });

        // Create the player
        my.sprite.player = this.physics.add.sprite(0, 350, "platformer_characters", "tile_0000.png").setScale(SCALE);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setSize(my.sprite.player.width * 0.7, my.sprite.player.height * 0.7); // Smaller hitbox
        this.physics.add.collider(my.sprite.player, this.Layer);

        // Set up trash group with physics bodies enabled
        this.trashGroup = this.physics.add.group({
            allowGravity: false,
            immovable: false
        });
        
        // Timer for spawning trash
        this.trashTimer = this.time.addEvent({
            delay: this.trashSpawnTime,
            callback: this.spawnTrash,
            callbackScope: this,
            loop: true
        });

        // Score/timer text
        my.text.scoreText = this.add.text(16, 16, 'Score: 0', { 
            fontSize: '32px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        
        // Timer event for score
        this.scoreTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateScore,
            callbackScope: this,
            loop: true
        });

        // Add collision between player and trash - THIS IS CRITICAL
        this.physics.add.collider(my.sprite.player, this.trashGroup, this.hitTrash, null, this);

        // Debug text to help verify what's happening
        this.debugText = this.add.text(16, 60, 'Debug: No collisions yet', { 
            fontSize: '18px', 
            fill: '#fff' 
        });

        // Add a visual line to show ocean boundary (for debugging)
        const oceanLine = this.add.graphics();
        oceanLine.lineStyle(2, 0x00ffff, 0.5);
        oceanLine.beginPath();
        oceanLine.moveTo(0, this.oceanStartY);
        oceanLine.lineTo(this.game.config.width, this.oceanStartY);
        oceanLine.closePath();
        oceanLine.strokePath();

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        document.getElementById('description').innerHTML = '<h2>Game.js</h2>  <h2><b>CMPM 169 - Surfer Game</b> </h2>';
        
        // Test trash spawn immediately
        this.spawnTrash();
    }
    
    // Spawn trash on the right side of the screen
    spawnTrash() {
        if (this.gameOver) return;
        
        let yPosition;
        
        // Sometimes spawn trash in the player's area (above ocean)
        // This ensures the player will encounter trash
        if (Phaser.Math.Between(0, 100) < 40) { // 40% chance to spawn in player area
            // Spawn in the air where player can jump
            yPosition = Phaser.Math.Between(100, this.oceanStartY - 50);
        } else {
            // Original ocean spawning logic
            const oceanTopY = this.oceanStartY;
            const oceanBottomY = this.game.config.height - 100;
            yPosition = Phaser.Math.Between(oceanTopY + 30, oceanBottomY);
        }
        
        // Create trash sprite with physics body
        const trash = this.physics.add.sprite(this.game.config.width + 50, yPosition, 'platformer_characters', 'tile_0013.png');
        trash.setScale(SCALE);
        
        // Set appropriate body size for collision
        trash.setSize(trash.width * 0.7, trash.height * 0.7);
        
        // Add trash to group
        this.trashGroup.add(trash);
        
        // Random speed variation for more natural movement
        const speedVariation = Phaser.Math.Between(-30, 30);
        const trashSpeed = this.baseTrashSpeed + speedVariation;
        
        // Set the velocity to move left
        trash.setVelocityX(-trashSpeed);
        
        // Add floating motion with sine wave
        trash.floatOffset = Phaser.Math.Between(0, 100);
        
        // Adjust float parameters based on whether trash is in water or air
        if (yPosition > this.oceanStartY) {
            // Underwater movement
            trash.floatSpeed = Phaser.Math.Between(0.5, 2);
            trash.floatAmplitude = Phaser.Math.Between(5, 15);
        } else {
            // In-air movement (more dynamic)
            trash.floatSpeed = Phaser.Math.Between(1, 3);
            trash.floatAmplitude = Phaser.Math.Between(2, 8);
        }
        
        trash.initialY = yPosition;
        
        // Add rotation for more dynamic movement
        const rotationSpeed = Phaser.Math.FloatBetween(-0.2, 0.2);
        trash.rotationSpeed = rotationSpeed;
        
        this.debugText.setText(`Debug: Trash spawned at y=${yPosition}`);
        
        // Auto destroy when off-screen
        trash.setData('active', true);
    }
    
    // Update score based on time survived
    updateScore() {
        if (this.gameOver) return;
        
        this.score += 1;
        my.text.scoreText.setText('Score: ' + this.score);
        
        // Increase difficulty as score increases
        if (this.score % 15 === 0) {
            this.baseTrashSpeed += 15;
            
            // Spawn trash more frequently as the game progresses
            if (this.score % 30 === 0 && this.trashSpawnTime > 1000) {
                this.trashSpawnTime -= 200;
                
                // Update the spawn timer
                this.trashTimer.remove();
                this.trashTimer = this.time.addEvent({
                    delay: this.trashSpawnTime,
                    callback: this.spawnTrash,
                    callbackScope: this,
                    loop: true
                });
            }
        }
    }
    
    // Handle collision with trash
    hitTrash(player, trash) {
        // Log collision to debug
        console.log("Collision detected between player and trash!");
        this.debugText.setText('Debug: COLLISION DETECTED!');
        
        // Game over
        this.gameOver = true;
        
        // Stop timers
        this.trashTimer.remove();
        this.scoreTimer.remove();
        
        // Stop player and trash movement
        player.setTint(0xff0000);
        player.setVelocity(0, 0);
        player.body.setAccelerationX(0);
        
        // Freeze all trash
        this.trashGroup.getChildren().forEach(item => {
            item.setVelocity(0, 0);
            item.body.allowGravity = false;
            item.body.immovable = true;
        });
        
        // Create game over text
        this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'GAME OVER', {
            fontSize: '64px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 80, 'Score: ' + this.score, {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Add restart instructions
        this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 140, 'Press R to Restart', {
            fontSize: '28px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Listen for R key to restart
        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart();
        });
    }

    update() {
        // Skip player control update if game is over
        if (this.gameOver) return;

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
        
        // Update floating trash motion
        this.trashGroup.getChildren().forEach(trash => {
            if (trash.active) {
                // Apply sine wave floating motion
                trash.y = trash.initialY + Math.sin((this.time.now / 1000 * trash.floatSpeed) + trash.floatOffset) * trash.floatAmplitude;
                
                // Apply rotation
                trash.rotation += trash.rotationSpeed / 60;
                
                // Remove if off-screen
                if (trash.x < -50) {
                    trash.destroy();
                }
            }
        });
        
        // Debug: Show player position
        this.debugText.setText(`Trash count: ${this.trashGroup.getLength()}`);
    }
}