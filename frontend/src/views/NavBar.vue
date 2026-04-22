<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const menuAberto = ref(false);
const route = useRoute(); // ← pega a rota atual

function toggleMenu() {
  menuAberto.value = !menuAberto.value;
}

const props = defineProps({
  nomeUsuario: {
    type: String,
    default: "",
  },

  activeItem: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["logout"]);
const router = useRouter();

const navItems = [
  { key: "treinos", label: "Treinos da Semana", to: "/home" },
  { key: "exercicios", label: "Exercício do dia", to: "/exercicio" },
];

const itemAtivo = computed(() => {
  const item = navItems.find(n => n.to === route.path);
  return item ? item.key : props.activeItem;
});

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
      <button class="menu-toggle" @click="toggleMenu">☰</button>
    </div>

    <nav :class="{ open: menuAberto }">
      <router-link
        v-for="item in navItems"
        :key="item.key"
        :to="item.to"
        class="nav-item"
        :class="{ active: itemAtivo === item.key }"
        @click="menuAberto = false"
      >
        {{ item.label }}
      </router-link>
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
  text-decoration: none; /* ← adiciona isso */
  color: #444;           /* ← cor padrão */
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

.menu-toggle {
    color: #38b87c;
    display: none;
}

.menu-toggle:hover {
    background: rgba(47, 127, 115, 0.08);
    border-radius: 6px;
}

.menu-toggle:active {
    transform: scale(0.95);
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

    .logo {
        font-size: 20px;
    }

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

    .actions-top {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .menu-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        font-size: 22px;
        cursor: pointer;
        padding: 6px;
    }

    nav {
        margin-top: 0;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        border-bottom: 1px solid #d0e8df;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);

        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
    }

    nav.open {
        max-height: 200px;
        /* ajustável */
    }

    nav .nav-item {
        padding: 12px 20px;
    }

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

    .logo {
        font-size: 18px;
    }

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

}
</style>