<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import NavBar from "./NavBar.vue";
import "../assets/css/home.css";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

/* ==================================================
   ESTADO GERAL
================================================== */
const nomeUsuario = ref("");
const treinosDoDia = ref([]);
const carregando = ref(true);

/* ==================================================
   ESTADOS DO FLUXO DE TREINO
   idle → em-treino → descansando → concluido
================================================== */
const fase = ref("idle"); // "idle" | "em-treino" | "descansando" | "concluido"
const exercicioAtualIdx = ref(0);
const serieAtualIdx = ref(0); // 0-based

/* ==================================================
   CRONÔMETRO
================================================== */
const tempoRestante = ref(0);
const alertaSoando = ref(false);
let intervalo = null;

/* ==================================================
   DIAS DA SEMANA
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
const MAP_JS_PARA_ID = [7, 1, 2, 3, 4, 5, 6];

const diaHojeId = computed(() => MAP_JS_PARA_ID[new Date().getDay()]);
const diaHoje = computed(() => DIAS_SEMANA.find(d => d.id === diaHojeId.value));

/* ==================================================
   COMPUTEDS DO FLUXO
================================================== */
const exercicioAtual = computed(() => treinosDoDia.value[exercicioAtualIdx.value] ?? null);
const totalExercicios = computed(() => treinosDoDia.value.length);
const serieAtual = computed(() => serieAtualIdx.value + 1);
const totalSeries = computed(() => exercicioAtual.value?.series ?? 0);
const ehUltimaSerieDoExercicio = computed(() => serieAtual.value >= totalSeries.value);
const ehUltimoExercicio = computed(() => exercicioAtualIdx.value >= totalExercicios.value - 1);

const tempoFormatado = computed(() => {
  const m = Math.floor(tempoRestante.value / 60);
  const s = tempoRestante.value % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
});

const progressoExercicio = computed(() =>
  totalExercicios.value > 0
    ? Math.round(((exercicioAtualIdx.value) / totalExercicios.value) * 100)
    : 0
);

/* ==================================================
   CICLO DE VIDA
================================================== */
onMounted(async () => {
  nomeUsuario.value = localStorage.getItem("nome");
  await carregarTreinosDoDia();
});

onBeforeUnmount(() => {
  pararCronometro();
});

/* ==================================================
   API
================================================== */
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
  if (!data?.treinos) { carregando.value = false; return; }

  const treinoDeHoje = data.treinos.find(t => t.diaSemana === diaHojeId.value);
  treinosDoDia.value = treinoDeHoje
    ? [...treinoDeHoje.exercicios].sort((a, b) => a.ordem - b.ordem)
    : [];

  carregando.value = false;
}

/* ==================================================
   FLUXO DE TREINO
================================================== */
function comecarTreino() {
  exercicioAtualIdx.value = 0;
  serieAtualIdx.value = 0;
  fase.value = "em-treino";
}

function iniciarDescanso() {
  // tempo de descanso em segundos vindo do exercício atual
  const descansoSegundos = exercicioAtual.value?.descanso ?? 120;
  tempoRestante.value = descansoSegundos;
  alertaSoando.value = false;
  fase.value = "descansando";

  intervalo = setInterval(() => {
    if (tempoRestante.value > 0) {
      tempoRestante.value--;
    } else {
      pararCronometro();
      alertaSoando.value = true;
    }
  }, 1000);
}

function pararCronometro() {
  clearInterval(intervalo);
  intervalo = null;
}

function pularDescanso() {
  pararCronometro();
  alertaSoando.value = false;
  voltarParaExercicio();
}

function pularExercicio() {
  if (ehUltimoExercicio.value) return;

  const idx = exercicioAtualIdx.value;
  const exercicioPulado = treinosDoDia.value[idx];

  treinosDoDia.value.splice(idx, 1);

  treinosDoDia.value.splice(idx + 1, 0, exercicioPulado);

  serieAtualIdx.value = 0;

  fase.value = "em-treino";
}

function voltarParaExercicio() {
  alertaSoando.value = false;

  if (!ehUltimaSerieDoExercicio.value) {
    serieAtualIdx.value++;
    fase.value = "em-treino";
    return;
  }

  if (!ehUltimoExercicio.value) {
    exercicioAtualIdx.value++;
    serieAtualIdx.value = 0;
    fase.value = "em-treino";
  } else {
    fase.value = "concluido";
  }
}

function reiniciarTreino() {
  pararCronometro();
  fase.value = "idle";
  exercicioAtualIdx.value = 0;
  serieAtualIdx.value = 0;
  alertaSoando.value = false;
}

/* ==================================================
   UTILITÁRIOS
================================================== */
function formatarDescanso(segundos) {
  if (!segundos) return "-";
  if (segundos >= 60) return `${segundos / 60} min`;
  return `${segundos} seg`;
}

function redirectLogin() {
  localStorage.removeItem("token");
  localStorage.removeItem("nome");
  router.push("/login");
}

function logout() { redirectLogin(); }
</script>

<template>
  <div class="home-container">
    <NavBar :nomeUsuario="nomeUsuario" activeItem="exercicios" @logout="logout" />

    <main class="content">
      <header class="header">
        <h2>Exercícios do <span>Dia</span></h2>
        <p>Auxílio para realização do treino</p>
      </header>

      <section class="cards">

        <!-- ==================== IDLE ==================== -->
        <div v-if="fase === 'idle'" class="card card-hoje">
          <div class="card-header">
            <strong>{{ diaHoje?.sigla }}</strong> {{ diaHoje?.nome }}
            <span class="badge-hoje">Hoje</span>
          </div>

          <div v-if="carregando" class="empty-msg">Carregando treino...</div>

          <div v-else-if="treinosDoDia.length === 0" class="empty-msg">
            Nenhum treino cadastrado para hoje. 💤
          </div>

          <div v-else>
            <!-- Preview da lista -->
            <div class="card-body">
              <div class="table-header">
                <span>Exercício</span>
                <span>Séries</span>
                <span>Reps</span>
                <span>Intervalo</span>
                <span>Peso</span>
              </div>
              <div v-for="ex in treinosDoDia" :key="ex.id" class="table-row">
                <span>{{ ex.nome }}</span>
                <span>{{ ex.series }}</span>
                <span>{{ ex.repeticoes_min }} - {{ ex.repeticoes_max }}</span>
                <span>{{ formatarDescanso(ex.descanso) }}</span>
                <span>{{ ex.peso }} kg</span>
              </div>
            </div>

            <div class="treino-start">
              <button 
                class="btn-comecar" @click="comecarTreino">
                ▶ Começar Treino
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== EM TREINO ==================== -->
        <div v-if="fase === 'em-treino'" class="card card-treino-ativo">

          <!-- Barra de progresso geral -->
          <div class="progresso-geral">
            <div class="progresso-label">
              Exercício {{ exercicioAtualIdx + 1 }} de {{ totalExercicios }}
            </div>
            <div class="progresso-barra">
              <div class="progresso-fill" :style="{ width: progressoExercicio + '%' }"></div>
            </div>
          </div>

          <!-- Nome do exercício -->
          <div class="exercicio-nome">{{ exercicioAtual?.nome }}</div>

          <!-- Indicador de série -->
          <div class="serie-indicador">
            <span class="serie-atual">Série {{ serieAtual }}</span>
            <span class="serie-total"> de {{ totalSeries }}</span>
          </div>

          <!-- Bolinhas de série -->
          <div class="series-dots">
            <div
              v-for="n in totalSeries"
              :key="n"
              class="dot"
              :class="{
                'dot-feita': n < serieAtual,
                'dot-atual': n === serieAtual,
              }"
            ></div>
          </div>

          <!-- Dados do exercício -->
          <div class="exercicio-dados">
            <div class="dado">
              <span class="dado-label">Reps</span>
              <span class="dado-valor">{{ exercicioAtual?.repeticoes_min }} - {{ exercicioAtual?.repeticoes_max }}</span>
            </div>
            <div class="dado">
              <span class="dado-label">Peso</span>
              <span class="dado-valor">{{ exercicioAtual?.peso }} kg</span>
            </div>
            <div class="dado">
              <span class="dado-label">Descanso</span>
              <span class="dado-valor">{{ formatarDescanso(exercicioAtual?.descanso) }}</span>
            </div>
          </div>

          <!-- Botão principal -->
          <button
            v-if="!ehUltimaSerieDoExercicio || !ehUltimoExercicio"
            class="btn-iniciar-descanso"
            @click="iniciarDescanso"
          >
            ⏱ Iniciar Descanso
          </button>

          <!-- Última série do último exercício -->
          <button 
            v-else 
            class="btn-concluir" 
            @click="fase = 'concluido'"
          >
            ✓ Concluir Treino
          </button>

          <button 
            v-if="!ehUltimoExercicio"
            class="btn-pular-exercicio" 
            @click="pularExercicio"
          >
            ⏭ Pular Exercício
          </button>


          <button class="btn-link" @click="reiniciarTreino">Abandonar treino</button>
        </div>

        <!-- ==================== DESCANSANDO ==================== -->
        <div v-if="fase === 'descansando'" class="card card-descanso">

          <!-- Alerta quando zera -->
          <div v-if="alertaSoando" class="alerta-descanso">
            <div class="alerta-icon">🔔</div>
            <div class="alerta-texto">Descanso concluído!</div>
            <button class="btn-continuar" @click="voltarParaExercicio">
              Continuar Treino →
            </button>
          </div>

          <!-- Cronômetro rodando -->
          <div v-else>
            <div class="descanso-titulo">Descansando...</div>
            <div class="descanso-exercicio">
              Próxima:
              <strong>
                {{
                  ehUltimaSerieDoExercicio
                    ? (ehUltimoExercicio ? "Treino concluído" : treinosDoDia[exercicioAtualIdx + 1]?.nome)
                    : `Série ${serieAtual + 1} de ${totalSeries} — ${exercicioAtual?.nome}`
                }}
              </strong>
            </div>

            <!-- Cronômetro circular visual -->
            <div class="cronometro-wrap">
              <div class="cronometro-tempo">{{ tempoFormatado }}</div>
            </div>

            <!-- Controles -->
            <div class="cronometro-controles">
              <button class="btn-tempo" @click="tempoRestante = Math.max(0, tempoRestante - 10)">−10s</button>
              <button class="btn-tempo" @click="tempoRestante += 10">+10s</button>
            </div>

            <button class="btn-pular" @click="pularDescanso">Pular Descanso ⏭</button>
          </div>
        </div>

        <!-- ==================== CONCLUÍDO ==================== -->
        <div v-if="fase === 'concluido'" class="card card-concluido">
          <div class="concluido-icon">🏆</div>
          <div class="concluido-titulo">Treino Concluído!</div>
          <div class="concluido-subtitulo">
            Você completou {{ totalExercicios }} exercício{{ totalExercicios > 1 ? 's' : '' }} hoje.
          </div>
          <button class="btn-comecar" @click="reiniciarTreino">Ver Exercicios do dia!</button>
        </div>

      </section>
    </main>
  </div>
</template>

<style scoped>
/* ===== TREINO START ===== */
.treino-start {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e6f6f1;
}

.btn-comecar {
  padding: 14px 40px;
  background: #38b87c;
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, background 0.2s;
}

.btn-comecar:hover {
  background: #2fa06a;
  transform: scale(1.03);
}

/* ===== CARD TREINO ATIVO ===== */
.card-treino-ativo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 32px 24px;
  text-align: center;
}

/* Progresso */
.progresso-geral {
  width: 100%;
}

.progresso-label {
  font-size: 13px;
  color: #2f7f73;
  font-weight: 600;
  margin-bottom: 6px;
}

.progresso-barra {
  width: 100%;
  height: 6px;
  background: #e6f6f1;
  border-radius: 99px;
  overflow: hidden;
}

.progresso-fill {
  height: 100%;
  background: #38b87c;
  border-radius: 99px;
  transition: width 0.4s ease;
}

/* Nome do exercício */
.exercicio-nome {
  font-size: 26px;
  font-weight: 800;
  color: #1a4a3f;
  line-height: 1.2;
}

/* Série */
.serie-indicador {
  font-size: 18px;
}

.serie-atual {
  font-size: 28px;
  font-weight: 800;
  color: #38b87c;
}

.serie-total {
  font-size: 18px;
  color: #888;
}

/* Bolinhas */
.series-dots {
  display: flex;
  gap: 10px;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #d4eddf;
  border: 2px solid #a8d8c2;
  transition: all 0.2s;
}

.dot-feita {
  background: #38b87c;
  border-color: #38b87c;
}

.dot-atual {
  background: #fff;
  border-color: #38b87c;
  border-width: 3px;
  transform: scale(1.3);
}

/* Dados */
.exercicio-dados {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.dado {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f4fbf7;
  border: 1px solid #d4eddf;
  border-radius: 12px;
  padding: 12px 20px;
  min-width: 80px;
}

.dado-label {
  font-size: 11px;
  font-weight: 700;
  color: #2f7f73;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dado-valor {
  font-size: 20px;
  font-weight: 700;
  color: #1a4a3f;
  margin-top: 4px;
}

/* Botões de ação */
.btn-iniciar-descanso {
  padding: 14px 36px;
  background: #2f7f73;
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.btn-iniciar-descanso:hover {
  background: #245f56;
  transform: scale(1.03);
}

.btn-concluir {
  padding: 14px 36px;
  background: #38b87c;
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-pular-exercicio {
  margin-top: -4px;
  background: none;
  border: none;
  color: #2f7f73;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.btn-link {
  background: none;
  border: none;
  color: #aaa;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  margin-top: -8px;
}

/* ===== CARD DESCANSO ===== */
.card-descanso {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 24px;
  text-align: center;
}

.descanso-titulo {
  font-size: 20px;
  font-weight: 700;
  color: #2f7f73;
}

.descanso-exercicio {
  font-size: 14px;
  color: #666;
  max-width: 300px;
}

.cronometro-wrap {
  background: #f4fbf7;
  border: 3px solid #38b87c;
  border-radius: 50%;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px auto;
}

.cronometro-tempo {
  font-size: 42px;
  font-weight: 800;
  color: #1a4a3f;
  font-variant-numeric: tabular-nums;
}

.cronometro-controles {
  display: grid;
  grid-auto-flow: column;   /* força ficar lado a lado */
  justify-content: center;  /* centraliza horizontalmente */  
  padding-bottom: 10px;
  gap: 12px;
}

.btn-tempo {
  padding: 8px 18px;
  background: #e6f6f1;
  border: 1px solid #a8d8c2;
  border-radius: 8px;
  color: #2f7f73;
  font-weight: 700;
  cursor: pointer;
}

.btn-pular {
  padding: 12px 30px;
  background: none;
  border: 2px solid #2f7f73;
  color: #2f7f73;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pular:hover {
  background: #2f7f73;
  color: #fff;
}

/* ===== ALERTA ===== */
.alerta-descanso {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  animation: pulsar 0.6s ease infinite alternate;
}

@keyframes pulsar {
  from { transform: scale(1); }
  to   { transform: scale(1.03); }
}

.alerta-icon {
  font-size: 56px;
}

.alerta-texto {
  font-size: 24px;
  font-weight: 800;
  color: #2f7f73;
}

.btn-continuar {
  padding: 14px 40px;
  background: #38b87c;
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s;
}

.btn-continuar:hover {
  transform: scale(1.04);
}

/* ===== CONCLUÍDO ===== */
.card-concluido {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 24px;
  text-align: center;
}

.concluido-icon {
  font-size: 72px;
}

.concluido-titulo {
  font-size: 32px;
  font-weight: 800;
  color: #1a4a3f;
}

.concluido-subtitulo {
  font-size: 16px;
  color: #666;
}

/* ===== BADGE HOJE ===== */
.badge-hoje {
  margin-left: 10px;
  padding: 2px 10px;
  background: #d4f5e4;
  color: #1a6644;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
}

/* ===== RESPONSIVO ===== */
@media (max-width: 480px) {
  .card-treino-ativo,
  .card-descanso,
  .card-concluido {
    padding: 24px 16px;
  }

  .exercicio-nome {
    font-size: 20px;
  }

  .cronometro-wrap {
    width: 130px;
    height: 130px;
  }

  .cronometro-tempo {
    font-size: 34px;
  }

  .exercicio-dados {
    gap: 12px;
  }
}
</style>