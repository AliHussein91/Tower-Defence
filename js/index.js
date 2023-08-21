const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 768;

c.fillStyle = "white";
c.fillRect(0, 0, canvas.width, canvas.height);

const map = new Image();
map.onload = () => {
    animate();
};
map.src = "img/map.png";

// Converting the 1D tiles map to a 2D tiles array map
const placementTilesData2D = [];

for (let i = 0; i < placementTilesData.length; i += 20) {
    placementTilesData2D.push(placementTilesData.slice(i, i + 20));
}

// Create the placement tiles positions array map
const placementTiles = [];
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

// Instantiating enemies and addign them to the enemies array
const enemies = [];

let enemiesCount = 5;
const explosions = [];

let hearts = 10,
    coins = 100,
    wave,
    waveHealth,
    buildingPrice = 50,
    coinsEarnedPerKill = 10;

function spawnEnemies(count) {
    for (let i = 1; i <= count; i++) {
        const xOffset = 150 * i;
        enemies.push(
            new Enemy({
                position: { x: waypoints[0].x - xOffset, y: waypoints[0].y },
            })
        );
    }
}

spawnEnemies(enemiesCount);

const buildings = [];
let activeTile = undefined;

// Animating the game
function animate() {
    const animationId = window.requestAnimationFrame(animate);
    c.drawImage(map, 0, 0);

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();

        if (enemy.position.x > canvas.width) {
            enemies.splice(i, 1);
            hearts--;

            if (hearts === 0) {
                cancelAnimationFrame(animationId);
                document.querySelector(".game-over").style.display = "flex";
            }
        }
    }
    if (enemies.length === 0) {
        enemiesCount = Math.round(enemiesCount * (1 + Math.random()));
        spawnEnemies(enemiesCount);
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.draw();
        explosion.update();

        if (explosion.frames.current >= explosion.frames.max - 1) {
            explosions.splice(i, 1);
        }
    }

    const heartCount = document.querySelector("#hearts");
    heartCount.innerHTML = hearts;
    const coinsCount = document.querySelector("#coins");
    coinsCount.innerHTML = coins;

    placementTiles.forEach((tile) => {
        tile.update(mouse);
    });

    buildings.forEach((building) => {
        building.update();
        building.target = null;
        const validEnemies = enemies.filter((enemy) => {
            const xDifferance = enemy.center.x - building.center.x;
            const yDifferance = enemy.center.y - building.center.y;
            const distance = Math.hypot(xDifferance, yDifferance);

            return distance < enemy.radius + building.radius ? true : false;
        });

        building.target = validEnemies[0];

        for (let i = building.projectiles.length - 1; i >= 0; i--) {
            const projectile = building.projectiles[i];
            projectile.update();

            const xDifferance =
                projectile.enemy.center.x - projectile.position.x;
            const yDifferance =
                projectile.enemy.center.y - projectile.position.y;
            const distance = Math.hypot(xDifferance, yDifferance);

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
                building.projectiles.splice(i, 1);
                projectile.enemy.health -= 20;
                if (projectile.enemy.health <= 0) {
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

const mouse = {
    x: undefined,
    y: undefined,
};
