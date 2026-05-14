<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import NavBar from "./NavBar.vue";
import "../assets/css/home.css";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

const nomeUsuario = ref(localStorage.getItem("nome") || "");
console.log("token atual:", localStorage.getItem("token"));

// ── estado ──────────────────────────────────────────────────
const fileInput = ref(null);
const arquivoSelecionado = ref(null);
const nomeArquivo = ref("");
const lendo = ref(false);
const erro = ref("");
const resultado = ref(null);
const modalConfirmacaoAberto = ref(false);

// ── file input ─────────────────────────────────
function onFileInput(e) {
  const file = e.target.files[0];

  if (file) selecionarArquivo(file);
}

function selecionarArquivo(file) {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    erro.value = "Por favor, envie apenas arquivos PDF.";
    return;
  }

  erro.value = "";
  resultado.value = null;
  arquivoSelecionado.value = file;
  nomeArquivo.value = file.name;
}

function limpar() {
  arquivoSelecionado.value = null;
  nomeArquivo.value = "";
  erro.value = "";
  resultado.value = null;
  if (fileInput.value) fileInput.value.value = "";
}

// ── upload para backend ──────────────────────────────────────

async function lerPDF() {
  if (!arquivoSelecionado.value) return;

  lendo.value = true;
  erro.value = "";

  try {

    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;

      reader.readAsDataURL(arquivoSelecionado.value);
    });

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/treino/importar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pdf: base64 }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.message || `Erro (${response.status})`);
    }

    const data = await response.json();

    resultado.value = data;
    console.log("Resultado da importação:", data);
  } catch (e) {
    erro.value = e.message || "Erro inesperado ao importar o PDF.";
  } finally {
    lendo.value = false;
  }
}

async function validaExtracao() { 
  modalConfirmacaoAberto.value = true;
}

async function cancelarExtracao() {
  modalConfirmacaoAberto.value = false;
}

async function salvarTreinosExtraidos() {
  try {

    lendo.value = true;

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/treino/adicionarPDF`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: resultado.value }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.message || `Erro (${response.status})`);
    }

    const saved = await response.json();

    router.push("/home");
  } catch (e) {
    erro.value = e.message || "Erro inesperado ao salvar treinos.";
  } finally {
    lendo.value = false;
  }
}

// ── helpers ──────────────────────────────────────────────────
function formatarDescanso(seg) {
  if (!seg) return "—";

  if (seg >= 60) {
    return seg / 60 + " min";
  }

  return seg + " seg";
}

function totalExercicios(treinos) {
  return (
    treinos?.reduce(
      (acc, treino) => acc + (treino.exercicios?.length || 0),
      0
    ) || 0
  );
}

// ── auth ─────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("nome");

  router.push("/login");
}
</script>

<template>
  <div class="home-container">
    <NavBar :nomeUsuario="nomeUsuario" activeItem="upload" @logout="logout" />

    <main class="content">
      <header class="header">
        <h2>Importar <span>Treino</span></h2>
        <p>Envie a ficha do seu personal em PDF para extrair os dados automaticamente</p>
      </header>

      <section class="cards">

        <!-- ── Card de upload ── -->
        <div class="card" style="max-width: 580px; margin: 0 auto;">
          <div class="card-header">
            <strong>PDF</strong> Ficha de Treino
          </div>

          <div class="card-body" style="padding: 1.5rem;">

            <div class="upload-zone" :class="{
              'upload-zone--filled': arquivoSelecionado
            }" @click="$refs.fileInput.click()">

              <input ref="fileInput" type="file" accept=".pdf" style="display:none" @change="onFileInput" />

              <div v-if="!arquivoSelecionado" class="upload-placeholder">
                <span class="upload-icon">📄</span>
                <p class="upload-title">Clique para selecionar o PDF</p>
                <p class="upload-sub">Ficha enviada pelo seu personal</p>
              </div>

              <div v-else class="upload-selected">
                <span class="upload-icon">✅</span>
                <p class="upload-filename">{{ nomeArquivo }}</p>
                <p class="upload-sub">Arquivo pronto para leitura</p>
              </div>

            </div>

            <!-- Barra de status / loading -->
            <div v-if="lendo" class="status-bar status-loading">
              <span class="spinner-inline"></span>
              <span>Processando…</span>
            </div>

            <div v-if="erro" class="status-bar status-error">
              ✕ {{ erro }}
            </div>

            <div class="modal-actions" style="margin-top: 1rem;">
              <button v-if="arquivoSelecionado" class="btn-secondary" @click="limpar" :disabled="lendo">
                Limpar
              </button>
              <button class="btn-primary" @click="lerPDF" :disabled="!arquivoSelecionado || lendo">
                {{ lendo ? "Processando…" : "Importar Treino" }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Card de resultado ── -->
        <div v-if="resultado" class="card" style="max-width: 580px; margin: 1.5rem auto 0;">
          <div class="card-header">
            <strong>✓</strong> Dados extraídos
          </div>
          <div class="card-body" style="padding: 1.5rem;">

            <!-- Resumo geral -->
            <div class="result-info">
              <div class="result-row" v-if="resultado.aluno">
                <span class="result-label">Aluno</span>
                <span class="result-value">{{ resultado.aluno }}</span>
              </div>
              <div class="result-row" v-if="resultado.personal">
                <span class="result-label">Personal</span>
                <span class="result-value">{{ resultado.personal }}</span>
              </div>
              <div class="result-row" v-if="resultado.mes">
                <span class="result-label">Mês</span>
                <span class="result-value">{{ resultado.mes }}</span>
              </div>
              <div class="result-row">
                <span class="result-label">Treinos</span>
                <span class="result-value">{{ resultado.treinos?.length || 0 }} dia(s)</span>
              </div>
              <div class="result-row">
                <span class="result-label">Total de exercícios</span>
                <span class="result-value">{{ totalExercicios(resultado.treinos) }}</span>
              </div>
            </div>

            <!-- Detalhes por dia -->
            <div v-for="treino in resultado.treinos" :key="treino.diaSemana" class="treino-dia">
              <div class="treino-dia-header">
                <strong>{{ treino.diaSemana }}</strong>
              </div>

              <div class="table-header" style="grid-template-columns: 2fr 0.7fr 1fr 1fr;">
                <span>Exercício</span>
                <span>Séries</span>
                <span>Reps</span>
                <span>Intervalo</span>
              </div>

              <div v-for="ex in treino.exercicios" :key="ex.nome" class="table-row"
                style="grid-template-columns: 2fr 0.7fr 1fr 1fr;">
                <span>{{ ex.nome }}</span>
                <span>{{ ex.series ?? "—" }}</span>
                <span>
                  {{ ex.repeticoes_min != null && ex.repeticoes_max != null
                    ? (ex.repeticoes_min === ex.repeticoes_max
                      ? ex.repeticoes_min
                      : `${ex.repeticoes_min}-${ex.repeticoes_max}`)
                    : "—"
                  }}
                </span>
                <span>{{ formatarDescanso(ex.descanso) }}</span>
              </div>
            </div>

            <div class="modal-actions" style="margin-top: 1.5rem;">
              <button class="btn-secondary" @click="limpar">Nova importação</button>
              <button class="btn-primary" @click="validaExtracao">
                Salvar no meu perfil
              </button>
            </div>

            <div v-if="modalConfirmacaoAberto" class="modal-overlay" @click.self="cancelarExtracao">
              <div class="modal modal-confirm">
                <div class="confirm-icon">📋</div>
                <h3>Confirmar importação?</h3>
                <p>Os treinos atuais serão substituídos pelos dados importados.</p>
                <div class="modal-actions">
                  <button class="btn-secondary" @click="cancelarExtracao">Cancelar</button>
                  <button class="btn-primary" @click="salvarTreinosExtraidos">Salvar</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ── Upload zone ── */
.upload-zone {
  border: 1.5px dashed var(--border-color, #444);
  border-radius: 10px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  background: var(--card-bg, #1a1a1a);
}

.upload-zone:hover,

.upload-zone--filled {
  border-style: solid;
  border-color: #27ae60;
}

.upload-placeholder,
.upload-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.upload-icon {
  font-size: 2rem;
  line-height: 1;
}

.upload-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary, #fff);
  margin: 0;
}

.upload-filename {
  font-size: 14px;
  font-weight: 500;
  color: #27ae60;
  margin: 0;
  word-break: break-all;
}

.upload-sub {
  font-size: 12px;
  color: var(--text-secondary, #888);
  margin: 0;
}

/* ── Status bars ── */
.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 1rem;
}

.status-error {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.status-loading {
  background: rgba(142, 255, 77, 0.1);
  color: var(--text-primary, #000000);
  border: 1px solid rgba(0, 212, 35, 0.25);
}

/* ── Spinner ── */
.spinner-inline {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Resultado ── */
.result-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 1.5rem;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 0.5px solid var(--border-color, #333);
  font-size: 13px;
}

.result-row:last-child {
  border-bottom: none;
}

.result-label {
  color: var(--text-secondary, #888);
}

.result-value {
  font-weight: 500;
  color: var(--text-primary, #000000);
}

/* ── Treino por dia ── */
.treino-dia {
  margin-top: 1.5rem;
}

.treino-dia-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 10px;
  padding-bottom: 6px;

  font-size: 15px;
  font-weight: 600;

  color: var(--text-primary, #222);

  border-bottom: 1px solid var(--border-color, #333);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.modal {
  width: min(92vw, 420px);
  padding: 24px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.modal h3 { margin: 0 0 10px; color: var(--color-primary); }
.modal label { font-weight: 600; color: var(--color-text-muted); }
.modal input,
.modal select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: var(--radius-md);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.modal-confirm {
  max-width: 360px;
  text-align: center;
}

.confirm-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.modal-confirm h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.modal-confirm p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 24px;
}
</style>