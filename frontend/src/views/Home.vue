<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <h1 class="logo">FITTRACKER</h1>
      <nav>
        <a class="nav-item active">Treinos da Semana</a>
        <a class="nav-item">Running Tracker</a>
      </nav>
    </aside>

    <!-- Conteúdo -->
    <main class="content">
      <header class="header">
        <h2>Treinos da <span>Semana</span></h2>
        <p>Organize seus treinos e controle o descanso</p>
      </header>

      <div class="grid">
        <section class="treinos">
          <div
            v-for="dia in treinos"
            :key="dia.nome"
            class="card"
          >
            <div class="card-header">
              <strong>{{ dia.sigla }}</strong> {{ dia.nome }}
            </div>

            <div class="card-body" v-if="dia.exercicios.length">
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

            <div class="add">+ Adicionar exercício</div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import "../assets/css/home.css";
export default {
  name: "Home",
  data() {
    return {
      treinos: [
        {
          sigla: "SEG",
          nome: "Segunda",
          exercicios: [
            { nome: "Supino Reto", series: 4, reps: 10, peso: "60kg" },
            { nome: "Supino Inclinado", series: 3, reps: 10, peso: "50kg" },
            { nome: "Crucifixo", series: 3, reps: 15, peso: "14kg" },
          ],
        },
        {
          sigla: "TER",
          nome: "Terça",
          exercicios: [
            { nome: "Agachamento", series: 4, reps: 8, peso: "80kg" },
            { nome: "Leg Press", series: 4, reps: 12, peso: "150kg" },
            { nome: "Agacho livre ", series: 4, reps: 12, peso: "150kg" },
          ],
        },
      ],
    };
  },
};
</script>
