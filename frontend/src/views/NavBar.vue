<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
    nomeUsuario: {
        type: String,
        default: "",
    },
    activeItem: {
        type: String,
        default: "treinos",
    },
});

const emit = defineEmits(["logout"]);
const router = useRouter();

const navItems = [
    { key: "treinos", label: "Treinos da Semana" },
    { key: "dieta", label: "Dieta da Semana" },
    // Adicione futuros itens aqui
];

function logout() {
    emit("logout");
}
</script>
<template>
    <aside class="sidebar">
        <div class="sidebar-top">
            <h1 class="logo">Train<span>Hub</span></h1>
            <h1 class="usuario">{{ nomeUsuario.toUpperCase() }}</h1>
            <button class="logout" @click="logout">Sair</button>
        </div>

        <nav>
            <a v-for="item in navItems" :key="item.key" class="nav-item" :class="{ active: activeItem === item.key }">
                {{ item.label }}
            </a>
        </nav>
    </aside>
</template>

<style scoped>
.sidebar {
    width: 260px;
    min-width: 260px;
    padding: 24px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
}

.sidebar-top {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    flex-wrap: wrap;
}

.sidebar-top h1 {
    margin: 0;
    line-height: 1.2;
}

.usuario {
    font-size: 14px;
    font-weight: 600;
    color: #444;
    letter-spacing: 0.5px;
}

.logo {
    font-size: 22px;
    font-weight: bold;
    color: #2f7f73;
}

.logo span {
    color: #38b87c;
}

nav {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.nav-item {
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
}

.nav-item.active {
    color: #38b87c;
    background: #c6ffe2;
    font-weight: 600;
}

.logout {
    width: 100%;
    padding: 6px 0;
    margin-top: 6px;
    background: #e74c3c;
    border: none;
    border-radius: 6px;
    color: #fff;
    font-size: 13px;
    cursor: pointer;
}

/* Responsivo — tablet */
@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    min-width: unset;
    z-index: 100;
    padding: 10px 20px;
    border-bottom: 1px solid #d0e8df;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .sidebar-top {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    gap: 8px;
  }

  .logo { font-size: 20px; }

  .sidebar-top .usuario {
    font-size: 12px;
    flex: 1;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logout {
    width: auto;
    padding: 6px 10px;
    margin-top: 0;
    white-space: nowrap;
    font-size: 12px;
  }

  nav { display: none; }
}

/* Responsivo — mobile */
@media (max-width: 480px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 100;
    padding: 10px 14px;
    border-bottom: 1px solid #d0e8df;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .sidebar-top {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    gap: 8px;
  }

  .logo { font-size: 18px; }

  .sidebar-top .usuario {
    font-size: 12px;
    flex: 1;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logout {
    width: auto;
    padding: 6px 10px;
    margin-top: 0;
    white-space: nowrap;
    font-size: 12px;
  }

  nav { display: none; }
}
</style>