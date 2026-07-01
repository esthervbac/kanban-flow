import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend conectado ao Neon!" });
});

app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "E-mail já cadastrado." });
    }

    const user = await prisma.user.create({
      data: { name, email, password },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
});

app.post("/boards", async (req, res) => {
  const { title, ownerId } = req.body;

  try {
    const board = await prisma.board.create({
      data: {
        title,
        ownerId,
        columns: {
          create: [
            { title: "À Fazer", order: 0 },
            { title: "Em Progresso", order: 1 },
            { title: "Concluído", order: 2 },
          ],
        },
      },
      include: {
        columns: true,
      },
    });

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar quadro." });
  }
});

app.get("/users/:userId/boards", async (req, res) => {
  const { userId } = req.params;

  try {
    const boards = await prisma.board.findMany({
      where: { ownerId: userId },
      include: {
        columns: {
          include: { cards: true },
        },
      },
    });

    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar quadros." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
