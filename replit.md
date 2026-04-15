# Vaultalk — AI-Witnessed Freelance Contract Negotiations

Built for Streamathon hackathon by StreamPay.sa (Saudi fintech). Freelancers and clients negotiate in a real-time chat room; an AI extracts contract terms live; when both agree, a StreamPay payment link locks funds in escrow.

## Architecture

```
/ (vaultalk frontend — React + Vite, port 25368)
/api (api-server — Express, port 8080)
```

### Tech Stack
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + shadcn/ui + wouter routing
- **Backend**: Express 5 + TypeScript, compiled with esbuild
- **AI**: Replit AI proxy → Claude (claude-haiku-4-5) via `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` + `AI_INTEGRATIONS_ANTHROPIC_API_KEY` (auto-provisioned, no key needed)
- **Chat**: getstream.io Stream Chat (SDK: `stream-chat`) — graceful fallback to demo mode when `STREAM_API_KEY` / `STREAM_API_SECRET` not set
- **Payments**: StreamPay.sa API (`x-api-key: STREAMPAY_API_KEY`) — graceful fallback to demo mode
- **State**: All in-memory (no DB — hackathon scope)
- **API Codegen**: Orval from OpenAPI spec at `lib/api-spec/openapi.yaml`

## Key Files

### Backend (artifacts/api-server/src/)
- `app.ts` — Express app, mounts router at `/api`
- `routes/auth.ts` — POST /api/auth/join
- `routes/rooms.ts` — POST /api/rooms/create, GET /api/rooms/:roomId
- `routes/contract.ts` — POST /api/contract/generate, POST /api/contract/export
- `routes/payments.ts` — POST /api/payments/lock, POST /api/payments/release
- `lib/store.ts` — In-memory state (users, rooms, escrow, messages)
- `lib/ai.ts` — GPT-4o-mini contract term extraction
- `lib/streamchat.ts` — getstream.io integration with demo fallback
- `lib/streampay.ts` — StreamPay.sa payment link creation

### Frontend (artifacts/vaultalk/src/)
- `pages/JoinRoom.tsx` — Landing/join page
- `pages/NegotiationRoom.tsx` — Main negotiation room (two-column layout)
- `components/ChatView.tsx` — Custom chat (Stream Chat JS SDK + demo mode)
- `components/TermsPanel.tsx` — Live AI terms extraction (polls every 15s)
- `components/ContractModal.tsx` — Contract preview + StreamPay escrow lock
- `components/EscrowStatus.tsx` — Escrow status in header
- `contexts/UserContext.tsx` — User session state

## API Spec
Defined at `lib/api-spec/openapi.yaml`, codegen via Orval:
- Zod schemas → `lib/api-zod/`
- React Query hooks → `lib/api-client-react/`

## Environment Secrets Needed
- `STREAM_API_KEY` + `STREAM_API_SECRET` — getstream.io (provided at hackathon)
- `STREAMPAY_API_KEY` — StreamPay.sa (provided at hackathon)
- `SESSION_SECRET` — already provisioned
- Replit AI integration — already provisioned (auto-provides `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY`)

## Slash Commands (in-chat)
- `/agree` — signals agreement; triggers contract finalization
- `/release` — (client only) releases escrow payment to freelancer
- `/dispute` — freezes escrow funds, flags dispute

## Design
- Always-dark theme (forced via `document.documentElement.classList.add("dark")` in main.tsx)
- Accent: purple `#7F77DD` (HSL 245 57% 67%)
- Success: teal `#1D9E75` (HSL 161 69% 37%)
- Background: near-black `#0a0a0a`

## Demo Mode
When Stream / StreamPay API keys are missing, the app runs gracefully:
- Chat: messages stored in local React state (visible only in current browser tab)
- StreamPay: escrow record created in-memory, no real payment link
- AI extraction: still works (uses Replit AI integration)
