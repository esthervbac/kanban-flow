import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import { Prisma } from "@prisma/client";

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
            { title: "To Do", order: 0 },
            { title: "Doing", order: 1 },
            { title: "Done", order: 2 },
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
          include: {
            cards: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar quadros." });
  }
});

app.patch("/columns/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const updatedColumn = await prisma.column.update({
      where: { id },
      data: { title },
    });
    res.json(updatedColumn);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar coluna." });
  }
});

app.post("/cards", async (req, res) => {
  const { title, columnId } = req.body;

  try {
    const cardCount = await prisma.card.count({
      where: { columnId },
    });

    const card = await prisma.card.create({
      data: {
        title,
        columnId,
        order: cardCount,
      },
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar card." });
  }
});

app.patch("/cards/:id/move", async (req, res) => {
  const { id } = req.params;
  const { targetColumnId, orderedCardIds } = req.body;

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.card.update({
        where: { id },
        data: { columnId: targetColumnId },
      });

      if (orderedCardIds && Array.isArray(orderedCardIds)) {
        const updatePromises = orderedCardIds.map(
          (cardId: string, index: number) =>
            tx.card.update({
              where: { id: cardId },
              data: { order: index },
            }),
        );
        await Promise.all(updatePromises);
      }
    });

    res.json({ message: "Ordem e coluna atualizadas com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar a ordem dos cards." });
  }
});

app.delete("/cards/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.card.delete({
      where: { id },
    });
    res.json({ message: "Card deletado com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar card." });
  }
});

app.patch("/cards/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
    });
    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ error: "Erro ao editar card." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
