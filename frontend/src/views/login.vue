<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import "../assets/css/auth.css";

const email = ref("");
const senha = ref("");
const errorMsg = ref("");
const router = useRouter();
const loading = ref(false);

const API_URL = import.meta.env.VITE_API_URL;

async function login() {
  loading.value = true;
  errorMsg.value = "";

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        senha: senha.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorMsg.value = "Credenciais inválidas";
      email.value = "";
      senha.value = "";
      return;
    }

    localStorage.setItem("token", data.token);
    router.push("/home");
  } catch (error) {
    errorMsg.value = error.message || "Erro ao fazer login";
    statusMsg.value = "";
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

      <input type="email" placeholder="E-mail" v-model="email" />

      <input type="password" placeholder="Senha" v-model="senha" />

      <button @click="login" :disabled="loading">
        <span v-if="loading">Entrando...</span>
        <span v-else>Entrar</span>
      </button>

      <p class="register">
        Não tem conta?
        <router-link to="/register">Criar conta</router-link>
      </p>

      <div v-if="errorMsg" class="login-error">
        <strong>Erro:</strong> {{ errorMsg }}
      </div>
    </div>
  </div>
</template>