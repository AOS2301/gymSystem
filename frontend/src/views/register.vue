<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import "../assets/css/auth.css";

const nome = ref("");
const email = ref("");
const senha = ref("");
const router = useRouter();

const API_URL = import.meta.env.VITE_API_URL;

async function cadastrar() {
  try {
    const response = await fetch(`${API_URL}/user/cadastro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: nome.value,
        email: email.value,
        senha: senha.value,
      }),
    });


    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao cadastrar");
    }

    alert("Cadastro realizado com sucesso!");
    router.push("/Login");
  } catch (error) {
    alert(error.message);
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