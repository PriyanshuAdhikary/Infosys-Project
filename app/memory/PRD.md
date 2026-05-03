"# TaskSync — Team Task Manager



\## Original Problem Statement

Complete single-page React application for a \\"Team Task Manager\\" using Tailwind CSS, Framer Motion, and Lucide React. Premium modern dark mode with deep slate/navy background and glassmorphism. User state { isLoggedIn, role 'Admin'|'Member', token }. Login screen + Dashboard with role-based admin panel, task board (title, project, assignee, due date, status badge), click-to-update status, Framer Motion page transitions + staggered card entrance + hover lift/glow.



\*\*User choices (2026-05-03):\*\* Full-stack (FastAPI + MongoDB), mock login (any credentials), drag-and-drop Kanban columns added as extra, default font pairing.



\## Architecture

\- \*\*Backend:\*\* FastAPI (`/app/backend/server.py`) + MongoDB (motor async). All routes under `/api`.

&#x20; - `GET /api/` health

&#x20; - `POST /api/auth/login` mock auth, returns `{token, username, role}`

&#x20; - `GET|POST /api/projects`

&#x20; - `GET|POST /api/tasks`, `PATCH /api/tasks/{id}` (status), `DELETE /api/tasks/{id}`

&#x20; - Startup seeder: 3 projects, 8 tasks (idempotent via count check)

\- \*\*Frontend:\*\* React + Tailwind + Framer Motion + @hello-pangea/dnd + Lucide React.

&#x20; - `App.js` — user state + AnimatePresence between Login / Dashboard

&#x20; - `components/Login.jsx` — glassmorphic login card, role toggle

&#x20; - `components/Dashboard.jsx` — sticky header, glowing role badge, stats cards, search

&#x20; - `components/AdminPanel.jsx` — conditional (Admin only) create-project + assign-task forms

&#x20; - `components/KanbanBoard.jsx` — 3 droppable columns with DnD

&#x20; - `components/TaskCard.jsx` — title, project, assignee (avatar), due date, status + priority

&#x20; - `components/TaskModal.jsx` — click-to-update status modal

&#x20; - `lib/api.js` — axios client on `REACT\_APP\_BACKEND\_URL`



\## Design System

\- Dark slate-950 background, glassmorphic cards (`bg-slate-900/60 backdrop-blur-xl border-white/10`)

\- Indigo + Emerald accents; ambient radial-gradient orbs; subtle grain overlay

\- Fonts: Manrope (display), Plus Jakarta Sans (body), JetBrains Mono (mono)



\## User Personas

\- \*\*Admin\*\* — creates projects, assigns tasks, manages board.

\- \*\*Member\*\* — views board, drags tasks across columns, updates status.



\## What's Been Implemented (2026-05-03)

\- Full-stack TaskSync MVP with all required animations, glassmorphism, role-based views.

\- Backend seeded with realistic mock data (projects, tasks with avatars).

\- Drag-and-drop between status columns with optimistic UI + backend persistence.

\- Task modal for click-based status changes.

\- Search/filter, stat cards, hover lift + glow, staggered entrance animations.

\- 100% passing backend (pytest) and frontend (Playwright) tests.



\## Prioritized Backlog

\*\*P1\*\*

\- Real auth (JWT or Emergent Google Auth) replacing mock login

\- Per-user task assignment enforcement on backend

\- Edit + delete task UI surfaces (backend already supports delete)

\*\*P2\*\*

\- Comments / activity log per task

\- Email notifications when assigned

\- Team / workspace management

\- Migrate `@app.on\_event` to FastAPI lifespan context

\- Subtasks, attachments, due-date reminders

"

