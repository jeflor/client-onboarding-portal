# Client Onboarding Portal

A polished internal operations tool for moving a closed-won deal from
contract signed to ready-for-delivery — without the chaos.

**Live demo:** https://jeflor.github.io/client-onboarding-portal/

Built as a portfolio piece. Designed and shipped in close collaboration with
Claude Code + Cursor.

## What's inside

- **4 distinct role dashboards** — Sales sees their handoffs and the promises
  they made; Onboarding Manager sees queue health and at-risk accounts;
  Implementation sees missing technical inputs and configurations in flight;
  Client Success sees ready-for-transition accounts and adoption health.
- **Onboarding queue** — Kanban-style view across the 7 active stages with
  per-card friction signals (blockers, data issues, days-in-stage, AI
  insights).
- **Client detail drawer** — 10 tabs of operational depth: Overview,
  Checklist (synthesized from playbook), Stakeholders, Sales handoff &
  promises, Blockers, Tasks, Approvals, Documents, Internal comments,
  History.
- **Tasks** — grouped by Client tasks / Internal / Approvals / Dependencies /
  Launch prep, with overdue and blocked filters.
- **Approvals** — pending sign-offs grouped by type (legal, billing, scope,
  implementation, client, security) with aging and risk-if-delayed.
- **Documents** — central hub with status (missing / pending review /
  approved / expired) and per-row request/approve actions.
- **Timeline** — live event stream of handoffs, blockers, kickoffs,
  approvals, stage changes, and go-lives.
- **AI Onboarding Assistant** — slide-out panel with context-aware quick
  actions (summarize risk, identify blockers, draft client follow-up,
  summarize missing requirements, draft reminder, summarize sales handoff,
  flag scope risk, suggest next action).
- **Quick log** — `⌘L` from anywhere opens a modal for logging notes,
  client/internal tasks, blockers, or approvals against any client.

The data is intentionally messy: ghosted exec sponsors, rescheduled
kickoffs, scope ambiguity from sales handoffs, partial intake forms, expired
asset uploads, manual overrides on go-live dates. That's what real
onboarding looks like.

## Stack

- Vite + React + TypeScript
- Tailwind CSS (custom enterprise palette · teal-leaning)
- Recharts (sparklines)
- Lucide icons
- React Router (HashRouter — works on GH Pages without server-side rewrites)
- 100% mock data, no backend

## Develop

```bash
npm install
npm run dev    # http://localhost:5173/client-onboarding-portal/
npm run build  # outputs dist/
npm run deploy # builds and pushes to gh-pages branch
```
