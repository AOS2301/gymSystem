<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "@/api/login.api.js";
import "../assets/css/auth.css";

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

    // Exemplo: salvar token
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