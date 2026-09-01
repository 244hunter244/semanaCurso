const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathDisplay = document.getElementById('deathCount');

const keys = {};
let deaths = 0;

// Array para armazenar as marcas permanentes de sangue/tinta
const bloodSplatters = [];

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

// Função para criar respingos permanentes onde o jogador morreu
function addBloodSplatter(x, y) {
    for (let i = 0; i < 12; i++) {
        bloodSplatters.push({
            x: x + (Math.random() * 20 - 5),
            y: y + (Math.random() * 20 - 5),
            size: Math.random() * 6 + 2,
            color: '#a93226'
        });
    }
}

function gameLoop() {
    player.update(keys, platforms, bloodSplatters);

    // Checar morte por espinhos
    for (let h of hazards) {
        if (player.collidesWith(h)) {
            deaths++;
            deathDisplay.textContent = deaths;
            addBloodSplatter(player.x, player.y); // Adiciona marca da morte
            player.reset();
        }
    }

    // Checar vitória
    const goal = platforms[3];
    if (player.collidesWith(goal)) {
        salvarPontuacao('Visitante', deaths);
        alert('Fase concluída!');
        player.reset();
        deaths = 0;
        deathDisplay.textContent = deaths;
    }

    // Limpar tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Desenhar marcas de sangue salvas no cenário
    bloodSplatters.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.size, b.size);
    });

    // 2. Desenhar plataformas
    ctx.fillStyle = '#7f8c8d';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    // 3. Desenhar espinhos
    ctx.fillStyle = '#c0392b';
    hazards.forEach(h => ctx.fillRect(h.x, h.y, h.width, h.height));

    // 4. Desenhar jogador e seu rastro ativo
    player.draw(ctx);

    requestAnimationFrame(gameLoop);
}

gameLoop();