# Swadhikar (स्वाधिकार) Workspace

## Overview

Swadhikar ("one's own rights") is an AI-powered civic rights platform for India. It helps users understand their legal rights, farmer welfare schemes, and government benefits through a WhatsApp-style conversational chat interface. It supports 10+ Indian languages.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/swadhikar)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Styling**: Tailwind CSS v4

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── swadhikar/          # React + Vite frontend (chat UI, landing page)
│   └── api-server/         # Express API server
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### Three Core Modules (simulated via chat responses)

1. **Legal Advisor** — Rights navigation for tenants, workers, consumers. RTI filing guidance. DLSA locator.
2. **Kisan Navigator** — PM Fasal Bima Yojana, Kisan Credit Card, PM-KISAN, NABARD schemes.
3. **Sarkar Yojana Finder** — 300+ government scheme discovery (Ayushman, PMAY, Ujjwala, pensions).

### UI/UX
- WhatsApp-style chat interface
- Welcome message on first load
- Quick reply chips for common queries
- Language selector (10 Indian languages)
- Typing indicator animation
- Module-colored response badges
- Session persistence via localStorage

## API Endpoints

- `POST /api/chat` — Send message, get AI response
- `GET /api/chat/history?sessionId=<id>` — Fetch chat history for session
- `GET /api/healthz` — Health check

## Database

- Table: `chat_messages` — stores all chat messages with sessionId, role, message, module, language, createdAt

## Running

- `pnpm --filter @workspace/swadhikar run dev` — Frontend
- `pnpm --filter @workspace/api-server run dev` — Backend
- `pnpm --filter @workspace/db run push` — DB schema push
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API client

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. Run `pnpm run typecheck` from the root.
