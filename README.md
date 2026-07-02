# KanbanFlow 🚀

A modern, full-stack Kanban board application built with a monorepo architecture. Users can create tasks, add detailed descriptions via an interactive modal, edit titles inline, delete tasks, and fluidly drag and drop cards across columns with real-time persistence.

## 🛠️ Tech Stack

### Frontend

- **React** (with TypeScript)
- **Tailwind CSS** (for styling)
- **@hello-pangea/dnd** (for smooth drag and drop animations)
- **Axios** (for API communication)
- **Lucide React** (for modern iconography)

### Backend

- **Node.js** & **Express**
- **Prisma ORM**
- **TypeScript**

### Database & Infrastructure

- **Neon PostgreSQL** (Serverless cloud database)

---

## 💎 Features

- **Full-Stack Monorepo:** Clean separation between `apps/frontend` and `apps/backend`.
- **Drag and Drop:** Move cards between _To Do_, _Doing_, and _Done_ columns with elegant visual feedback.
- **Order Persistence:** Card positioning is saved in the database using Prisma transactions (`$transaction`), keeping your custom order even after a page refresh (F5).
- **Task Modals:** Click on any card to open a beautiful glassmorphism modal to add or edit rich, long-form descriptions.
- **Inline Editing:** Edit task titles directly inside the board view.
- **Optimistic Updates:** Immediate UI response when moving or deleting cards, syncing in the background for a lag-free user experience.

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have **Node.js** (v18+) and **npm** installed on your machine.

### 1. Clone the Repository

```bash
git clone https://github.com/esthervbac/kanban-flow.git
cd kanban-flow
```

### 2. Install Dependencies

From the root folder, run the following command to install all dependencies for both frontend and backend at once:

```bash
    npm install
```

### 3. Environment Setup (Backend)

Navigate to the backend directory and create a `.env` file:

```bash
    cd apps/backend
    touch .env
```

Inside apps/backend/.env, add your Neon PostgreSQL connection string:

```bash
    DATABASE_URL="postgresql://user:password@your-neon-host/dbname?sslmode=require"
```

### 4. Run Database Migrations

Generate the Prisma Client and push the schema to your Neon database:

```bash
    npx prisma migrate dev --name init
```

## 🔑 Initial Data Creation (API)

Before running the frontend, you need to seed your database with a User and a Board using an API client like Postman, Insomnia, or cURL.

### 1. Create a User

Send a POST request to http://localhost:3333/users:

- Body (JSON):

```bash
    {
      "email": "your-email@example.com",
      "name": "Your Name"
    }
```

Response: Copy the generated user id from the response.

### 2. Create a Board

Send a POST request to http://localhost:3333/boards:

- Body (JSON):

```bash
    {
      "title": "My Kanban Board",
      "ownerId": "PASTE_THE_USER_ID_HERE"
    }
```

- Response: Copy the generated board id from the response.

## 💻 Environment Setup (Frontend)

Navigate to the frontend directory and create a `.env` file to store your API URL and your Board configuration:

```bash
    cd apps/frontend
    touch .env
```

Inside `apps/frontend/.env`, define the following variables (replace with your actual values):

```bash
    VITE_API_URL="http://localhost:3333"
    VITE_BOARD_ID="PASTE_THE_BOARD_ID_HERE"
```

(Note: In `apps/frontend/src/App.tsx`, make sure to read this variable using `import.meta.env.VITE_BOARD_ID` to dynamic load your specific board!)

## 🚀 Running the Application

You can spin up both servers from the root directory using npm workspaces.

### Start the Backend

```bash
    npm run dev --workspace=apps/backend
```

The server will start running at `http://localhost:3333`.

### Start the Frontend

Open a new terminal window at the root and run:

```bash
    npm run dev --workspace=apps/frontend
```

The application will be live at `http://localhost:5173`.
