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
        this.wallSide = 0; // -1 (parede na esquerda), 1 (parede na direita)

        // Trava para impedir que segurar botões anule o impulso do Wall Jump
        this.wallJumpTimer = 0;
        this.canJump = true; 
    }

    update(keys, platforms) {
        // Reduz a trava do wall jump a cada frame
        if (this.wallJumpTimer > 0) {
            this.wallJumpTimer--;
        } else {
            // Movimentação horizontal normal só funciona quando não está travado pelo wall jump
            if (keys['ArrowRight'] || keys['KeyD']) this.vx = this.speed;
            else if (keys['ArrowLeft'] || keys['KeyA']) this.vx = -this.speed;
            else this.vx = 0;
        }

        // Aplicação de Gravidade
        this.vy += this.gravity;

        // Deslizar na parede (APENAS se estiver caindo)
        if (this.isTouchingWall && !this.isGrounded && this.vy > 0) {
            this.vy = 2; // Mantém uma queda suave na parede
        }

        // Controle para aceitar novo pulo apenas após soltar e apertar a tecla de novo
        const isJumpPressed = keys['Space'] || keys['ArrowUp'] || keys['KeyW'];

        if (!isJumpPressed) {
            this.canJump = true; // Libera o pulo quando a tecla é solta
        }

        // Lógica de Pulo / Wall Jump
        if (isJumpPressed && this.canJump) {
            if (this.isGrounded) {
                this.vy = this.jumpForce;
                this.isGrounded = false;
                this.canJump = false; 
            } else if (this.isTouchingWall && this.vy > 0) { // Só faz wall jump se estiver deslizando/caindo na parede
                this.vy = this.jumpForce;
                
                // Arremessa o jogador com força para o lado oposto da parede
                this.vx = -this.wallSide * 8; 
                
                // Descola o jogador para fora da hitbox da parede
                this.x += -this.wallSide * 5; 
                
                this.isTouchingWall = false;
                this.canJump = false;

                // Trava o controle direcional por ~9 frames (150ms) para garantir a repulsão
                this.wallJumpTimer = 9; 
            }
        }

        // Aplica e verifica colisão em X
        this.x += this.vx;
        this.checkCollisionsX(platforms);

        // Aplica e verifica colisão em Y
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
    }

    draw(ctx) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}