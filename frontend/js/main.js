const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathDisplay = document.getElementById('deathCount');

const keys = {};
let deaths = 0;

// Lista de manchas fixas (com limite de quantidade)
let bloodSplatters = [];
const MAX_SPLATTERS = 150; 

const player = new Player(50, 300);

const platforms = [
    { x: 0, y: 380, width: 800, height: 20 },
    { x: 200, y: 280, width: 100, height: 20 },
    { x: 400, y: 200, width: 20, height: 180 },
    { x: 600, y: 120, width: 150, height: 20 }
];

const hazards = [
    { x: 300, y: 360, width: 100, height: 20 }
];

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Função ajustada para criar a mancha de morte sem achatar/bugar
function addDeathSplatter(x, y) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
        bloodSplatters.push({
            x: x + (Math.random() * 16 - 2),
            y: y + (Math.random() * 16 - 2),
            w: Math.random() * 6 + 4,
            h: Math.random() * 6 + 4,
            color: '#80091c'
        });
    }

    // Mantém o limite para não poluir a tela e nem pesar o jogo
    if (bloodSplatters.length > MAX_SPLATTERS) {
        bloodSplatters = bloodSplatters.slice(bloodSplatters.length - MAX_SPLATTERS);
    }
}

function gameLoop() {
    player.update(keys, platforms, bloodSplatters);

    // Morte por obstáculo
    for (let h of hazards) {
        if (player.collidesWith(h)) {
            deaths++;
            deathDisplay.textContent = deaths;
            addDeathSplatter(player.x, player.y);
            player.reset();
        }
    }

    // Vitória
    const goal = platforms[3];
    if (player.collidesWith(goal)) {
        salvarPontuacao('Visitante', deaths);
        alert('Fase concluída!');
        player.reset();
        deaths = 0;
        bloodSplatters = []; // Limpa o cenário ao reiniciar a fase
        deathDisplay.textContent = deaths;
    }

    // Limpar tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Desenhar manchas fixas
    bloodSplatters.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    // 2. Desenhar plataformas
    ctx.fillStyle = '#7f8c8d';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    // 3. Desenhar espinhos
    ctx.fillStyle = '#c0392b';
    hazards.forEach(h => ctx.fillRect(h.x, h.y, h.width, h.height));

    // 4. Desenhar jogador e seu rastro suave
    player.draw(ctx);

    requestAnimationFrame(gameLoop);
}

gameLoop();