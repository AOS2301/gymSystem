<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import NavBar from "./NavBar.vue";
import "../assets/css/home.css";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

const nomeUsuario = ref(localStorage.getItem("nome") || "");

// ── estado ──────────────────────────────────────────────────
const arrastando = ref(false);
const arquivoSelecionado = ref(null);
const nomeArquivo = ref("");
const lendo = ref(false);
const erro = ref("");
const resultado = ref(null);
const etapa = ref("");

// ── drag & drop / file input ─────────────────────────────────
function onDrop(e) {
  arrastando.value = false;

  const file = e.dataTransfer.files[0];

  if (file) selecionarArquivo(file);
}

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
  etapa.value = "";
}

// ── upload para backend ──────────────────────────────────────
async function lerPDF() {
  // converte o arquivo para base64
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

  const data = await response.json();
  console.log(data);
  resultado.value = data;
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
              'upload-zone--drag': arrastando,
              'upload-zone--filled': arquivoSelecionado
            }" @dragover.prevent="arrastando = true" @dragleave="arrastando = false" @drop.prevent="onDrop"
              @click="$refs.fileInput.click()">
              <input ref="fileInput" type="file" accept=".pdf" style="display:none" @change="onFileInput" />

              <div v-if="!arquivoSelecionado" class="upload-placeholder">
                <span class="upload-icon">📄</span>
                <p class="upload-title">Clique ou arraste o PDF aqui</p>
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
              <span v-if="etapa === 'extraindo'">Extraindo texto do PDF…</span>
              <span v-else-if="etapa === 'interpretando'">Interpretando com IA…</span>
              <span v-else>Processando…</span>
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
                <span v-if="treino.grupoMuscular" class="grupo-tag">
                  {{ treino.grupoMuscular }}
                </span>
              </div>

              <div class="table-header" style="grid-template-columns: 2fr 0.6fr 0.8fr 0.8fr 0.6fr;">
                <span>Exercício</span>
                <span>Séries</span>
                <span>Reps</span>
                <span>Intervalo</span>
                <span>Peso</span>
              </div>

              <div v-for="ex in treino.exercicios" :key="ex.nome" class="table-row"
                style="grid-template-columns: 2fr 0.6fr 0.8fr 0.8fr 0.6fr;">
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
                <span>{{ ex.peso != null ? ex.peso + " kg" : "—" }}</span>
              </div>
            </div>

            <!-- Ação futura: salvar no banco -->
            <div class="modal-actions" style="margin-top: 1.5rem;">
              <button class="btn-secondary" @click="limpar">Nova importação</button>
              <button class="btn-primary" disabled title="Em breve">
                Salvar no banco de dados
              </button>
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
.upload-zone--drag {
  background: var(--hover-bg, #222);
  border-color: var(--accent, #c0392b);
}

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
  background: rgba(192, 57, 43, 0.1);
  color: var(--text-primary, #fff);
  border: 1px solid rgba(192, 57, 43, 0.25);
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
  color: var(--text-primary, #fff);
}

/* ── Treino por dia ── */
.treino-dia {
  margin-top: 1.5rem;
}

.treino-dia-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-primary, #fff);
}

.grupo-tag {
  font-size: 11px;
  background: rgba(192, 57, 43, 0.2);
  color: #c0392b;
  border: 1px solid rgba(192, 57, 43, 0.3);
  border-radius: 20px;
  padding: 2px 10px;
  font-weight: 500;
}
</style>