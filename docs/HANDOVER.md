Project Handover — Kite

This document is a single-stop reference for a developer taking over the Kite codebase. It covers the project purpose, architecture, developer setup, deployment, important places in the codebase, common workflows, and recommended next steps.

1) High-level summary

- Name: Kite — a Professional Services Automation (PSA) web app (Projects, CRM, Timesheets, AI optimization).
- Tech: Next.js (App Router), TypeScript, React, Tailwind CSS, Firebase (Auth + Firestore + App Hosting), Genkit/Google Gemini for AI features.

Why this repo exists: provide an integrated tool for managing projects, opportunities, time tracking and to provide AI-driven recommendations for resource allocation.

2) Quick start (dev) — Windows PowerShell

Prerequisites:
- Node.js 18+ and npm
- Firebase CLI (optional for deploy) — npm i -g firebase-tools
- Access to the Firebase project (get project id and environment secrets from the owner / org)

Steps:

1. Clone and install dependencies

```powershell
git clone <repo-url>
cd Kite
npm ci
```

2. Create environment file

Copy `env.example` to `.env.local` and fill in values. Required env vars (examples present in `env.example`):

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- GOOGLE_GENAI_API_KEY (for AI features)

3. Run development servers

Open one terminal for the Next app and one for the Genkit AI dev process:

```powershell
# Terminal 1 - app
npm run dev

# Terminal 2 - AI genkit (optional for AI features)
npm run genkit:dev
```

Access: http://localhost:3000

4. Quality gates (before push / release)

```powershell
npm run typecheck
npm run lint
npm run build
```

If these pass, the codebase is in a healthy, buildable state.

3) Deployment (NOT the new developer's responsibility)

Important: Deployment of the production app is handled by the operations/hosting owner (the person or team responsible for the Firebase project and billing). As the incoming developer you do not need to perform production deployments unless explicitly asked.

If you must handover access or coordinate deployment, provide the new owner the credentials and confirm billing/hosting settings. Update the "Contacts & access" section (section 14) with the deployment owner's details before transfer.

For reference only (commands the deployment owner may use):

- firebase login
- firebase projects:list
- npm run build
- firebase deploy

Notes for the deployment owner:
- App Hosting typically requires billing enabled on the Firebase project (Blaze plan). The `DEPLOYMENT_GUIDE.md` explains this.
- Ensure environment variables used by the app are configured in the Firebase App Hosting environment settings or provided to the build process. Do not expect developers to commit secrets.

4) Key scripts (package.json)

- npm run dev — Next.js dev server (Turbopack)
- npm run genkit:dev — Start Genkit for AI features (tsx src/ai/dev.ts)
- npm run build — Next production build
- npm run start — Start built app
- npm run lint — Linting
- npm run typecheck — TypeScript type check

5) Important files & where to look

- `src/app/` — Next.js App Router; top-level routes and pages live here (look under `(main)` for main app pages).
- `src/components/` — Reusable UI components and forms.
- `src/components/forms/` — Forms for Account/Project/Opportunity.
- `src/components/wbs-tree.tsx` — Work Breakdown Structure editor component.
- `src/contexts/` — App and Auth contexts (`app-context.tsx`, `auth-context.tsx`). Key for global state, user and organization switching.
- `src/lib/firebase.ts` — Firebase initialization. First place to check environment variable wiring.
- `src/lib/firestore.ts` — Firestore service layer and common helpers (projectsService, accountsService, convertOpportunityToProject, WBS functions).
- `src/lib/types.ts` — Types for domain models (Project, Opportunity, Account, User, etc.).
- `src/ai/` — Genkit/AI integration (dev.ts, genkit.ts, flows/...). Important for AI features and Google Gemini integration.
- `firebase.json`, `apphosting.yaml` — Firebase hosting & apphosting config used for deployment.
- `next.config.ts` — Next.js configuration.

6) Data model & Firestore layout (important collections)

Typical collections used across codebase (look in `src/lib/firestore.ts`):

- users
- projects
- accounts
- opportunities
- timeEntries
- projects/{projectId}/wbs/tree — single document storing the WBS tasks for a project

Notes:
- Attachments: currently metadata-only (no cloud storage integration) — see `createAttachmentMetadata` in `firestore.ts`.

7) Authentication & Authorization

- Firebase Authentication is used (email/password and Google provider enabled in the project).
- Role-based access is implemented at the app level (Owner, Admin, PM, Sales, Member). Check `auth-context.tsx` and any role checks in UI components.

8) Common workflows & where to update them

- Create project: UI in `src/app/(main)/projects/page.tsx` and form in `src/components/forms/project-form.tsx`. Data persistence via `projectsService`.
- Convert opportunity to project: `convertOpportunityToProject` in `src/lib/firestore.ts` performs the batch write. Update business logic there.
- WBS editing: `WBSTree` component + `getProjectWBSTasks` / `saveProjectWBSTasks` in `src/lib/firestore.ts`.
- Timesheets: `src/app/(main)/timesheets` folder.

9) AI integration

- Genkit is used to connect to Google AI. The local dev script is `npm run genkit:dev` which runs `src/ai/dev.ts`.
- The AI features require `GOOGLE_GENAI_API_KEY` (add to `.env.local` or the hosting environment variables).
- The AI flows are under `src/ai/flows/` — adapt or add new flows here.

10) Troubleshooting / Gotchas

- Missing env variables: `src/lib/firebase.ts` logs an error if Firebase config is missing. Make sure `.env.local` or the hosting env variables are set correctly.
- Deploy errors: App Hosting requires billing — ensure the Firebase project has Blaze plan enabled.
- Static asset or image issues: check `next.config.ts` and hosting rewrites.
- Firestore permission errors: ensure Firestore rules and the signed-in user roles allow the requested operations.

11) Security & secrets

- Do NOT commit `.env.local` or any secret keys. Use Firebase App Hosting environment variables for production secrets.
- If transferring ownership, rotate keys that are stored in any shared places (Google AI key, Firebase service accounts).

12) Onboarding checklist (short)

See `docs/ONBOARDING_CHECKLIST.md` for a compact step-by-step checklist that a new developer can follow.

13) Recommended immediate improvements (low-risk)

- Add automated tests (unit + integration) — there are currently none.
- Add CI pipeline to run typecheck, lint, build and a smoke test on PRs.
- Add small e2e smoke test that verifies the app boots and the auth flow (can be done with Playwright).
- Move attachments to real cloud storage (Firebase Storage) if file uploads are required.

14) Contacts & access (update before handover)

- Replace this section with the real people who can provide access to Firebase, billing, domains, and the AI key. Include Slack/email and any vendor accounts (Firebase, Google Cloud).

---

If you want, I can also:

- Add a short Architecture diagram (ASCII or Mermaid) into this doc.
- Add a CI example (GitHub Actions) that runs typecheck, lint and build on PRs.
