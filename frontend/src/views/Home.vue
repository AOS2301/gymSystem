<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import "../assets/css/home.css";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

/* ==================================================
   ESTADO GLOBAL / UI
================================================== */
const nomeUsuario = ref("");
const modalAberto = ref(false);
const sugestoesAbertas = ref(false);

/* ==================================================
   CATÁLOGO DE EXERCÍCIOS (autocomplete)
================================================== */
const exerciciosCatalogo = ref([]);

/* ==================================================
   DIAS DA SEMANA (base fixa)
================================================== */
const DIAS_SEMANA = [
  { id: 1, sigla: "SEG", nome: "Segunda" },
  { id: 2, sigla: "TER", nome: "Terça" },
  { id: 3, sigla: "QUA", nome: "Quarta" },
  { id: 4, sigla: "QUI", nome: "Quinta" },
  { id: 5, sigla: "SEX", nome: "Sexta" },
  { id: 6, sigla: "SAB", nome: "Sábado" },
  { id: 7, sigla: "DOM", nome: "Domingo" },
];

/* ==================================================
   TREINOS DA SEMANA (UI)
================================================== */
const treinosSemana = ref(
  DIAS_SEMANA.map(dia => ({
    ...dia,
    exercicios: [],
  }))
);

/* ==================================================
   FORMULÁRIO (modal)
================================================== */
const formTreino = reactive({
  diaSemanaId: null,
  exercicioId: null,
  exercicioNome: "",
  series: 3,
  repeticoes: 10,
  descanso: 2,
  peso: "",
});

/* ==================================================
   COMPUTEDS
================================================== */
const nomeDiaSelecionado = computed(() => {
  const dia = DIAS_SEMANA.find(d => d.id === formTreino.diaSemanaId);
  return dia ? dia.nome : "";
});

const exerciciosFiltrados = computed(() => {
  const termo = formTreino.exercicioNome.trim().toLowerCase();
  if (!termo) return exerciciosCatalogo.value;

  return exerciciosCatalogo.value.filter(ex =>
    ex.nome.toLowerCase().includes(termo)
  );
});

/* ==================================================
   CICLO DE VIDA
================================================== */
onMounted(async () => {
  nomeUsuario.value = localStorage.getItem("nome");

  await carregarCatalogoExercicios();
  await carregarTreinosSemana();
});

/* ==================================================
   API - EXERCÍCIOS
================================================== */
async function carregarCatalogoExercicios() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/exe/exercicios`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  exerciciosCatalogo.value = await response.json();
}

/* ==================================================
   API - TREINOS
================================================== */
async function carregarTreinosSemana() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/treino/treino`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();

  // limpa UI
  treinosSemana.value.forEach(dia => (dia.exercicios = []));

  // mapeia API → UI
  data.treinos.forEach(treinoApi => {
    const diaUI = treinosSemana.value.find(
      d => d.id === treinoApi.diaSemana
    );

    if (!diaUI) return;

    diaUI.exercicios = treinoApi.exercicios.map(te => ({
      id: te.id,
      exercicioId: te.exercicioId,
      nome: te.nome,
      series: te.series,
      repeticoes: te.repeticoes,
      peso: te.peso,
      descanso: te.descanso,
    }));

    console.log("Treino carregado para dia", diaUI.nome, diaUI.exercicios);
  });
}

async function removerExercicioDoDia(diaSemanaId, exercicioId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/treino/treino`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      diaId: diaSemanaId, 
      exercicioId 
    }),
  });

  if (!response.ok) {
    alert("Erro ao remover exercício");
    return;
  }

  await carregarTreinosSemana();
}

/* ==================================================
   MODAL
================================================== */
async function salvarTreino() {
  const token = localStorage.getItem("token");

  const payload = {
    diaId: formTreino.diaSemanaId,
    exercicioId: formTreino.exercicioId,
    series: formTreino.series,
    repeticoes: formTreino.repeticoes,
    descanso: formTreino.descanso,
    peso: Number(formTreino.peso),
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

  await carregarTreinosSemana();
  fecharModal();
  resetForm();
}

function abrirModal(diaSemanaId) {
  resetForm();
  formTreino.diaSemanaId = diaSemanaId;
  modalAberto.value = true;
}

function fecharModal() {
  modalAberto.value = false;
  sugestoesAbertas.value = false;
}

/* ==================================================
   AUTOCOMPLETE
================================================== */
function onExerciseInput() {
  sugestoesAbertas.value = true;
}

function selecionarExercicio(exercicio) {
  formTreino.exercicioNome = exercicio.nome;
  formTreino.exercicioId = exercicio.id;
  sugestoesAbertas.value = false;
}

/* ==================================================
   UTILITÁRIOS
================================================== */
function resetForm() {
  Object.assign(formTreino, {
    diaSemanaId: null,
    exercicioId: null,
    exercicioNome: "",
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
        <h1>{{ nomeUsuario }}</h1>
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
        <div
          v-for="dia in treinosSemana"
          :key="dia.id"
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
              <span>Intervalo</span>
              <span>Peso</span>
              <span></span>
            </div>

            <div
              v-for="ex in dia.exercicios"
              :key="ex.exercicioId"
              class="table-row"
            >
              <span>{{ ex.nome }}</span>
              <span>{{ ex.series }}</span>
              <span>{{ ex.repeticoes }}</span>
              <span>{{ ex.descanso }} min</span>
              <span>{{ ex.peso }} kg</span>
              <span>
                <button
                  class="btn-remove"
                  @click="removerExercicioDoDia(dia.id, ex.exercicioId)"
                >
                  Remover
                </button>
              </span>
            </div>
          </div>

          <button class="add" @click="abrirModal(dia.id)">
            + Adicionar exercício
          </button>
        </div>
      </section>

      <!-- MODAL -->
      <div
        v-if="modalAberto"
        class="modal-overlay"
        @click.self="fecharModal"
      >
        <div class="modal">
          <h3>Incluir exercício</h3>

          <label>Dia da semana</label>
          <div class="readonly-day">
            {{ nomeDiaSelecionado }}
          </div>

          <label>Exercício</label>
          <div class="autocomplete">
            <input
              v-model="formTreino.exercicioNome"
              type="text"
              class="autocomplete-input"
              placeholder="Digite nome do exercício"
              @input="onExerciseInput"
              @keydown.esc="sugestoesAbertas = false"
              @blur="setTimeout(() => (sugestoesAbertas = false), 150)"
            />

            <ul
              v-if="sugestoesAbertas && exerciciosFiltrados.length"
              class="autocomplete-list"
            >
              <li
                v-for="ex in exerciciosFiltrados"
                :key="ex.id"
                class="autocomplete-item"
                @mousedown.prevent="selecionarExercicio(ex)"
              >
                {{ ex.nome }}
              </li>
            </ul>
          </div>

          <label>Séries</label>
          <input v-model.number="formTreino.series" type="number" min="1" />

          <label>Repetições</label>
          <input v-model.number="formTreino.repeticoes" type="number" min="1" />

          <label>Descanso</label>
          <input v-model.number="formTreino.descanso" type="number" min="1" />

          <label>Peso</label>
          <input
            v-model="formTreino.peso"
            type="number"
            placeholder="ex: 60"
          />

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