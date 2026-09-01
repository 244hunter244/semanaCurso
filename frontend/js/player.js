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
        
        // AJUSTES DE VELOCIDADE:
        this.speed = 9;         // Aumentado de 5 para 9 (muito mais rápido)
        this.jumpForce = -11;   // Força de pulo aumentada para acompanhar a velocidade
        this.gravity = 0.5;
        this.isGrounded = false;
        this.isTouchingWall = false;
        this.wallSide = 0;

        this.wallJumpTimer = 0;
        this.canJump = true;
        
        this.motionTrail = [];
    }

    update(keys, platforms, bloodSplatters) {
        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.motionTrail.push({ x: this.x, y: this.y, alpha: 0.5 });
        }

        for (let i = this.motionTrail.length - 1; i >= 0; i--) {
            this.motionTrail[i].alpha -= 0.05;
            if (this.motionTrail[i].alpha <= 0) {
                this.motionTrail.splice(i, 1);
            }
        }

        if (this.isTouchingWall && !this.isGrounded && this.vy > 0 && Math.random() < 0.2) {
            bloodSplatters.push({
                x: this.wallSide === 1 ? this.x + this.width - 2 : this.x - 2,
                y: this.y + (Math.random() * (this.height - 4)),
                w: 3,
                h: 5,
                color: '#900c3f'
            });
        }

        if (this.wallJumpTimer > 0) {
            this.wallJumpTimer--;
        } else {
            if (keys['ArrowRight'] || keys['KeyD']) this.vx = this.speed;
            else if (keys['ArrowLeft'] || keys['KeyA']) this.vx = -this.speed;
            else this.vx = 0;
        }

        this.vy += this.gravity;

        if (this.isTouchingWall && !this.isGrounded && this.vy > 0) {
            this.vy = 2;
        }

        const isJumpPressed = keys['Space'] || keys['ArrowUp'] || keys['KeyW'];

        if (!isJumpPressed) {
            this.canJump = true;
        }

        if (isJumpPressed && this.canJump) {
            if (this.isGrounded) {
                this.vy = this.jumpForce;
                this.isGrounded = false;
                this.canJump = false;
            } else if (this.isTouchingWall && this.vy > 0) {
                this.vy = this.jumpForce;
                this.vx = -this.wallSide * 10;
                this.x += -this.wallSide * 5;
                this.isTouchingWall = false;
                this.canJump = false;
                this.wallJumpTimer = 9;
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
                this.vx = 0;
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
        this.wallJumpTimer = 0;
        this.canJump = true;
        this.motionTrail = [];
    }

    draw(ctx) {
        this.motionTrail.forEach(t => {
            ctx.fillStyle = `rgba(192, 57, 43, ${t.alpha})`;
            ctx.fillRect(t.x, t.y, this.width, this.height);
        });

        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}