const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathDisplay = document.getElementById('deathCount');

const keys = {};
let deaths = 0;
let score = 0;

// Sistema de câmera suave
let cameraX = 0;

// Lista de marcas/respingos fixos
let bloodSplatters = [];
const MAX_SPLATTERS = 150;

const player = new Player(50, 200);

// Plataformas e obstáculos dinâmicos
let platforms = [];
let hazards = [];

// Controle de geração procedural
let nextX = 0;

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Função que gera um novo pedaço do mapa
function generateChunk() {
    const platformWidth = Math.random() * 100 + 80; // Largura entre 80px e 180px
    const platformY = Math.random() * 180 + 150;    // Altura variável

    platforms.push({
        x: nextX,
        y: platformY,
        width: platformWidth,
        height: 20
    });

    // Chance de 40% de gerar espinhos sobre a plataforma
    if (Math.random() < 0.4 && platformWidth > 100) {
        hazards.push({
            x: nextX + 30,
            y: platformY - 15,
            width: platformWidth - 60,
            height: 15
        });
    }

    // Distância/lacuna para o próximo salto
    const gap = Math.random() * 80 + 50; 
    nextX += platformWidth + gap;
}

// Inicializa o mundo do jogo
function initWorld() {
    platforms = [
        { x: 0, y: 300, width: 200, height: 20 } // Plataforma inicial segura
    ];
    hazards = [];
    nextX = 250;

    for (let i = 0; i < 5; i++) {
        generateChunk();
    }
}

function addDeathSplatter(x, y) {
    for (let i = 0; i < 8; i++) {
        bloodSplatters.push({
            x: x + (Math.random() * 16 - 2),
            y: y + (Math.random() * 16 - 2),
            w: Math.random() * 6 + 4,
            h: Math.random() * 6 + 4,
            color: '#80091c'
        });
    }
    if (bloodSplatters.length > MAX_SPLATTERS) {
        bloodSplatters = bloodSplatters.slice(bloodSplatters.length - MAX_SPLATTERS);
    }
}

function gameLoop() {
    player.update(keys, platforms, bloodSplatters);

    // Câmera suave (Smooth Lerp)
    const targetCameraX = player.x - (canvas.width / 2) + (player.width / 2);
    cameraX += (targetCameraX - cameraX) * 0.1;
    if (cameraX < 0) cameraX = 0;

    // Atualiza pontuação pela distância percorrida
    if (Math.floor(player.x / 10) > score) {
        score = Math.floor(player.x / 10);
    }

    // Gera o cenário proceduralmente conforme avança
    if (player.x + 800 > nextX) {
        generateChunk();
    }

    // Limpeza de objetos antigos da memória
    platforms = platforms.filter(p => p.x + p.width > cameraX - 200);
    hazards = hazards.filter(h => h.x + h.width > cameraX - 200);

    // Detecção de derrota (espinhos ou abismo)
    let died = false;
    for (let h of hazards) {
        if (player.collidesWith(h)) died = true;
    }
    if (player.y > 500) died = true;

    if (died) {
        deaths++;
        deathDisplay.textContent = deaths;
        addDeathSplatter(player.x, player.y);
        
        // Envia recorde para o backend Java
        salvarPontuacao('Jogador', score);

        player.reset();
        initWorld();
        score = 0;
        cameraX = 0;
    }

    // Renderização no Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-Math.floor(cameraX), 0); // Movimenta o mundo de acordo com a câmera

    // 1. Marcas/respingos
    bloodSplatters.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    // 2. Plataformas
    ctx.fillStyle = '#7f8c8d';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    // 3. Espinhos/Obstáculos
    ctx.fillStyle = '#c0392b';
    hazards.forEach(h => ctx.fillRect(h.x, h.y, h.width, h.height));

    // 4. Jogador
    player.draw(ctx);

    ctx.restore();

    // Interface (HUD) fixo na tela
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(`Distância: ${score}m`, 650, 30);

    requestAnimationFrame(gameLoop);
}

// Inicia o jogo
initWorld();
gameLoop();