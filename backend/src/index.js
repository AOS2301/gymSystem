import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Middleware para ler JSON
app.use(express.json());

// Rotas
app.use(authRoutes);

// Rota de teste
app.get("/api", (req, res) => {
  res.json({ mensagem: "API Node funcionando 🚀" });
});

// Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
