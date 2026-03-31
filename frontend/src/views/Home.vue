<template>
  <div class="home-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <h1 class="logo">FIT<span>TRACKER</span></h1>

      <nav>
        <a class="nav-item active">Treinos da Semana</a>
      </nav>

      <button class="logout" @click="logout">
        Sair
      </button>
    </aside>

    <!-- Conteúdo -->
    <main class="content">
      <header class="header">
        <h2>Treinos da <span>Semana</span></h2>
        <p>Organize seus treinos e controle o descanso</p>
      </header>

      <section class="cards">
        <div
          v-for="dia in treinos"
          :key="dia.nome"
          class="card"
        >
          <div class="card-header">
            <strong>{{ dia.sigla }}</strong> {{ dia.nome }}
          </div>

          <div v-if="dia.exercicios.length" class="card-body">
            <div class="table-header">
              <span>Exercício</span>
              <span>Séries</span>
              <span>Reps</span>
              <span>Peso</span>
            </div>

            <div
              v-for="ex in dia.exercicios"
              :key="ex.nome"
              class="table-row"
            >
              <span>{{ ex.nome }}</span>
              <span>{{ ex.series }}</span>
              <span>{{ ex.reps }}</span>
              <span>{{ ex.peso }}</span>
            </div>
          </div>

          <button class="add">+ Adicionar exercício</button>
        </div>
      </section>
    </main>
  </div>
</template>


<script>
import "../assets/css/home.css";
import { useRouter } from "vue-router";

const API_URL = import.meta.env.VITE_API_URL;

export default {
  name: "Home",
  data() {
    return {
      treinos: [
        {
          sigla: "SEG",
          nome: "Segunda",
          exercicios: [
            { nome: "Supino Reto", series: 4, reps: 10, peso: "60kg" },
            { nome: "Supino Inclinado", series: 3, reps: 10, peso: "50kg" },
            { nome: "Crucifixo", series: 3, reps: 15, peso: "14kg" },
          ],
        },
        {
          sigla: "TER",
          nome: "Terça",
          exercicios: [
            { nome: "Agachamento", series: 4, reps: 8, peso: "80kg" },
            { nome: "Leg Press", series: 4, reps: 12, peso: "150kg" },
          ],
        },
      ],
    };
  },

  async mounted() {
    const token = localStorage.getItem("token");
    const router = useRouter?.() || this.$router;

    if (!token) {
      router.push("/login");
      return;
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  },

  methods: {
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
  },
};
</script>