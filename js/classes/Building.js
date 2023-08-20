class Building {
    constructor({ position = { x: 0, y: 0 } }) {
        this.postion = position;
        this.width = 64 * 2;
        this.height = 64;
        this.center = {
            x: this.postion.x + this.width / 2,
            y: this.postion.y + this.height / 2,
        };
        this.projectiles = [];
        this.radius = 250;
        this.target;
        this.frame = 0;
    }

    draw() {
        c.fillStyle = "blue";
        c.fillRect(this.postion.x, this.postion.y, this.width, this.height);

        c.beginPath();
        c.fillStyle = "rgba(255,30,80,.10)";
        c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        c.fill();
    }

    update() {
        this.draw();
        this.frame++;
        this.shoot();
    }

    shoot() {
        if (this.frame % 50 === 0 && this.target) {
            this.projectiles.push(
                new Projectile({
                    position: {
                        x: this.center.x,
                        y: this.center.y,
                    },
                    enemy: this.target,
                })
            );
        }
    }
}
