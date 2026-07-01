import express from "express";
import cors from "cors";
import { Card } from "@kanban/shared";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  const demoCard: Card = {
    id: "1",
    title: "Configurar ambiente",
    columnId: "todo",
    order: 0,
    userIds: [],
  };

  res.json({ status: "ok", message: "Backend rodando!", demoCard });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
