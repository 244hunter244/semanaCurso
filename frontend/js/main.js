const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathDisplay = document.getElementById('deathCount');

const keys = {};
let deaths = 0;

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

function gameLoop() {
    player.update(keys, platforms);

    for (let h of hazards) {
        if (player.collidesWith(h)) {
            deaths++;
            deathDisplay.textContent = deaths;
            player.reset();
        }
    }

    const goal = platforms[3];
    if (player.collidesWith(goal)) {
        salvarPontuacao('Visitante', deaths);
        alert('Fase concluída!');
        player.reset();
        deaths = 0;
        deathDisplay.textContent = deaths;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#7f8c8d';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    ctx.fillStyle = '#c0392b';
    hazards.forEach(h => ctx.fillRect(h.x, h.y, h.width, h.height));

    player.draw(ctx);

    requestAnimationFrame(gameLoop);
}

gameLoop();