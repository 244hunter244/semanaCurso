class Player {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpForce = -10;
        this.gravity = 0.5;
        this.isGrounded = false;
        this.isTouchingWall = false;
        this.wallSide = 0;
    }

    update(keys, platforms) {
        if (keys['ArrowRight'] || keys['KeyD']) this.vx = this.speed;
        else if (keys['ArrowLeft'] || keys['KeyA']) this.vx = -this.speed;
        else this.vx = 0;

        this.vy += this.gravity;

        if (this.isTouchingWall && !this.isGrounded && this.vy > 0) {
            this.vy = 2; // Deslizar na parede
        }

        if (keys['Space'] || keys['ArrowUp'] || keys['KeyW']) {
            if (this.isGrounded) {
                this.vy = this.jumpForce;
                this.isGrounded = false;
            } else if (this.isTouchingWall) {
                this.vy = this.jumpForce;
                this.vx = -this.wallSide * this.speed * 1.5;
                this.isTouchingWall = false;
            }
        }

        this.x += this.vx;
        this.checkCollisionsX(platforms);

        this.y += this.vy;
        this.checkCollisionsY(platforms);
    }

    checkCollisionsX(platforms) {
        this.isTouchingWall = false;
        for (let p of platforms) {
            if (this.collidesWith(p)) {
                if (this.vx > 0) {
                    this.x = p.x - this.width;
                    this.isTouchingWall = true;
                    this.wallSide = 1;
                } else if (this.vx < 0) {
                    this.x = p.x + p.width;
                    this.isTouchingWall = true;
                    this.wallSide = -1;
                }
            }
        }
    }

    checkCollisionsY(platforms) {
        this.isGrounded = false;
        for (let p of platforms) {
            if (this.collidesWith(p)) {
                if (this.vy > 0) {
                    this.y = p.y - this.height;
                    this.vy = 0;
                    this.isGrounded = true;
                } else if (this.vy < 0) {
                    this.y = p.y + p.height;
                    this.vy = 0;
                }
            }
        }
    }

    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
    }

    draw(ctx) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}