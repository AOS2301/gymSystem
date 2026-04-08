<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import "../assets/css/home.css";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

/* ===============================
   ESTADO
================================ */
const exercises = ref([]);
const showModal = ref(false);
const showSuggestions = ref(false);

const DIAS_SEMANA = [
  { id: 1, sigla: "SEG", nome: "Segunda" },
  { id: 2, sigla: "TER", nome: "Terça" },
  { id: 3, sigla: "QUA", nome: "Quarta" },
  { id: 4, sigla: "QUI", nome: "Quinta" },
  { id: 5, sigla: "SEX", nome: "Sexta" },
  { id: 6, sigla: "SAB", nome: "Sábado" },
  { id: 7, sigla: "DOM", nome: "Domingo" },
];

const treinos = ref(
  DIAS_SEMANA.map(dia => ({
    ...dia,
    exercicios: [],
  }))
);

/* ===============================
   FORM
================================ */
const form = reactive({
  diaId: null,
  exercicioId: null,
  exercicio: "",
  series: 3,
  repeticoes: 10,
  descanso: 2,
  peso: "",
});

/* ===============================
   COMPUTED
================================ */
const nomeDiaSelecionado = computed(() => {
  const dia = DIAS_SEMANA.find(d => d.id === form.diaId);
  return dia ? dia.nome : "";
});

const filteredExercises = computed(() => {
  const query = form.exercicio.trim().toLowerCase();
  if (!query) return exercises.value;

  return exercises.value.filter(ex =>
    ex.nome.toLowerCase().includes(query)
  );
});

/* ===============================
   CICLO DE VIDA
================================ */
onMounted(async () => {
  await carregarExercicios();
  await carregarTreinos();
});

/* ===============================
   API
================================ */
async function carregarExercicios() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/exe/exercicios`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  exercises.value = await response.json();
}

async function carregarTreinos() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/treino/treino`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();

  console.log("Treinos carregados:", data);
  // limpa os dias
  treinos.value.forEach(dia => (dia.exercicios = []));

  // mapeia DTO → UI
  data.treinos.forEach(treino => {
    const dia = treinos.value.find(d => d.id === treino.diaSemana);
    if (!dia) return;

    dia.exercicios = treino.exercicios.map(ex => ({
      nome: ex.nome,
      series: ex.series,
      repeticoes: ex.repeticoes,
      peso: ex.peso,
      descanso: ex.descanso,
    }));
  });
}

async function removerExercicio(diaId, exercicioId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/treino/treino`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ diaId, exercicioId }),
  });

  if (!response.ok) {
    alert("Erro ao remover exercício");
    return;
  }

  await carregarTreinos();
}

/* ===============================
   MODAL
================================ */
async function salvarTreino() {
  const token = localStorage.getItem("token");

  const payload = {
    diaId: form.diaId,
    exercicioId: form.exercicioId,
    series: form.series,
    repeticoes: form.repeticoes,
    descanso: form.descanso,
    peso: Number(form.peso),
  };

  const response = await fetch(`${API_URL}/treino/treino`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    alert("Erro ao salvar exercício");
    return;
  }

  await carregarTreinos();

  fecharModal();
  resetForm();
}

function openModal(diaId) {
  resetForm();
  form.diaId = diaId;
  showModal.value = true;
}

function fecharModal() {
  showModal.value = false;
  showSuggestions.value = false;
}

/* ===============================
   AUTOCOMPLETE
================================ */
function onExerciseInput() {
  showSuggestions.value = true;
}

function selectExercise(ex) {
  form.exercicio = ex.nome;
  form.exercicioId = ex.id;
  showSuggestions.value = false;
}

/* ===============================
   UTILS
================================ */
function resetForm() {
  Object.assign(form, {
    diaId: null,
    exercicioId: null,
    exercicio: "",
    series: 3,
    repeticoes: 10,
    descanso: 2,
    peso: "",
  });
}

function logout() {
  localStorage.removeItem("token");
  router.push("/login");
}
</script>

<template>
  <div class="home-container">
    <aside class="sidebar">
      <div class="sidebar-top">
        <h1 class="logo">FIT<span>TRACKER</span></h1>
        <button class="logout" @click="logout">Sair</button>
      </div>
      <nav>
        <a class="nav-item active">Treinos da Semana</a>
      </nav>
    </aside>
    <main class="content">
      <header class="header">
        <h2>Treinos da <span>Semana</span></h2>
        <p>Organize seus treinos e controle o descanso</p>
      </header>

      <section class="cards">
        <div v-for="dia in treinos" :key="dia.id" class="card">
          <div class="card-header">
            <strong>{{ dia.sigla }}</strong> {{ dia.nome }}
          </div>

          <div v-if="dia.exercicios.length" class="card-body">
            <div class="table-header">
              <span>Exercício</span>
              <span>Séries</span>
              <span>Reps</span>
              <span>Intervalo</span>
              <span>Peso</span>
              <span>Remover</span>
            </div>

            
            <div v-for="ex in dia.exercicios" 
              :key="ex.id" 
              class="table-row"
            >
              <span>{{ ex.nome }}</span>
              <span>{{ ex.series }}</span>
              <span>{{ ex.repeticoes }}</span>
              <span>{{ ex.descanso }} min</span>
              <span>{{ ex.peso }} kg</span>
              <span>
                <button class="btn-remove" @click="removerExercicio(dia.id, ex.id)">
                  Remover
                </button>
              </span>
            </div>
          </div>

          <button class="add" @click="openModal(dia.id)">
            + Adicionar exercício
          </button>
        </div>
      </section>

      <!-- Modal -->
      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="fecharModal"
      >
        <div class="modal">
          <h3>Criar treino</h3>

          <label>Dia da semana</label>
          <div class="readonly-day">{{ nomeDiaSelecionado }}</div>

          <label>Exercício</label>
          <div class="autocomplete">
            <input
              v-model="form.exercicio"
              type="text"
              class="autocomplete-input"
              placeholder="Digite nome do exercício"
              @input="onExerciseInput"
              @keydown.esc="showSuggestions = false"
              @blur="setTimeout(() => (showSuggestions = false), 150)"
            />

            <ul
              v-if="showSuggestions && filteredExercises.length"
              class="autocomplete-list"
            >
              <li
                v-for="ex in filteredExercises"
                :key="ex.id"
                class="autocomplete-item"
                @mousedown.prevent="selectExercise(ex)"
              >
                {{ ex.nome }}
              </li>
            </ul>
          </div>

          <label>Séries</label>
          <input v-model.number="form.series" type="number" min="1" />

          <label>Repetições</label>
          <input v-model.number="form.repeticoes" type="number" min="1" />

          <label>Descanso</label>
          <input v-model.number="form.descanso" type="number" min="1" />

          <label>Peso</label>
          <input v-model="form.peso" type="number" placeholder="ex: 60" />

          <div class="modal-actions">
            <button class="btn-secondary" @click="fecharModal">
              Cancelar
            </button>
            <button class="btn-primary" @click="salvarTreino">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>