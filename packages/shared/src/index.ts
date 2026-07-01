export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  userIds: string[];
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  order: number;
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
}
