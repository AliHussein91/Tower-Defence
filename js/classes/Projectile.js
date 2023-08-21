class Projectile extends Sprite {
    constructor({ position = { x: 0, y: 0 }, enemy }) {
        super({
            position,
            imgSrc: "img/projectile.png",
            frames: { max: 1 },
            offset: { x: -21, y: -112 },
        });
        this.velocity = {
            x: 0,
            y: 0,
        };
        this.enemy = enemy;
        this.speed = 4;
        this.radius = 10;
    }

    update() {
        this.draw();
        super.update()
        const xDistance = this.enemy.center.x - this.position.x;
        const yDistance = this.enemy.center.y - this.position.y;
        const angle = Math.atan2(yDistance, xDistance);

        this.velocity.x = Math.cos(angle);
        this.velocity.y = Math.sin(angle);

        this.position.x += this.velocity.x * this.speed;
        this.position.y += this.velocity.y * this.speed;
    }
}
