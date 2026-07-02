import { useEffect, useState } from "react";
import axios from "axios";
import {
  KanbanSquare,
  Plus,
  Loader2,
  X,
  Check,
  Trash2,
  AlignLeft,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface Card {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

interface Board {
  id: string;
  title: string;
  columns: Column[];
}

export default function App() {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [modalDescription, setModalDescription] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const USER_ID = (import.meta as any).env.VITE_DATABASE_ID;
  const API_URL =
    (import.meta as any).env.VITE_API_URL || "http://localhost:3333";

  async function loadKanban() {
    try {
      const response = await axios.get(`${API_URL}/users/${USER_ID}/boards`);
      if (response.data.length > 0) setBoard(response.data[0]);
    } catch (error) {
      console.error("Erro ao carregar o Kanban", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKanban();
  }, []);

  async function handleCreateCard(columnId: string) {
    if (!newCardTitle.trim()) return;
    try {
      await axios.post(`${API_URL}/cards`, {
        title: newCardTitle,
        columnId,
      });
      setNewCardTitle("");
      setActiveColumnId(null);
      await loadKanban();
    } catch (error) {
      console.error(error);
    }
  }

  function openModal(card: Card) {
    setSelectedCard(card);
    setModalTitle(card.title);
    setModalDescription(card.description || "");
  }

  async function handleSaveChanges() {
    if (!selectedCard || !modalTitle.trim()) return;

    if (board) {
      const updated = board.columns.map((col) => ({
        ...col,
        cards: col.cards.map((c) =>
          c.id === selectedCard.id
            ? { ...c, title: modalTitle, description: modalDescription }
            : c,
        ),
      }));
      setBoard({ ...board, columns: updated });
    }

    const cardId = selectedCard.id;
    setSelectedCard(null);

    try {
      await axios.patch(`${API_URL}/cards/${cardId}`, {
        title: modalTitle,
        description: modalDescription,
      });
    } catch (error) {
      console.error(error);
      loadKanban();
    }
  }

  async function handleDeleteCard(cardId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (board) {
      const updated = board.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardId),
      }));
      setBoard({ ...board, columns: updated });
    }
    try {
      await axios.delete(`${API_URL}/cards/${cardId}`);
    } catch (error) {
      loadKanban();
    }
  }

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    if (!board) return;

    const sourceColumn = board.columns.find(
      (col) => String(col.id) === String(source.droppableId),
    );
    const destColumn = board.columns.find(
      (col) => String(col.id) === String(destination.droppableId),
    );
    if (!sourceColumn || !destColumn) return;

    const sourceCards = Array.from(sourceColumn.cards);
    const destCards =
      source.droppableId === destination.droppableId
        ? sourceCards
        : Array.from(destColumn.cards);

    const [movedCard] = sourceCards.splice(source.index, 1);
    const updatedCard = { ...movedCard, columnId: destination.droppableId };
    destCards.splice(destination.index, 0, updatedCard);

    setBoard({
      ...board,
      columns: board.columns.map((col) => {
        if (String(col.id) === String(source.droppableId))
          return { ...col, cards: sourceCards };
        if (String(col.id) === String(destination.droppableId))
          return { ...col, cards: destCards };
        return col;
      }),
    });

    try {
      await axios.patch(`${API_URL}/cards/${draggableId}/move`, {
        targetColumnId: destination.droppableId,
        orderedCardIds: destCards.map((c) => c.id),
      });
    } catch (error) {
      loadKanban();
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col select-none relative">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KanbanSquare className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-bold tracking-wide">KanbanFlow</h1>
        </div>
        <span className="text-sm text-gray-400 font-medium bg-gray-700 px-3 py-1 rounded-full">
          {board?.title}
        </span>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <main className="flex-1 p-6 overflow-x-auto flex gap-6 items-start">
          {board?.columns.map((column) => (
            <div
              key={column.id}
              className="bg-gray-800 rounded-lg w-80 flex flex-col max-h-[80vh] border border-gray-700 shadow-xl"
            >
              <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                <h3 className="font-semibold text-gray-200">{column.title}</h3>
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full font-bold">
                  {column.cards.length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 flex flex-col gap-3 overflow-y-auto flex-1 min-h-[150px] ${snapshot.isDraggingOver ? "bg-gray-700/30" : ""}`}
                  >
                    {column.cards.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={card.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => openModal(card)}
                            className={`group bg-gray-700 p-3 rounded-md border shadow flex flex-col gap-2 cursor-pointer transition duration-150 ${snapshot.isDragging ? "border-indigo-500 bg-gray-650 rotate-2" : "border-gray-600 hover:border-indigo-500"}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-medium text-gray-100 break-words flex-1">
                                {card.title}
                              </h4>
                              <button
                                onClick={(e) => handleDeleteCard(card.id, e)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {card.description && (
                              <AlignLeft className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <div className="p-3 border-t border-gray-700 bg-gray-800/30">
                {activeColumnId === column.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="O que precisa ser feito?"
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      autoFocus
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateCard(column.id)
                      }
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveColumnId(null)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCreateCard(column.id)}
                        className="text-indigo-500 hover:text-indigo-400"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveColumnId(column.id)}
                    className="w-full flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-white py-1"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar tarefa
                  </button>
                )}
              </div>
            </div>
          ))}
        </main>
      </DragDropContext>

      {selectedCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-lg rounded-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
              <input
                type="text"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                className="bg-transparent text-lg font-bold text-white focus:outline-none focus:bg-gray-900 px-2 py-1 rounded w-11/12 border border-transparent focus:border-gray-600"
              />
              <button
                onClick={() => setSelectedCard(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <AlignLeft className="w-4 h-4" /> Descrição da Tarefa
                </label>
                <textarea
                  rows={5}
                  placeholder="Adicione um conteúdo detalhado para esta tarefa..."
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedCard(null)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition shadow-lg shadow-indigo-600/20"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
