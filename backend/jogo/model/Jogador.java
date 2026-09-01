package com.jogo.model;

public class Jogador {
    private String nome;
    private int mortes;

    public Jogador() {}

    public Jogador(String nome, int mortes) {
        this.nome = nome;
        this.mortes = mortes;
    }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public int getMortes() { return mortes; }
    public void setMortes(int mortes) { this.mortes = mortes; }
}