ONBOARDING CHECKLIST — Kite

This checklist helps a developer get productive quickly when taking over the Kite codebase.

1) Access & accounts
- Get repository access (GitHub: hafizrein/Kite) and invite your GitHub username.
- Get Firebase project access (owner should invite your Google account).
- Request access to any billing/Google Cloud projects if you need to deploy App Hosting.
- Obtain API keys/secrets (Google AI key) securely from the owner. Do NOT commit them to git.

2) Local dev environment
- Install Node.js 18+ and npm.
- (Optional) Install Firebase CLI: `npm i -g firebase-tools`.
- Clone the repo and install dependencies:
  - `git clone <repo-url>`
  - `cd Kite`
  - `npm ci`

3) Environment variables
- Copy `env.example` -> `.env.local` and add the real values:
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID
  - GOOGLE_GENAI_API_KEY
- For production, add these to Firebase App Hosting environment settings instead of committing.

4) Start local servers
- Run the app:
  - `npm run dev` (Next.js dev server)
- If you plan to use AI flows during development:
  - `npm run genkit:dev`
- Open http://localhost:3000 and verify the app loads.

5) Run quick quality checks
- `npm run typecheck`
- `npm run lint`
- `npm run build` (ensure it builds without errors)

6) Important places to look (first 60–90 minutes)
- `src/app/(main)/` — main app routes (dashboard, projects, crm, timesheets, settings)
- `src/lib/firebase.ts` — Firebase init and env wiring
- `src/lib/firestore.ts` — Service layer for Firestore operations
- `src/contexts/` — App and Auth context (global state and user/org switching)
- `src/components/forms/` — Forms used across app (project/account/opportunity)
- `src/ai/` — Genkit flows and AI integration

7) Deploy (high level) — NOTE: usually handled by the deployment owner

Deployment is typically the responsibility of the operations/hosting owner. You should coordinate with them to confirm access and environment variables. If you're asked to prepare a build for them, run the build locally and hand over the artifact or CI logs.

- Confirm Firebase project and billing with the deployment owner (App Hosting requires Blaze plan).
- To prepare a build for them (for handoff only): `npm run build` (do not deploy unless explicitly requested).

For reference (deployment owner only): `firebase deploy` or follow `DEPLOYMENT_GUIDE.md`

8) Housekeeping (first PRs)
- Add or update `docs/HANDOVER.md` contact section with the real owners.
- Add CI to run typecheck/lint/build on PRs.
- Add a small smoke test to verify app boots after deploy.

9) Security
- Rotate keys that were shared during transfer (Google AI key, service account keys).
- Confirm Firestore rules and App Hosting env variables do not expose secrets in logs.

10) Who to contact (fill in during handover)
- Firebase / billing owner: __________________
- Product owner: __________________
- Primary developer/maintainer: __________________


That's it — follow this list and open issues for any missing access or clarifications.