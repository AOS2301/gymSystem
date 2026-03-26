<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import "../assets/css/auth.css";

const nome = ref("");
const email = ref("");
const senha = ref("");
const router = useRouter();

function cadastrar() {
  if (!nome.value || !email.value || !senha.value) {
    alert("Preencha todos os campos");
    return;
  }

  // Simulação de cadastro
  alert("Cadastro realizado com sucesso!");
  router.push("/login");
}
</script>

<template>
  <div class="container">
    <h1>Cadastro</h1>

    <input
      type="text"
      placeholder="Nome"
      v-model="nome"
    />

    <input
      type="email"
      placeholder="E-mail"
      v-model="email"
    />

    <input
      type="password"
      placeholder="Senha"
      v-model="senha"
    />

    <button @click="cadastrar">Cadastrar</button>

    <p>
      Já tem conta?
      <router-link to="/login">Entrar</router-link>
    </p>
  </div>
</template>