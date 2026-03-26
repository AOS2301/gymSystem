<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import "../assets/css/auth.css";

const email = ref("");
const senha = ref("");
const router = useRouter();

function entrar() {
  if (!email.value || !senha.value) {
    alert("Preencha todos os campos");
    return;
  }

  // Simulação de login
  localStorage.setItem("logado", "true");
  router.push("/home");
}
</script>

<template>
  <div class="container">
    <h1>Login</h1>

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

    <button @click="entrar">Entrar</button>

    <p>
      Não tem cadastro?
      <router-link to="/register">Criar conta</router-link>
    </p>
  </div>
</template>