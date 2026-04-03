# 🏋️ Sistema de Treinos

Sistema web para gerenciamento de treinos, exercícios e rotinas, permitindo criar, organizar e consultar exercícios de forma prática.

---

## 📌 Funcionalidades

* 🔍 Autocomplete de exercícios
* ➕ Cadastro de exercícios
* 📋 Criação de treinos personalizados
* 🏷️ Organização por grupos musculares
* 💾 Integração com banco de dados
* ⚡ API REST para comunicação entre frontend e backend

---

## 🛠️ Tecnologias utilizadas

### Frontend

* Vue.js
* CSS
* JavaScript

### Backend

* Node.js
* Express
* Prisma ORM

### Banco de Dados

* PostgreSQL

---


## ⚙️ Como rodar o projeto

### 🔧 Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run start
```

Servidor rodando em:

```
http://localhost:3000
```

---

### 💻 Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicação rodando em:

```
http://localhost:5173
```

---

## 🔌 Variáveis de ambiente

Crie um arquivo `.env` no backend:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
PORT=3000
```

---

## 📡 Endpoints principais

### Health Check

```
GET /health
```

### Exercícios

```
GET /exercises
POST /exercises
```

### Treinos

```
GET /workouts
POST /workouts
```

---

## 🧠 Como funciona o autocomplete

* O usuário digita o nome do exercício
* O sistema filtra os exercícios existentes
* Exibe sugestões em tempo real
* Ao selecionar:

  * Nome é exibido no input
  * ID pode ser armazenado para envio ao backend

---

## 🚀 Melhorias futuras

* 🔐 Autenticação de usuários
* 📊 Histórico de treinos
* 📱 Responsividade mobile
* 🧠 Sugestões inteligentes de treino
* 🏋️ Divisão automática por grupo muscular

---

## 👨‍💻 Autor

Desenvolvido por você 😄
