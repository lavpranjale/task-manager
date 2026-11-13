# Taskflow — MERN Task Manager

A focused task manager built with **MongoDB**, **Express**, **React**, and **Node.js**. Create, edit, complete, filter, and delete tasks — persisted in MongoDB Atlas and deployable on Vercel.

**Live demo:** _Add your Vercel URL after deploy_

**Repository:** [github.com/lavpranjale/task-manager](https://github.com/lavpranjale/task-manager)

---

## Features

- Create tasks (title + optional description)
- Mark complete / incomplete
- Inline edit and delete (with confirm)
- Filters: All / Active / Done
- Loading, empty, and error states
- REST API with validation

## Tech stack

| Layer    | Choice                          |
| -------- | ------------------------------- |
| Frontend | React 19 + Vite                 |
| Backend  | Express (Node.js)               |
| Database | MongoDB Atlas (Mongoose)        |
| Deploy   | Vercel (static UI + serverless API) |

## Project structure

```
├── client/          # React (Vite) UI
├── server/          # Express + Mongoose API
├── api/             # Vercel serverless entry → Express app
├── vercel.json
└── package.json
```

## Local setup

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (free M0 is fine) and connection string

### 1. Install

```bash
npm run install:all
```

### 2. Environment

```bash
cp server/.env.example server/.env
# Edit server/.env and set MONGODB_URI
```

### 3. Run API + UI

```bash
# Terminal 1 — API on http://localhost:5000
npm run dev:server

# Terminal 2 — UI on http://localhost:5173 (proxies /api → :5000)
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Run API tests

```bash
npm test
```

Uses an in-memory MongoDB (does not touch Atlas). Covers create, validation, list, update, delete, and 404.

## API

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/tasks?filter=all\|active\|completed` | List tasks |
| `POST` | `/api/tasks` | Create `{ title, description? }` |
| `PUT` | `/api/tasks/:id` | Update title / description / completed |
| `DELETE` | `/api/tasks/:id` | Delete task |

## Deploy (Vercel + Atlas)

1. Create an Atlas M0 cluster, database user, and allow network access `0.0.0.0/0`.
2. Push this repo to GitHub and import it in [Vercel](https://vercel.com).
3. Set project env var **`MONGODB_URI`** to your Atlas connection string.
4. Deploy. Vercel builds the Vite client and routes `/api/*` to the Express app (`server/index.js`).

## Design decisions (summary)

1. **MERN + Atlas M0 + Vercel** — one live URL reviewers can click, with a real database.
2. **CRUD + filters only** — proves full-stack skills without bloating a 24-hour assessment.
3. **Serverless Express on Vercel** — frontend and API share one deployment.

## What I chose not to implement

1. **Authentication / multi-user ownership** — JWT and per-user scoping would dominate the timeline; a shared board is enough to demonstrate the stack.
2. **Real-time sync (WebSockets)** — overkill for a solo interview demo; refetch after mutations is clear and reliable.
3. **Drag-and-drop reorder** — nice UX, but validation, filters, and a live deploy matter more in 24 hours.

## Implementation limitation (extra day)

The board is **public and shared** — anyone with the URL can change every task. With one more day I would add **JWT auth**, attach `userId` to tasks, and protect all write routes so each user only sees their own list.

---

Built as a take-home assessment for a MERN Stack Developer role.
