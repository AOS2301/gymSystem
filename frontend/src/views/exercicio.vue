<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import NavBar from "./NavBar.vue";
import "../assets/css/home.css";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

const nomeUsuario = ref("");
const treinosDoDia = ref([]);
const carregando = ref(true);

const DIAS_SEMANA = [
  { id: 1, sigla: "SEG", nome: "Segunda" },
  { id: 2, sigla: "TER", nome: "Terça" },
  { id: 3, sigla: "QUA", nome: "Quarta" },
  { id: 4, sigla: "QUI", nome: "Quinta" },
  { id: 5, sigla: "SEX", nome: "Sexta" },
  { id: 6, sigla: "SAB", nome: "Sábado" },
  { id: 7, sigla: "DOM", nome: "Domingo" },
];

// JS: 0=Dom,1=Seg,...,6=Sab → mapeia para seus IDs 1-7
const MAP_JS_PARA_ID = [7, 1, 2, 3, 4, 5, 6];

const diaHojeId = computed(() => {
  const diaSemanaJS = new Date().getDay(); // 0-6
  return MAP_JS_PARA_ID[diaSemanaJS];
});

const diaHoje = computed(() =>
  DIAS_SEMANA.find(d => d.id === diaHojeId.value)
);

onMounted(async () => {
  nomeUsuario.value = localStorage.getItem("nome");
  await carregarTreinosDoDia();
});

async function carregarTreinosDoDia() {
  carregando.value = true;
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/treino/treino`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) return redirectLogin();
  if (!response.ok) {
    console.error("Erro ao carregar treinos:", response.status);
    carregando.value = false;
    return;
  }

  const data = await response.json();

  if (!data?.treinos) {
    carregando.value = false;
    return;
  }

  const treinoDeHoje = data.treinos.find(t => t.diaSemana === diaHojeId.value);

  if (treinoDeHoje) {
    treinosDoDia.value = [...treinoDeHoje.exercicios].sort(
      (a, b) => a.ordem - b.ordem
    );
  } else {
    treinosDoDia.value = [];
  }

  carregando.value = false;
}

function formatarDescanso(segundos) {
  if (segundos >= 60) return `${segundos / 60} min`;
  return `${segundos} seg`;
}

function redirectLogin() {
  localStorage.removeItem("token");
  localStorage.removeItem("nome");
  router.push("/login");
}

function logout() {
  redirectLogin();
}
</script>

<template>
  <div class="home-container">
    <NavBar
      :nomeUsuario="nomeUsuario"
      activeItem="treinos"
      @logout="logout"
    />
    <main class="content">
      <header class="header">
        <h2>Exercícios do <span>Dia</span></h2>
        <p>Auxílio para realização do treino</p>
      </header>

      <section class="cards">

        <!-- CARD DO DIA ATUAL -->
        <div class="card card-hoje">
          <div class="card-header">
            <strong>{{ diaHoje?.sigla }}</strong> {{ diaHoje?.nome }}
            <span class="badge-hoje">Hoje</span>
          </div>

          <!-- Carregando -->
          <div v-if="carregando" class="empty-msg">
            Carregando treino...
          </div>

          <!-- Sem treino cadastrado -->
          <div v-else-if="treinosDoDia.length === 0" class="empty-msg">
            Nenhum treino cadastrado para hoje. 💤
          </div>

          <!-- Lista de exercícios -->
          <div v-else class="card-body">
            <div class="table-header">
              <span>Exercício</span>
              <span>Séries</span>
              <span>Reps</span>
              <span>Intervalo</span>
              <span>Peso</span>
            </div>

            <div
              v-for="ex in treinosDoDia"
              :key="ex.id"
              class="table-row"
            >
              <span>{{ ex.nome }}</span>
              <span>{{ ex.series }}</span>
              <span>{{ ex.repeticoes_min }} - {{ ex.repeticoes_max }}</span>
              <span>{{ formatarDescanso(ex.descanso) }}</span>
              <span>{{ ex.peso }} kg</span>
            </div>
          </div>
        </div>

      </section>
    </main>
  </div>
</template>