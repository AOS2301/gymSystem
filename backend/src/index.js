import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import treinoRoutes from "./routes/treino.routes.js";
import exeRoutes from "./routes/exe.routes.js";
import healthRoutes from "./routes/healthCheck.routes.js";


const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Middleware para ler JSON
app.use(express.json());

// Rotas
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/treino", treinoRoutes);
app.use("/exe", exeRoutes);
app.use("/api", healthRoutes);

// Rota de teste
app.get("/api", (req, res) => {
  res.json({ mensagem: "API Node funcionando 🚀" });
});

// Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});