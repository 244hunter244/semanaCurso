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
let lastY = 300; // Guarda a altura da última plataforma para calcular subidas

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function generateChunk() {
    // Plataformas significativamente mais longas (400px a 700px)
    const platformWidth = Math.random() * 300 + 400; 
    const platformY = Math.random() * 200 + 120; // Variação de altura

    // Se a subida for maior que 80px (impossível de saltar diretamente):
    if (lastY - platformY > 80) {
        // Cria uma coluna/parede vertical cinza para usar Wall Jump
        const wallHeight = (lastY - platformY) + 40;
        platforms.push({
            x: nextX,
            y: platformY,
            width: 25, // Coluna fina e alta
            height: wallHeight
        });
    }

    // Plataforma principal
    platforms.push({
        x: nextX,
        y: platformY,
        width: platformWidth,
        height: 20
    });

    // Obstáculos pequenos (apenas 40px) para ser possível esquivar correndo
    const hazardChance = Math.min(0.4, Math.max(0, (score - 60) / 250));

    if (Math.random() < hazardChance && platformWidth > 450) {
        hazards.push({
            x: nextX + (platformWidth / 2),
            y: platformY - 15,
            width: 40, // Espinho bem menor
            height: 15
        });
    }

    lastY = platformY; // Atualiza a última altura
    const gap = Math.random() * 80 + 60; // Buraco pequeno entre plataformas
    nextX += platformWidth + gap;
}

function initWorld() {
    // Plataforma inicial extensa para acelerar livremente
    platforms = [
        { x: 0, y: 300, width: 800, height: 20 } 
    ];
    hazards = [];
    nextX = 850;
    lastY = 300;

    for (let i = 0; i < 4; i++) {
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

    platforms = platforms.filter(p => p.x + p.width > cameraX - 200);
    hazards = hazards.filter(h => h.x + h.width > cameraX - 200);

    let died = false;
    for (let h of hazards) {
        if (player.collidesWith(h)) died = true;
    }
    if (player.y > 600) died = true; // Abismo ajustado

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

    bloodSplatters.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    ctx.fillStyle = '#7f8c8d';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    ctx.fillStyle = '#c0392b';
    hazards.forEach(h => ctx.fillRect(h.x, h.y, h.width, h.height));

    player.draw(ctx);

    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(`Distância: ${score}m`, 650, 30);

    requestAnimationFrame(gameLoop);
}

initWorld();
gameLoop();