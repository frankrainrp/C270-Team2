# C270_FA Agent API

Basic Express + MongoDB backend framework for the Butler refactor.

## Setup

```bash
pnpm install
copy .env.example .env
docker compose up -d
pnpm dev
```

Default server:

```text
http://localhost:4010
```

## Routes

```text
GET    /api/health
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

GET    /api/notes
POST   /api/notes

POST   /api/agent/run
```

## Agent actions

`POST /api/agent/run`

```json
{
  "actionName": "AddTask",
  "data": {
    "taskName": "C270 - Finish refactor plan",
    "dueDate": "2026-07-05",
    "dueTime": "23:59"
  }
}
```

Supported first actions:

- `AddTask`
- `ListTasks`
- `AddNote`
- `ListNotes`
