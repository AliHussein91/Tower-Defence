// Canvas initialization
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 768;

c.fillStyle = "white";
c.fillRect(0, 0, canvas.width, canvas.height);

// Game status data

let level = 0,
    maxLevel = 1,
    wave = 0,
    hearts = 10,
    coins = 100,
    waveHealth = 1,
    buildingPrice = 50,
    coinsEarnedPerKill = 10,
    initialEnemiesCount = 5,
    placementTiles = [],
    buildings = [];
enemies = [];

// Loading a background image to the canvas
const map = new Image();
function nextLevel() {
    map.onload = () => {
        animate();
    };
    map.src = `img/levels/${level + 1}.png`;

    // Converting the 1D tiles map to a 2D tiles array map
    const placementTilesData2D = [];
    for (let i = 0; i < LevelsTileData[level].length; i += 20) {
        placementTilesData2D.push(LevelsTileData[level].slice(i, i + 20));
    }
    // Clearing Tiles and Buildings from previous level
    placementTiles = [];
    buildings = [];
    enemies = [];
    // Create the placement tiles positions array map
    placementTilesData2D.forEach((row, y) => {
        row.forEach((symbol, x) => {
            if (symbol === 14) {
                placementTiles.push(
                    new Tile({
                        position: {
                            x: x * 64,
                            y: y * 64,
                        },
                    })
                );
            }
        });
    });
}

nextLevel();

const explosions = [];

let activeTile = undefined;
const mouse = {
    x: undefined,
    y: undefined,
};

// Instantiating enemies and addign them to the enemies array and keeping track of the wave number
function spawnEnemies(count) {
    for (let i = 1; i <= count; i++) {
        const xOffset = 150 * i,
            yOffset = 150 * i;

        if (waypoints[level].start === "left") {
            enemies.push(
                new Enemy({
                    position: {
                        x: waypoints[level].path[0].x - xOffset,
                        y: waypoints[level].path[0].y,
                    },
                })
            );
        } else if (waypoints[level].start === "top") {
            enemies.push(
                new Enemy({
                    position: {
                        x: waypoints[level].path[0].x,
                        y: waypoints[level].path[0].y - yOffset,
                    },
                })
            );
        }
    }
    wave++;
}

spawnEnemies(initialEnemiesCount);

// Animating the game
function animate() {
    // Starting screen animation and recording the animation ID
    const animationId = window.requestAnimationFrame(animate);

    if (wave === 2 && level < maxLevel) {
        window.cancelAnimationFrame(animationId);
        wave = 0;
        level++;
        nextLevel();
    }

    // Drawing the level map as a background
    c.drawImage(map, 0, 0);

    // Updating the resources on the player display
    const heartCount = document.querySelector("#hearts");
    heartCount.innerHTML = hearts;
    const coinsCount = document.querySelector("#coins");
    coinsCount.innerHTML = coins;

    // Drawing enemies and updating them on the map
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();

        // Removing enemies outside the canvas rignt side
        if (enemy.position.x > canvas.width) {
            enemies.splice(i, 1);

            // Decreasing the player lives by the amound to enemies raching the end of the screen
            hearts--;

            // Ending the game with if the player lost all the available lives
            if (hearts === 0) {
                cancelAnimationFrame(animationId);
                document.querySelector(".game-over").style.display = "flex";
            }
        }
    }

    // Spawning a new wave of enemies when first wave ends
    if (enemies.length === 0) {
        initialEnemiesCount = 5;
        initialEnemiesCount = Math.round(
            initialEnemiesCount * (1 + Math.random())
        );
        spawnEnemies(initialEnemiesCount);
    }

    // Drawing the explosion effect
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.draw();
        explosion.update();

        // Removing the explosion effect from the map after animation is complete
        if (explosion.frames.current >= explosion.frames.max - 1) {
            explosions.splice(i, 1);
        }
    }

    // Animating tiles eligible for building
    placementTiles.forEach((tile) => {
        tile.update(mouse);
    });

    // Drawing and animating buildings
    buildings.forEach((building) => {
        building.update();

        // Filtering enemies array to define eligible target for the building
        building.target = null;
        const validEnemies = enemies.filter((enemy) => {
            const xDifferance = enemy.center.x - building.center.x;
            const yDifferance = enemy.center.y - building.center.y;
            const distance = Math.hypot(xDifferance, yDifferance);

            return distance < enemy.radius + building.radius ? true : false;
        });

        // Targetting the first enemy in the eligible enemies array
        building.target = validEnemies[0];

        // Drawing and updating the building projectiles
        for (let i = building.projectiles.length - 1; i >= 0; i--) {
            const projectile = building.projectiles[i];
            projectile.update();

            // Collision detection for the projectile and the enemy
            const xDifferance =
                projectile.enemy.center.x - projectile.position.x;
            const yDifferance =
                projectile.enemy.center.y - projectile.position.y;
            const distance = Math.hypot(xDifferance, yDifferance);

            // Creating explosion effect on Collision
            if (distance < projectile.enemy.radius + projectile.radius) {
                explosions.push(
                    new Sprite({
                        position: {
                            x: projectile.position.x,
                            y: projectile.position.y,
                        },
                        imgSrc: "img/explosion.png",
                        frames: { max: 4 },
                        offset: {
                            x: -21,
                            y: -112,
                        },
                    })
                );

                // Removing projectile after collision and decreasing enemy health
                building.projectiles.splice(i, 1);
                projectile.enemy.health -= 20;

                // Removing enemy if health is down to zero and increasing coins
                if (projectile.enemy.health <= 0) {
                    // Increasing coins when killing an enemy
                    coins += coinsEarnedPerKill;
                    const enemyIndex = enemies.findIndex((enemy) => {
                        return projectile.enemy === enemy;
                    });

                    if (enemyIndex > -1) {
                        enemies.splice(enemyIndex, 1);
                    }
                }
            }
        }
    });
}

// Tracking mouse movement over eligible tile for placing a building
window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    activeTile = null;
    for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i];
        if (
            mouse.x > tile.position.x &&
            mouse.x < tile.position.x + tile.size * 2 &&
            mouse.y > tile.position.y &&
            mouse.y < tile.position.y + tile.size
        ) {
            activeTile = tile;
            break;
        }
    }
});

// Tracking mouse click to place a building if eligible
canvas.addEventListener("click", (event) => {
    if (activeTile && !activeTile.occupied && coins - buildingPrice >= 0) {
        coins -= buildingPrice;
        buildings.push(
            new Building({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y,
                },
            })
        );
        activeTile.occupied = true;
        buildings.sort((a, b) => {
            return a.position.y - b.position.y;
        });
    }
});
