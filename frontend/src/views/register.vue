<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import "../assets/css/auth.css";

const nome = ref("");
const email = ref("");
const senha = ref("");
const router = useRouter();

async function cadastrar() {
  if (!nome.value || !email.value || !senha.value) {
    alert("Preencha todos os campos");
    return;
  }

  try {
    loading.value = true;

    const cadastro = await register(nome.value, email.value, senha.value);

    router.push("/Login");
  } catch (error) {
    alert("E-mail ou senha inválidos");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-box">
      <p class="subtitle">Complete os seguintes campos!</p>

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

      <button @click="cadastrar">
        Cadastrar
      </button>

      <p class="register">
        Já tem conta?
        <router-link to="/login">Entrar</router-link>
      </p>
    </div>
  </div>
</template>