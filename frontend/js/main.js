const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathDisplay = document.getElementById('deathCount');

const keys = {};
let deaths = 0;
let score = 0;

let cameraX = 0;

let bloodSplatters = [];
const MAX_SPLATTERS = 150;

const player = new Player(50, 200);

let platforms = [];
let hazards = [];

let nextX = 0;
let currentY = 300; // Altura atual do chão

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function generateChunk() {
    // Comprimento da seção atual do chão (bem longo)
    const sectionWidth = Math.random() * 300 + 400; 
    
    // Define a nova altura da próxima seção do chão
    const nextY = Math.random() * 180 + 120; 
    const heightDifference = currentY - nextY;

    // Se houver uma subida/parede alta para escalar
    if (heightDifference > 70) {
        // Parede/Coluna vertical no ponto de conexão para permitir Wall Jump
        platforms.push({
            x: nextX,
            y: nextY,
            width: 25,
            height: heightDifference + 20
        });
    }

    // Adiciona o novo segmento de chão
    platforms.push({
        x: nextX,
        y: nextY,
        width: sectionWidth,
        height: 300 // Altura grande para preencher a parte de baixo da tela
    });

    // Chance de obstáculos (espinhos) sobre o chão contínuo
    const hazardChance = Math.min(0.4, Math.max(0, (score - 50) / 200));

    if (Math.random() < hazardChance && sectionWidth > 350) {
        hazards.push({
            x: nextX + (sectionWidth / 2),
            y: nextY - 15,
            width: 45,
            height: 15
        });
    }

    // Atualiza a posição para o próximo segmento sem deixar NENHUM buraco
    currentY = nextY;
    nextX += sectionWidth;
}

function initWorld() {
    // Chão inicial longo e estável
    platforms = [
        { x: 0, y: 300, width: 800, height: 300 } 
    ];
    hazards = [];
    nextX = 800;
    currentY = 300;

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

    const targetCameraX = player.x - (canvas.width / 3);
    cameraX += (targetCameraX - cameraX) * 0.1;
    if (cameraX < 0) cameraX = 0;

    if (Math.floor(player.x / 10) > score) {
        score = Math.floor(player.x / 10);
    }

    if (player.x + 800 > nextX) {
        generateChunk();
    }

    // Mantém na memória apenas o que está visível
    platforms = platforms.filter(p => p.x + p.width > cameraX - 200);
    hazards = hazards.filter(h => h.x + h.width > cameraX - 200);

    // Morte ocorre APENAS ao tocar em um espinho
    let died = false;
    for (let h of hazards) {
        if (player.collidesWith(h)) died = true;
    }

    if (died) {
        deaths++;
        deathDisplay.textContent = deaths;
        addDeathSplatter(player.x, player.y);
        
        salvarPontuacao('Jogador', score);

        player.reset();
        initWorld();
        score = 0;
        cameraX = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-Math.floor(cameraX), 0);

    // 1. Manchas de sangue/tinta
    bloodSplatters.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    // 2. Chão contínuo (plataformas cinzas)
    ctx.fillStyle = '#7f8c8d';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    // 3. Espinhos
    ctx.fillStyle = '#c0392b';
    hazards.forEach(h => ctx.fillRect(h.x, h.y, h.width, h.height));

    // 4. Jogador
    player.draw(ctx);

    ctx.restore();

    // HUD Fixo
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(`Distância: ${score}m`, 650, 30);

    requestAnimationFrame(gameLoop);
}

initWorld();
gameLoop();