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
              :key="ex.nome"
              class="table-row"
            >
              <span>{{ ex.nome }}</span>
              <span>{{ ex.series }}</span>
              <span>{{ ex.reps }}</span>
              <span>{{ ex.peso }}</span>
            </div>
          </div>

          <button class="add" @click="openModal(dia.nome)">
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
          <div class="readonly-day">{{ form.dia }}</div>

          <label>Exercício</label>
          <input v-model="form.exercicio" type="text" />

          <label>Séries</label>
          <input v-model.number="form.series" type="number" min="1" />

          <label>Reps</label>
          <input v-model.number="form.reps" type="number" min="1" />

          <label>Peso</label>
          <input v-model="form.peso" type="text" placeholder="ex: 60kg" />

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

<script>
import "../assets/css/home.css";

const API_URL = import.meta.env.VITE_API_URL;

const DIAS_SEMANA = [
  { sigla: "SEG", nome: "Segunda" },
  { sigla: "TER", nome: "Terça" },
  { sigla: "QUA", nome: "Quarta" },
  { sigla: "QUI", nome: "Quinta" },
  { sigla: "SEX", nome: "Sexta" },
  { sigla: "SAB", nome: "Sábado" },
  { sigla: "DOM", nome: "Domingo" },
];

const ORDEM_DIAS = DIAS_SEMANA.map(d => d.nome);

export default {
  data() {
    return {
      showModal: false,
      form: this.getFormInicial(),
      treinos: DIAS_SEMANA.map(dia => ({
        ...dia,
        exercicios: [],
      })),
    };
  },


  async mounted() {
    const token = localStorage.getItem("token");

    if (!token) {
      this.logout();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        this.logout();
        return;
      }
      //Para pegar o usuario logado, caso queira usar as informações dele
      //const user = await response.json();
      await this.carregarTreinos();
    } catch (err) {
      console.error("Erro de autenticação", err);
      this.logout();
    }
  },


  methods: {
    getFormInicial() {
      return {
        dia: "",
        exercicio: "",
        series: 3,
        reps: 10,
        peso: "",
      };
    },

    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },

    openModal(dia) {
      this.form.dia = dia;
      this.showModal = true;
    },

    fecharModal() {
      this.showModal = false;
    },
    
    async carregarTreinos() {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${API_URL}/exec/treino`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar treinos");
        }

        const data = await response.json();

        if (data.length === 0) {
          alert("Nenhum treino encontrado para este usuário. Por favor, adicione seus treinos.");
        }

        console.log("Treinos carregados:", data);
        // this.mapearTreinos(data);

      } catch (error) {
        console.error("Erro ao carregar treinos:", error);
      }
    },

    salvarTreino() {
      const { exercicio, peso, series, reps, dia } = this.form;

      if (!exercicio.trim() || !peso.trim() || !series || !reps) {
        alert("Preencha todos os campos antes de salvar.");
        return;
      }

      const treinoDia = this.treinos.find(t => t.nome === dia);

      treinoDia.exercicios.push({
        nome: exercicio.trim(),
        series,
        reps,
        peso: peso.trim(),
      });

      this.ordenarTreinos();
      this.fecharModal();
      this.form = this.getFormInicial();
    },

    ordenarTreinos() {
      this.treinos.sort(
        (a, b) =>
          ORDEM_DIAS.indexOf(a.nome) - ORDEM_DIAS.indexOf(b.nome)
      );
    },
  },
};
</script>