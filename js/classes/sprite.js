class Sprite {
    constructor({
        position = { x: 0, y: 0 },
        imgSrc,
        frames = { max: 1 },
        offset = { x: 0, y: 0 },
    }) {
        this.position = position;
        this.img = new Image();
        this.img.src = imgSrc;
        this.frames = {
            max: frames.max,
            current: 0,
            elapsed: 0,
            hold: 4,
        };
        this.offset = offset;
    }
    draw() {
        const cropWidth = this.img.width / this.frames.max;
        const crop = {
            position: {
                x: cropWidth * this.frames.current,
                y: 0,
            },
            width: cropWidth,
            height: this.img.height,
        };
        c.drawImage(
            this.img,
            crop.position.x,
            crop.position.y,
            crop.width,
            crop.height,
            this.position.x + this.offset.x,
            this.position.y + this.offset.y,
            crop.width,
            crop.height
        );
    }

    update() {
        // Animating and holding the animation time
        if (this.frames.elapsed % this.frames.hold === 0) {
            this.frames.current++;

            if (this.frames.current >= this.frames.max) {
                this.frames.current = 0;
            }
        }
        this.frames.elapsed++;
    }
}
