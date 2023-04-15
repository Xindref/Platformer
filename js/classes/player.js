class Player extends Sprite {
    constructor({ position, collisionBlocks, platformCollisionBlocks, imageSrc, frameRate, scale = 0.5, animations }) {
        super({ imageSrc, frameRate, scale });
        this.position = position;
        this.velocity = {
            x: 0,
            y: 1
        }
        this.speed = 2;
        this.jumpHeight = -4;
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 10,
            height: 10
        }
        this.animations = animations;
        this.lastDirection = 'right';
        this.isJumping = false;

        for (let key in this.animations) {
            const image = new Image();
            image.src = this.animations[key].imageSrc;

            this.animations[key].image = image;
        }

        this.cameraBox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 200,
            height: 80,
        }
    }

    switchSprite(key) {
        if (this.image === this.animations[key].image || !this.loaded) return;

        this.currentFrame = 0;
        this.image = this.animations[key].image;
        this.frameBuffer = this.animations[key].frameBuffer;
        this.frameRate = this.animations[key].frameRate;
    }

    updateCameraBox() {
        this.cameraBox = {
            position: {
                x: this.position.x - 50,
                y: this.position.y,
            },
            width: 200,
            height: 80,
        }
    }

    checkForEdgeCollision() {
        if (this.hitbox.position.x + this.hitbox.width + this.velocity.x >= 576 ||
            this.hitbox.position.x + this.velocity.x <= 0) {
            this.velocity.x = 0;
        }
    }

    shouldPanCameraLeft({ canvas, camera }) {
        const cameraBoxRightSide = this.cameraBox.position.x + this.cameraBox.width;
        const scaledDownCanvasWidth = canvas.width / 4;

        if (cameraBoxRightSide >= 576) return;
        if (cameraBoxRightSide >= scaledDownCanvasWidth + Math.abs(camera.position.x)) {
            camera.position.x -= this.velocity.x;
        }
    }

    shouldPanCameraRight({ canvas, camera }) {
        if (this.cameraBox.position.x <= 0) return;

        if (this.cameraBox.position.x <= Math.abs(camera.position.x)) {
            camera.position.x -= this.velocity.x;
        }
    }

    shouldPanCameraDown({ canvas, camera }) {
        if (this.cameraBox.position.y + this.velocity.y <= 0) return;

        if (this.cameraBox.position.y <= Math.abs(camera.position.y)) {
            camera.position.y -= this.velocity.y;
        }
    }

    shouldPanCameraUp({ canvas, camera, backgroundImageHeight }) {
        const scaledCanvasHeight = canvas.height / 4;

        if (this.cameraBox.position.y + this.cameraBox.height + this.velocity.y >= backgroundImageHeight) return;

        if (this.cameraBox.position.y + this.cameraBox.height >= Math.abs(camera.position.y) + scaledCanvasHeight) {
            camera.position.y -= this.velocity.y;
        }
    }

    update() {
        this.updateFrames();
        this.updateHitbox();
        this.updateCameraBox();
        this.draw();

        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.checkForHorizontalCollisions();
        this.applyGravity();
        this.updateHitbox();
        this.checkForVerticalCollisions();
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x + 35,
                y: this.position.y + 26,
            },
            width: 14,
            height: 27
        }
    }

    checkForHorizontalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];

            if (
                collision({
                    object1: this.hitbox,
                    object2: collisionBlock
                })
            ) {
                if (this.velocity.x > 0) {
                    this.velocity.x = 0;

                    const offset = this.hitbox.position.x - this.position.x + this.hitbox.width;

                    this.position.x = collisionBlock.position.x - offset - 0.01;
                    break;
                }
                if (this.velocity.x < 0) {
                    this.velocity.x = 0;

                    const offset = this.hitbox.position.x - this.position.x;

                    this.position.x = collisionBlock.position.x + collisionBlock.width - offset + 0.01;
                    break;
                }
            }
        }
    }

    applyGravity() {
        this.velocity.y += gravity;
        this.position.y += this.velocity.y;
    }

    checkForVerticalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];

            if (
                collision({
                    object1: this.hitbox,
                    object2: collisionBlock
                })
            ) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                    this.isJumping = false;

                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;

                    this.position.y = collisionBlock.position.y - offset - 0.01;
                    break;
                }
                if (this.velocity.y < 0) {
                    this.velocity.y = 0;

                    const offset = this.hitbox.position.y - this.position.y;

                    this.position.y = collisionBlock.position.y + collisionBlock.height - offset + 0.01;
                    break;
                }
            }
        }

        // platform collision
        for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
            const platformCollisionBlock = this.platformCollisionBlocks[i];

            if (
                platformCollision({
                    object1: this.hitbox,
                    object2: platformCollisionBlock
                })
            ) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                    this.isJumping = false;

                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;

                    this.position.y = platformCollisionBlock.position.y - offset - 0.01;
                    break;
                }
            }
        }
    }
}