class Tile {
    constructor({ position = { x: 0, y: 0 } }) {
        this.position = position;
        this.size = 64;
        this.color = "rgba(255, 255, 255, 0.15)";
        this.occupied = false;
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.size * 2, this.size);
    }

    update(mouse) {
        this.draw();

        if (
            mouse.x > this.position.x &&
            mouse.x < this.position.x + this.size * 2 &&
            mouse.y > this.position.y &&
            mouse.y < this.position.y + this.size
        ) {
            this.color = "rgba(255, 255, 255, 0.7)";
        } else {
            this.color = "rgba(255, 255, 255, 0.15)";
        }
    }
}
