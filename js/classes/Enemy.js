class Enemy extends Sprite {
    constructor({ position = { x: waypoints[0].x, y: waypoints[0].y } }) {
        super({ position, imgSrc: "img/orc.png", frames: { max: 7 } });
        this.width = 100;
        this.height = 100;
        this.waypointIndex = 0;
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
        };
        this.velocity = {
            x: 0,
            y: 0,
        };
        this.radius = 50;
        this.speed = 2;
        this.health = 100;
    }

    draw() {
        super.draw();
        super.update()
        c.fillStyle = "#750000";
        c.fillRect(this.position.x, this.position.y - 15, this.width, 10);

        c.fillStyle = "#299217";
        c.fillRect(
            this.position.x,
            this.position.y - 15,
            this.width * (this.health / 100),
            10
        );
    }

    update() {
        this.draw();

        const waypoint = waypoints[this.waypointIndex];
        const xDistance = waypoint.x - this.center.x;
        const yDistance = waypoint.y - this.center.y;
        const angle = Math.atan2(yDistance, xDistance);

        this.velocity.x = Math.cos(angle);
        this.velocity.y = Math.sin(angle);

        this.position.x += this.velocity.x * this.speed;
        this.position.y += this.velocity.y * this.speed;

        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
        };

        if (
            Math.abs(Math.round(waypoint.x) - Math.round(this.center.x)) <
                Math.abs(this.velocity.x * this.speed) &&
            Math.abs(Math.round(waypoint.y) - Math.round(this.center.y)) <
                Math.abs(this.velocity.y * this.speed) &&
            this.waypointIndex < waypoints.length - 1
        ) {
            this.waypointIndex++;
        }
    }
}
