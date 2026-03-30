<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "@/api/login.api.js";

const email = ref("");
const senha = ref("");
const router = useRouter();
const loading = ref(false);

async function entrar() {
  if (!email.value || !senha.value) {
    alert("Preencha todos os campos");
    return;
  }

  try {
    loading.value = true;

    const resposta = await login(email.value, senha.value);
    localStorage.setItem("token", resposta.token);

    router.push("/home");
  } catch (error) {
    alert("E-mail ou senha inválidos");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <h1>Bem-vindo 👋</h1>
      <p class="subtitle">Faça login para continuar</p>

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

      <button @click="entrar" :disabled="loading">
        <span v-if="loading">Entrando...</span>
        <span v-else>Entrar</span>
      </button>

      <p class="register">
        Não tem conta?
        <router-link to="/register">Criar conta</router-link>
      </p>
    </div>
  </div>
</template>