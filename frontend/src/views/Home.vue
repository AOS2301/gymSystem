<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import draggable from "vuedraggable";
import NavBar from "./NavBar.vue";
import "../assets/css/home.css";
 
const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;
 
const nomeUsuario = ref("");
 
// ── modais ────────────────────────────────────────────────────
const modalAdicionarAberto        = ref(false);
const modalConfirmarRemocaoAberto = ref(false);
const modalConfirmarLimparAberto  = ref(false);
 
// ── estado de edição ─────────────────────────────────────────
const exercicioEditandoId  = ref(null);
const exercicioBackup      = ref(null);
const exercicioParaRemover = ref(null);
 
// ── autocomplete ─────────────────────────────────────────────
const autocompleteAberto     = ref(false);
const descansoUnidadeMinutos = ref(true);
 
const exerciciosCatalogo = ref([]);
 
const DIAS_SEMANA = [
  { id: 1, sigla: "SEG", nome: "Segunda" },
  { id: 2, sigla: "TER", nome: "Terça" },
  { id: 3, sigla: "QUA", nome: "Quarta" },
  { id: 4, sigla: "QUI", nome: "Quinta" },
  { id: 5, sigla: "SEX", nome: "Sexta" },
  { id: 6, sigla: "SAB", nome: "Sábado" },
  { id: 7, sigla: "DOM", nome: "Domingo" },
];
 
const treinosSemana = ref(
  DIAS_SEMANA.map(dia => ({ ...dia, exercicios: [] }))
);
 
const formTreino = reactive({
  diaSemanaId:    null,
  exercicioId:    null,
  exercicioNome:  "",
  series:         3,
  repeticoes_min: 10,
  repeticoes_max: 15,
  descanso:       2,
  peso:           "",
});
 
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
 
onMounted(async () => {
  nomeUsuario.value = localStorage.getItem("nome");
  await carregarCatalogoExercicios();
  await carregarTreinosSemana();
});
 
// ── carregamento ──────────────────────────────────────────────
async function carregarCatalogoExercicios() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/exe/exercicios`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) return redirectLogin();
  if (!response.ok) { console.error("Erro ao carregar catálogo:", response.status); return; }
  exerciciosCatalogo.value = await response.json();
}
 
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
 
    diaUI.exercicios = [...treinoApi.exercicios]
      .sort((a, b) => a.ordem - b.ordem)
      .map((te, index) => ({
        id:             te.id,
        exercicioId:    te.exercicioId,
        nome:           te.nome,
        series:         te.series,
        repeticoes_min: te.repeticoes_min,
        repeticoes_max: te.repeticoes_max,
        peso:           te.peso,
        descanso:       te.descanso,
        ordem:          te.ordem ?? index,
      }));
  });
}
 
// ── remover exercício (modal individual) ──────────────────────
function abrirModalRemoverExercicio(diaSemanaId, exercicioId) {
  exercicioParaRemover.value = { diaSemanaId, exercicioId };
  modalConfirmarRemocaoAberto.value = true;
}
 
async function confirmarRemocaoExercicio() {
  const token = localStorage.getItem("token");
  const { diaSemanaId, exercicioId } = exercicioParaRemover.value;
 
  const response = await fetch(`${API_URL}/treino/treino`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ diaId: diaSemanaId, exercicioId }),
  });
 
  if (!response.ok) { alert("Erro ao remover exercício"); return; }
 
  modalConfirmarRemocaoAberto.value = false;
  exercicioParaRemover.value = null;
  exercicioEditandoId.value = null;
  await carregarTreinosSemana();
}
 
function cancelarRemocaoExercicio() {
  modalConfirmarRemocaoAberto.value = false;
  exercicioParaRemover.value = null;
  exercicioEditandoId.value = null;
}
 
// ── remover todos (modal geral) ───────────────────────────────
function abrirModalLimparTreinos() {
  modalConfirmarLimparAberto.value = true;
}
 
async function confirmarLimparTreinos() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/treino/removeTodos`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
 
  if (!response.ok) { alert("Erro ao remover exercícios"); return; }
 
  modalConfirmarLimparAberto.value = false;
  await carregarTreinosSemana();
}
 
function cancelarLimparTreinos() {
  modalConfirmarLimparAberto.value = false;
}
 
// ── edição inline ─────────────────────────────────────────────
function iniciarEdicaoExercicio(ex) {
  exercicioEditandoId.value = ex.id;
  exercicioBackup.value = { ...ex };
}
 
async function salvarEdicaoExercicio(ex) {
  if (!validarRepeticoes(ex.repeticoes_min, ex.repeticoes_max)) {
    alert("Repetições mínimas não podem ser maiores que as máximas");
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
      series:         ex.series,
      repeticoes_min: ex.repeticoes_min,
      repeticoes_max: ex.repeticoes_max,
      descanso:       ex.descanso,
      peso:           ex.peso,
    }),
  });
 
  if (!response.ok) { alert("Erro ao atualizar"); return; }
  exercicioEditandoId.value = null;
}
 
function cancelarEdicaoExercicio(ex) {
  if (!exercicioBackup.value) return;
  ex.series         = exercicioBackup.value.series;
  ex.repeticoes_min = exercicioBackup.value.repeticoes_min;
  ex.repeticoes_max = exercicioBackup.value.repeticoes_max;
  ex.descanso       = exercicioBackup.value.descanso;
  ex.peso           = exercicioBackup.value.peso;
  exercicioEditandoId.value = null;
  exercicioBackup.value     = null;
}
 
// ── drag & drop ───────────────────────────────────────────────
async function onDragEnd(dia) {
  const token = localStorage.getItem("token");
  const payload = dia.exercicios.map((ex, index) => ({
    treinoExercicioId: ex.id,
    ordem: index,
  }));
 
  const response = await fetch(`${API_URL}/treino/treino/${dia.id}/ordem`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ exercicios: payload }),
  });
 
  if (!response.ok) {
    alert("Erro ao salvar nova ordem");
    await carregarTreinosSemana();
  }
}
 
// ── adicionar exercício ───────────────────────────────────────
async function salvarNovoExercicio() {
  if (!validarRepeticoes(formTreino.repeticoes_min, formTreino.repeticoes_max)) {
    alert("Repetições mínimas não podem ser maiores que as máximas");
    return;
  }
 
  const descansoFinal = descansoUnidadeMinutos.value
    ? formTreino.descanso * 60
    : formTreino.descanso;
 
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/treino/treino`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      diaId:          formTreino.diaSemanaId,
      exercicioId:    formTreino.exercicioId,
      series:         formTreino.series,
      repeticoes_min: formTreino.repeticoes_min,
      repeticoes_max: formTreino.repeticoes_max,
      descanso:       descansoFinal,
      peso:           Number(formTreino.peso),
    }),
  });
 
  if (!response.ok) { alert("Erro ao salvar exercício"); return; }
  await carregarTreinosSemana();
  fecharModalAdicionar();
  resetFormAdicionar();
}
 
function abrirModalAdicionar(diaSemanaId) {
  resetFormAdicionar();
  descansoUnidadeMinutos.value = true;
  formTreino.diaSemanaId = diaSemanaId;
  modalAdicionarAberto.value = true;
}
 
function fecharModalAdicionar() {
  modalAdicionarAberto.value = false;
  autocompleteAberto.value = false;
}
 
function resetFormAdicionar() {
  Object.assign(formTreino, {
    diaSemanaId:    null,
    exercicioId:    null,
    exercicioNome:  "",
    series:         3,
    repeticoes_min: 10,
    repeticoes_max: 15,
    descanso:       2,
    peso:           "",
  });
}
 
function onExercicioInput() {
  autocompleteAberto.value = true;
}
 
function selecionarExercicioSugerido(exercicio) {
  formTreino.exercicioNome = exercicio.nome;
  formTreino.exercicioId   = exercicio.id;
  autocompleteAberto.value = false;
}
 
// ── helpers ───────────────────────────────────────────────────
function validarRepeticoes(min, max) {
  return min <= max;
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
    <NavBar :nomeUsuario="nomeUsuario" activeItem="treinos" @logout="logout" />
 
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
 
                  <span v-if="exercicioEditandoId === ex.id">
                    <input v-model.number="ex.series" type="number" />
                  </span>
                  <span v-else>{{ ex.series }}</span>
 
                  <span v-if="exercicioEditandoId === ex.id" class="reps-edit">
                    <input v-model.number="ex.repeticoes_min" type="number" />
                    <span class="sep">-</span>
                    <input v-model.number="ex.repeticoes_max" type="number" />
                  </span>
                  <span v-else>{{ ex.repeticoes_min }} - {{ ex.repeticoes_max }}</span>
 
                  <span v-if="exercicioEditandoId === ex.id">
                    <input v-model.number="ex.descanso" type="number" />
                  </span>
                  <span v-else>
                    {{ ex.descanso >= 60 ? (ex.descanso / 60) + " min" : ex.descanso + " seg" }}
                  </span>
 
                  <span v-if="exercicioEditandoId === ex.id">
                    <input v-model="ex.peso" type="number" />
                  </span>
                  <span v-else>{{ ex.peso }} kg</span>
 
                  <span class="actions">
                    <button v-if="exercicioEditandoId !== ex.id" class="btn-edit"
                      @click="iniciarEdicaoExercicio(ex)">Alterar</button>
                    <button v-if="exercicioEditandoId === ex.id" class="btn-save"
                      @click="salvarEdicaoExercicio(ex)">Salvar</button>
                    <button v-if="exercicioEditandoId === ex.id" class="btn-cancel"
                      @click="cancelarEdicaoExercicio(ex)">Cancelar</button>
                    <button v-if="exercicioEditandoId !== ex.id" class="btn-remove"
                      @click="abrirModalRemoverExercicio(dia.id, ex.exercicioId)">Remover</button>
                  </span>
                </div>
              </template>
            </draggable>
          </div>
 
          <button class="add" @click="abrirModalAdicionar(dia.id)">
            + Adicionar exercício
          </button>
        </div>
      </section>
 
      <div class="remove-all-container">
        <button class="btn-primary" @click="abrirModalLimparTreinos">
          Remover todos os exercícios
        </button>
      </div>
 
      <!-- MODAL ADICIONAR EXERCÍCIO -->
      <div v-if="modalAdicionarAberto" class="modal-overlay" @click.self="fecharModalAdicionar">
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
              @input="onExercicioInput"
              @keydown.esc="autocompleteAberto = false"
              @blur="setTimeout(() => (autocompleteAberto = false), 150)"
            />
            <ul v-if="autocompleteAberto && exerciciosFiltrados.length" class="autocomplete-list">
              <li
                v-for="ex in exerciciosFiltrados"
                :key="ex.id"
                class="autocomplete-item"
                @mousedown.prevent="selecionarExercicioSugerido(ex)"
              >{{ ex.nome }}</li>
            </ul>
          </div>
 
          <label>Séries</label>
          <input v-model.number="formTreino.series" type="number" />
 
          <label>Repetições</label>
          <div class="reps-container">
            <input class="reps-input" v-model.number="formTreino.repeticoes_min" type="number" />
            <input class="reps-input" v-model.number="formTreino.repeticoes_max" type="number" />
          </div>
 
          <label>Descanso</label>
          <div class="descanso-container">
            <input v-model.number="formTreino.descanso" type="number" class="descanso-input" />
            <button type="button" class="toggle-unidade" @click="descansoUnidadeMinutos = !descansoUnidadeMinutos">
              {{ descansoUnidadeMinutos ? "min" : "seg" }}
            </button>
          </div>
 
          <label>Peso</label>
          <input v-model="formTreino.peso" type="number" placeholder="ex: 60" />
 
          <div class="modal-actions">
            <button class="btn-secondary" @click="fecharModalAdicionar">Cancelar</button>
            <button class="btn-primary" @click="salvarNovoExercicio"
              :disabled="formTreino.repeticoes_min > formTreino.repeticoes_max">Salvar</button>
          </div>
        </div>
      </div>
 
      <!-- MODAL CONFIRMAR REMOÇÃO DE EXERCÍCIO -->
      <div v-if="modalConfirmarRemocaoAberto" class="modal-overlay" @click.self="cancelarRemocaoExercicio">
        <div class="modal modal-confirm">
          <div class="confirm-icon">🗑️</div>
          <h3>Remover exercício?</h3>
          <p>Esta ação não pode ser desfeita.</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="cancelarRemocaoExercicio">Cancelar</button>
            <button class="btn-danger" @click="confirmarRemocaoExercicio">Remover</button>
          </div>
        </div>
      </div>
 
      <!-- MODAL CONFIRMAR LIMPAR TODOS OS TREINOS -->
      <div v-if="modalConfirmarLimparAberto" class="modal-overlay" @click.self="cancelarLimparTreinos">
        <div class="modal modal-confirm">
          <div class="confirm-icon">⚠️</div>
          <h3>Limpar todos os treinos?</h3>
          <p>Todos os exercícios de todos os dias serão removidos. Esta ação não pode ser desfeita.</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="cancelarLimparTreinos">Cancelar</button>
            <button class="btn-danger" @click="confirmarLimparTreinos">Limpar tudo</button>
          </div>
        </div>
      </div>
 
    </main>
  </div>
</template>