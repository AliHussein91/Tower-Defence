class Projectile {
    constructor({ position = { x: 0, y: 0 }, enemy }) {
        this.position = position;
        this.velocity = {
            x: 0,
            y: 0,
        };
        this.enemy = enemy;
        this.speed = 5;
        this.radius = 10
    }

    draw() {
        c.beginPath();
        c.fillStyle = "orange";
        c.arc(this.position.x, this.position.y, 10, 0, Math.PI * 2);
        c.fill();
    }

    update() {
        this.draw();
        const xDistance = this.enemy.center.x - this.position.x;
        const yDistance = this.enemy.center.y - this.position.y;
        const angle = Math.atan2(yDistance, xDistance);

        this.velocity.x = Math.cos(angle);
        this.velocity.y = Math.sin(angle);

        this.position.x += this.velocity.x * this.speed;
        this.position.y += this.velocity.y * this.speed;
    }
}
