<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import draggable from "vuedraggable";
import NavBar from "./NavBar.vue";
import "../assets/css/home.css";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

/* ==================================================
   ESTADO GLOBAL / UI
================================================== */
const nomeUsuario = ref("");
const modalAberto = ref(false);
const sugestoesAbertas = ref(false);
const editandoId = ref(null);
const backupExercicio = ref(null);
const descansoEmMinutos = ref(true);

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
  repeticoes_min: 10,
  repeticoes_max: 15,
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

  if (response.status === 401) return redirectLogin();
  if (!response.ok) { console.error("Erro ao carregar catálogo:", response.status); return; }

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

  if (response.status === 401) return redirectLogin();
  if (!response.ok) { console.error("Erro ao carregar treinos:", response.status); return; }

  const data = await response.json();
  if (!data?.treinos) return;

  treinosSemana.value.forEach(dia => (dia.exercicios = []));

  data.treinos.forEach(treinoApi => {
    const diaUI = treinosSemana.value.find(d => d.id === treinoApi.diaSemana);
    if (!diaUI) return;

    // Garante que a lista já venha ordenada pelo campo `ordem`
    const exerciciosOrdenados = [...treinoApi.exercicios].sort(
      (a, b) => a.ordem - b.ordem
    );

    diaUI.exercicios = exerciciosOrdenados.map((te, index) => ({
      id: te.id,
      exercicioId: te.exercicioId,
      nome: te.nome,
      series: te.series,
      repeticoes_min: te.repeticoes_min,
      repeticoes_max: te.repeticoes_max,
      peso: te.peso,
      descanso: te.descanso,
      ordem: te.ordem ?? index,
    }));
  });
}

async function removerExercicioDoDia(diaSemanaId, exercicioId) {
  if (!confirm("Tem certeza que deseja remover este exercício?")) {
    editandoId.value = null;
    return;
  }

  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/treino/treino`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ diaId: diaSemanaId, exercicioId }),
  });

  if (!response.ok) { alert("Erro ao remover exercício"); return; }

  await carregarTreinosSemana();
}

function alterarExercicio(ex) {
  editandoId.value = ex.id;
  backupExercicio.value = { ...ex };
}

async function salvarEdicao(ex) {
  if (!validarRepeticoes(ex.repeticoes_min, ex.repeticoes_max)) {
    alert("Repetições mínimas não podem ser maiores que as Repetições máximas");
    return;
  }

  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/treino/treino/${ex.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      series: ex.series,
      repeticoes_min: ex.repeticoes_min,
      repeticoes_max: ex.repeticoes_max,
      descanso: ex.descanso,
      peso: ex.peso,
    }),
  });

  if (!response.ok) { alert("Erro ao atualizar"); return; }

  editandoId.value = null;
}

/* ==================================================
   DRAG & DROP — persistência de ordem
================================================== */

/**
 * Chamado pelo @end do <draggable>.
 * Envia ao backend a nova sequência de IDs para o dia arrastado.
 */

async function onDragEnd(dia) {
  const token = localStorage.getItem("token");

  const payload = dia.exercicios.map((ex, index) => ({
    treinoExercicioId: ex.id,
    ordem: index
  }));

  const response = await fetch(
    `${API_URL}/treino/treino/${dia.id}/ordem`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ exercicios: payload }),
    }
  );

  if (!response.ok) {
    alert("Erro ao salvar nova ordem");
    await carregarTreinosSemana();
  }
}

/* ==================================================
   MODAL
================================================== */
async function salvarTreino() {
  if (!validarRepeticoes(formTreino.repeticoes_min, formTreino.repeticoes_max)) {
    alert("Repetições mínimas não podem ser maiores que as Repetições máximas");
    return;
  }
  const descansoFinal = descansoEmMinutos.value
    ? formTreino.descanso * 60
    : formTreino.descanso;

  const token = localStorage.getItem("token");
  const payload = {
    diaId: formTreino.diaSemanaId,
    exercicioId: formTreino.exercicioId,
    series: formTreino.series,
    repeticoes_min: formTreino.repeticoes_min,
    repeticoes_max: formTreino.repeticoes_max,
    descanso: descansoFinal,
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

  if (!response.ok) { alert("Erro ao salvar exercício"); return; }
  await carregarTreinosSemana();
  fecharModal();
  resetForm();
}

function abrirModal(diaSemanaId) {
  resetForm();
  descansoEmMinutos.value = true;
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
    repeticoes_min: 10,
    repeticoes_max: 15,
    descanso: 2,
    peso: "",
  });
}

function redirectLogin() {
  localStorage.removeItem("token");
  localStorage.removeItem("nome");
  router.push("/login");
}

function logout() {
  redirectLogin();
}

function cancelarEdicao(ex) {
  if (!backupExercicio.value) return;
  ex.series = backupExercicio.value.series;
  ex.repeticoes_min = backupExercicio.value.repeticoes_min;
  ex.repeticoes_max = backupExercicio.value.repeticoes_max;
  ex.descanso = backupExercicio.value.descanso;
  ex.peso = backupExercicio.value.peso;
  editandoId.value = null;
  backupExercicio.value = null;
}

function toUpperCase(str) {
  return str.toUpperCase();
}   

function validarRepeticoes(min, max) {
  return min <= max;
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
        <h2>Treinos da <span>Semana</span></h2>
        <p>Organize seus treinos e controle o descanso</p>
      </header>

      <section class="cards">
        <div v-for="dia in treinosSemana" :key="dia.id" class="card">
          <div class="card-header">
            <strong>{{ dia.sigla }}</strong> {{ dia.nome }}
          </div>

          <div v-if="dia.exercicios.length" class="card-body">
            <div class="table-header">
              <span></span>
              <span>Exercício</span>
              <span>Séries</span>
              <span>Reps</span>
              <span>Intervalo</span>
              <span>Peso</span>
              <span></span>
            </div>

            <draggable
              v-model="dia.exercicios"
              item-key="id"
              handle=".drag-handle"
              animation="200"
              @end="onDragEnd(dia)"
            >
              <template #item="{ element: ex }">
                <div class="table-row">
                  <span class="drag-handle">☰</span>
                  <span>{{ ex.nome }}</span>

                  <span v-if="editandoId === ex.id">
                    <input v-model.number="ex.series" type="number" />
                  </span>
                  <span v-else>{{ ex.series }}</span>

                  <span v-if="editandoId === ex.id">
                    <input v-model.number="ex.repeticoes_min" type="number" />
                    <input v-model.number="ex.repeticoes_max" type="number" />
                  </span>
                  <span v-else>
                    {{ ex.repeticoes_min }} - {{ ex.repeticoes_max }}
                  </span>

                  <span v-if="editandoId === ex.id">
                    <input v-model.number="ex.descanso" type="number" />
                  </span>
                  <span v-else>
                    {{ ex.descanso >= 60
                      ? (ex.descanso / 60) + " min"
                    : ex.descanso + " seg"
                    }}
                  </span>

                  <span v-if="editandoId === ex.id">
                    <input v-model="ex.peso" type="number" />
                  </span>
                  <span v-else>{{ ex.peso }} kg</span>

                  <span class="actions">
                    <button
                      v-if="editandoId !== ex.id"
                      class="btn-edit"
                      @click="alterarExercicio(ex)"
                    >Alterar</button>
                    <button
                      v-if="editandoId === ex.id"
                      class="btn-save"
                      @click="salvarEdicao(ex)"
                    >Salvar</button>
                    <button
                      v-if="editandoId === ex.id"
                      class="btn-cancel"
                      @click="cancelarEdicao(ex)"
                    >Cancelar</button>
                    <button
                      v-if="editandoId !== ex.id"
                      class="btn-remove"
                      @click="removerExercicioDoDia(dia.id, ex.exercicioId)"
                    >Remover</button>
                  </span>
                </div>
              </template>
            </draggable>
          </div>

          <button class="add" @click="abrirModal(dia.id)">
            + Adicionar exercício
          </button>
        </div>
      </section>

      <!-- MODAL -->
      <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
        <div class="modal">
          <h3>Incluir exercício</h3>

          <label>Dia da semana</label>
          <div class="readonly-day">{{ nomeDiaSelecionado }}</div>

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
            <ul v-if="sugestoesAbertas && exerciciosFiltrados.length" class="autocomplete-list">
              <li
                v-for="ex in exerciciosFiltrados"
                :key="ex.id"
                class="autocomplete-item"
                @mousedown.prevent="selecionarExercicio(ex)"
              >{{ ex.nome }}</li>
            </ul>
          </div>

          <label>Séries</label>
          <input v-model.number="formTreino.series" type="number"/>

          <label>Repetições</label>
          <div class="reps-container">
            <input class="reps-input" v-model.number="formTreino.repeticoes_min" type="number" />
            <input class="reps-input" v-model.number="formTreino.repeticoes_max" type="number" />
          </div>

          <label>Descanso</label>
          <div class="descanso-container">
            <input v-model.number="formTreino.descanso" type="number" class="descanso-input" />
            <button type="button" class="toggle-unidade" @click="descansoEmMinutos = !descansoEmMinutos">
              {{ descansoEmMinutos ? "min" : "seg" }}
            </button>
          </div>

          <label>Peso</label>
          <input v-model="formTreino.peso" type="number" placeholder="ex: 60" />

          <div class="modal-actions">
            <button class="btn-secondary" @click="fecharModal">Cancelar</button>
            <button class="btn-primary" @click="salvarTreino" :disabled="formTreino.repeticoes_min > formTreino.repeticoes_max">Salvar</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>