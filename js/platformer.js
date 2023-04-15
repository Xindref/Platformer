const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const scaledCanvas = {
    width: canvas.width / 4,
    height: canvas.height / 4
}

const floorCollisions2D = [];
for (let i = 0; i < floorCollisions.length; i += 36) {
    floorCollisions2D.push(floorCollisions.slice(i, i + 36));
}

const platformCollision2D = [];
for (let i = 0; i < platformCollisions.length; i += 36) {
    platformCollision2D.push(platformCollisions.slice(i, i + 36));
}

const platformCollisionBlocks = [];
platformCollision2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 202) {
            platformCollisionBlocks.push(new CollisionBlock({
                position: {
                    x: x * 16,
                    y: y * 16
                },
                height: 4,
            }));
        }
    });
});

const collisionBlocks = [];
floorCollisions2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 202) {
            collisionBlocks.push(new CollisionBlock({
                position: {
                    x: x * 16,
                    y: y * 16
                }
            }));
        }
    })
});

const gravity = 0.125;

const player = new Player({
    position: {
        x: 100,
        y: 340
    },
    collisionBlocks,
    platformCollisionBlocks,
    imageSrc: './warrior/Idle.png',
    frameRate: 8,
    animations: {
        Idle: {
            imageSrc: './warrior/Idle.png',
            frameRate: 8,
            frameBuffer: 5,
        },
        Run: {
            imageSrc: './warrior/Run.png',
            frameRate: 8,
            frameBuffer: 6,
        },
        Jump: {
            imageSrc: './warrior/Jump.png',
            frameRate: 2,
            frameBuffer: 3,
        },
        Fall: {
            imageSrc: './warrior/Fall.png',
            frameRate: 2,
            frameBuffer: 3,
        },
        FallLeft: {
            imageSrc: './warrior/FallLeft.png',
            frameRate: 2,
            frameBuffer: 3,
        },
        RunLeft: {
            imageSrc: './warrior/RunLeft.png',
            frameRate: 8,
            frameBuffer: 6,
        },
        IdleLeft: {
            imageSrc: './warrior/IdleLeft.png',
            frameRate: 8,
            frameBuffer: 5,
        },
        JumpLeft: {
            imageSrc: './warrior/JumpLeft.png',
            frameRate: 2,
            frameBuffer: 3,
        },
    }
});

const keys = {
    d: {
        pressed: false,
    },
    a: {
        pressed: false,
    }
}

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './background.png',
});

const backgroundImageHeight = 432;

const camera = {
    position: {
        x: 0,
        y: -backgroundImageHeight + scaledCanvas.height,
    },
}

let fpsInterval = 1000 / 60;
let now = 0;
let then = Date.now();
let elapsed = 0;

function animate() {
    window.requestAnimationFrame(animate);

    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval)

        c.fillStyle = 'white';
        c.fillRect(0, 0, canvas.width, canvas.height);

        c.save();
        c.scale(4, 4);
        c.translate(camera.position.x, camera.position.y);
        background.update();
        // collisionBlocks.forEach((collisionBlock) => {
        //     collisionBlock.update();
        // });
        // platformCollisionBlocks.forEach((collisionBlock) => {
        //     collisionBlock.update();
        // })

        player.checkForEdgeCollision();
        player.update();

        player.velocity.x = 0;
        if (keys.d.pressed) {
            player.switchSprite('Run');
            player.velocity.x = player.speed;
            player.lastDirection = 'right';
            player.shouldPanCameraLeft({ canvas, camera });
        }
        else if (keys.a.pressed) {
            player.switchSprite('RunLeft');
            player.velocity.x = -player.speed;
            player.lastDirection = 'left';
            player.shouldPanCameraRight({ canvas, camera })
        }
        else if (player.velocity.y === 0) {
            if (player.lastDirection === 'right') {
                player.switchSprite('Idle');
            } else {
                player.switchSprite('IdleLeft');
            }

        }

        if (player.velocity.y < 0) {
            player.shouldPanCameraDown({ camera, canvas });
            if (player.lastDirection === 'right') {
                player.switchSprite('Jump');
            } else {
                player.switchSprite('JumpLeft');
            }
        }
        else if (player.velocity.y > 0) {
            player.isJumping = true;
            player.shouldPanCameraUp({ camera, canvas, backgroundImageHeight });
            if (player.lastDirection === 'right') {
                player.switchSprite('Fall');
            } else {
                player.switchSprite('FallLeft');
            }

        }

        c.restore();
    }
}

animate();

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            break;
        case 'a':
            keys.a.pressed = true;
            break;
        case 'w':
            if (event.repeat || player.isJumping) return;
            else {
                player.isJumping = true;
                player.velocity.y = player.jumpHeight;
            }
            break;
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
    }
})