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

        this.wallJumpTimer = 0;
        this.canJump = true; 
        
        // Histórico de posições para o rastro em movimento
        this.trail = [];
    }

    update(keys, platforms, bloodSplatters) {
        // Guarda a posição atual para desenhar o rastro em movimento
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift(); // Mantém apenas os últimos 8 frames

        // Se estiver deslizando na parede, deixa marcas permanentes nela!
        if (this.isTouchingWall && !this.isGrounded && this.vy > 0 && Math.random() > 0.4) {
            bloodSplatters.push({
                x: this.wallSide === 1 ? this.x + this.width - 2 : this.x - 2,
                y: this.y + Math.random() * this.height,
                size: Math.random() * 4 + 2,
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
                this.vx = -this.wallSide * 8; 
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
        this.trail = [];
    }

    draw(ctx) {
        // Desenha o rastro em movimento com transparência
        this.trail.forEach((pos, index) => {
            const alpha = (index + 1) / this.trail.length;
            ctx.fillStyle = `rgba(192, 57, 43, ${alpha * 0.4})`;
            ctx.fillRect(pos.x, pos.y, this.width, this.height);
        });

        // Desenha o jogador principal
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}