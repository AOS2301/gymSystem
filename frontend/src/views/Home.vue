<script setup>
import { ref, reactive, onMounted, onUnmounted, computed  } from "vue";
import { useRouter } from "vue-router";
import "../assets/css/home.css";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

const exercises = ref([]);

// ✅ onMounted substitui mounted()
onMounted(async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    logout();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      logout();
      return;
    }
    await carregarTreinos();
  } catch (err) {
    console.error("Erro de autenticação", err);
    logout();
  }
});

async function carregarTreinos() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/treino/treino`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Erro ao buscar treinos");

    const data = await response.json();

    //incluirTreinosNaUI(data);
    console.log("Treinos carregados:", data);

  } catch (error) {
    console.error("Erro ao carregar treinos:", error);
  }
}

function incluirTreinosNaUI(treinosData) {
  treinos.value = treinosData;
  treinos.value.sort((a, b) => a.id - b.id);
}

const showModal = ref(false);

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

const form = reactive({
  diaId: null,
  exercicioId: null,
  exercicio: "",
  series: 3,
  reps: 10,
  descanso: 2,
  peso: "",
});

const nomeDiaSelecionado = computed(() => {
  const dia = DIAS_SEMANA.find(d => d.id === form.diaId);
  return dia ? dia.nome : "";
});


async function salvarTreino() {
  const { exercicioId, peso, series, reps, descanso, diaId } = form;

  console.log("dados do formulário:", form);

  if (!exercicioId || !peso || !series || !reps || !descanso) {
    alert("Preencha todos os campos.");
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/treino/treino`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        diaId,
        exercicioId,
        series,
        reps,
        descanso,
        peso,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar treino");
    }

    const treinoSalvo = await response.json();

    const treinoDia = treinos.value.find(t => t.id === diaId);

    if (treinoDia) {
      treinoDia.exercicios.push({
        nome: treinoSalvo.nome,
        series: treinoSalvo.series,
        reps: treinoSalvo.reps,
        peso: treinoSalvo.peso,
      });
    }

    fecharModal();
    Object.assign(form, getFormInicial());

  } catch (error) {
    console.error(error);
    alert("Não foi possível salvar o exercício.");
  }
}

function ordenarTreinos() {
  treinos.value.sort((a, b) => a.id - b.id);
}

function fecharModal() {
  showModal.value = false;
}

function logout() {
  localStorage.removeItem("token");
  router.push("/login");
}

async function openModal(diaId) {
  Object.assign(form, getFormInicial());
  form.diaId = diaId;
  showModal.value = true;

  await carregarExercicios();
}

async function carregarExercicios() {
  if (exercises.value.length) {
    console.log("Exercícios já carregados.");
    return;
  }

  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/exe/exercicios`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  exercises.value = await response.json();
}

//Apresentação dos exerc[icios no sistema]
const showSuggestions = ref(false);

const filteredExercises = computed(() => {
  const query = form.exercicio.trim().toLowerCase();

  if (!query) return exercises.value;

  return exercises.value.filter(ex =>
    ex.nome.toLowerCase().includes(query)
  );
});

function onExerciseInput() {
  showSuggestions.value = true;
}

function selectExercise(ex) {
  this.form.exercicio = ex.nome 
  this.form.exercicioId = ex.id;
  showSuggestions.value = false;
}

function getFormInicial() {
  return {
    diaId: null,
    exercicio: "",
    series: 3,
    reps: 10,
    peso: "",
  };
}
</script>
<template>
  <div class="home-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <h1 class="logo">FIT<span>TRACKER</span></h1>

      <nav>
        <a class="nav-item active">Treinos da Semana</a>
      </nav>

      <button class="logout" @click="logout">Sair</button>
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
              :key="ex.id"
              class="table-row"
            >
              <span>{{ ex.nome }}</span>
              <span>{{ ex.series }}</span>
              <span>{{ ex.reps }}</span>
              <span>{{ ex.peso }}</span>
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
              @input="onExerciseInput"
              @keydown.esc="showSuggestions = false"
              @focus="showSuggestions = true"
              @blur="setTimeout(() => (showSuggestions = false), 150)"
              placeholder="Digite nome do exercício"
            />

            <ul v-if="showSuggestions && filteredExercises.length" class="autocomplete-list">
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
          <input v-model.number="form.reps" type="number" min="1" />

          <label>Descanso</label>
          <input v-model.number="form.descanso" type="number" min="1" />

          <label>Peso</label>
          <input v-model="form.peso" type="number" placeholder="ex: 60kg" />

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