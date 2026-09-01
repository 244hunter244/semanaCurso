const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathDisplay = document.getElementById('deathCount');

const keys = {};
let deaths = 0;
let score = 0; // Distância percorrida em metros/pontos

let bloodSplatters = [];
const MAX_SPLATTERS = 150;

const player = new Player(50, 200);

// Plataformas e obstáculos agora são gerados dinamicamente
let platforms = [];
let hazards = [];

// Controle da geração procedural
let nextX = 0; // Onde o próximo bloco de plataforma será criado
const CHUNK_WIDTH = 200; // Largura de cada seção gerada

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Função que gera um novo pedaço do mapa de forma aleatória
function generateChunk() {
    // 1. Gera sempre uma plataforma cinza
    const platformWidth = Math.random() * 100 + 80; // Largura entre 80px e 180px
    const platformY = Math.random() * 180 + 150;    // Altura variável (entre 150px e 330px)

    platforms.push({
        x: nextX,
        y: platformY,
        width: platformWidth,
        height: 20
    });

    // 2. Chance de 40% de gerar espinhos sobre a plataforma
    if (Math.random() < 0.4 && platformWidth > 100) {
        hazards.push({
            x: nextX + 30,
            y: platformY - 15,
            width: platformWidth - 60,
            height: 15
        });
    }

    // Define a distância até a próxima plataforma (gap alcançável pelo pulo)
    const gap = Math.random() * 80 + 50; // Buraco entre 50px e 130px
    nextX += platformWidth + gap;
}

// Inicializa o mundo criando os primeiros blocos
function initWorld() {
    platforms = [
        { x: 0, y: 300, width: 200, height: 20 } // Plataforma inicial segura
    ];
    hazards = [];
    nextX = 250;

    // Gera os primeiros 5 blocos à frente
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

    // Câmera Flutuante: Mantém o jogador centralizado na tela na horizontal
    const cameraX = player.x - 150;

    // Atualiza a pontuação baseada no progresso para a direita
    if (Math.floor(player.x / 10) > score) {
        score = Math.floor(player.x / 10);
    }

    // Gera novos pedaços conforme o jogador avança
    if (player.x + 800 > nextX) {
        generateChunk();
    }

    // Limpeza de memória: remove plataformas muito atrás da câmera
    platforms = platforms.filter(p => p.x + p.width > cameraX - 200);
    hazards = hazards.filter(h => h.x + h.width > cameraX - 200);

    // Morte por Espinhos ou por Cair no Abismo
    let died = false;
    for (let h of hazards) {
        if (player.collidesWith(h)) died = true;
    }
    if (player.y > 500) died = true; // Queda livre

    if (died) {
        deaths++;
        deathDisplay.textContent = deaths;
        addDeathSplatter(player.x, player.y);
        
        // Salva a maior distância percorrida no backend Java
        salvarPontuacao('Jogador', score);

        // Reseta posição e mundo
        player.reset();
        initWorld();
        score = 0;
    }

    // Renderização com ajuste de Câmera
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-cameraX, 0); // Move todo o desenho junto com a câmera

    // 1. Desenhar manchas fixas
    bloodSplatters.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    // 2. Desenhar plataformas (barras cinzas)
    ctx.fillStyle = '#7f8c8d';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    // 3. Desenhar espinhos
    ctx.fillStyle = '#c0392b';
    hazards.forEach(h => ctx.fillRect(h.x, h.y, h.width, h.height));

    // 4. Desenhar jogador
    player.draw(ctx);

    ctx.restore(); // Restaura o contexto padrão

    // Desenhar HUD de pontuação (fixo na tela)
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(`Distância: ${score}m`, 650, 30);

    requestAnimationFrame(gameLoop);
}

// Inicia o jogo
initWorld();
gameLoop();