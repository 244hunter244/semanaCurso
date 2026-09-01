const API_URL = 'http://localhost:8080/api/jogadores';

async function salvarPontuacao(nome, mortes) {
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, mortes: mortes })
        });
    } catch (error) {
        console.error('Erro ao comunicar com o servidor Java:', error);
    }
}