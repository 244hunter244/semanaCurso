package com.jogo.controller;

import com.jogo.model.Jogador;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/jogadores")
@CrossOrigin(origins = "*")
public class PontuacaoController {

    private final List<Jogador> placar = new ArrayList<>();

    @PostMapping
    public String salvarPontuacao(@RequestBody Jogador jogador) {
        placar.add(jogador);
        return "Pontuação salva com sucesso para " + jogador.getNome();
    }

    @GetMapping
    public List<Jogador> obterPlacar() {
        return placar;
    }
}