Developer Onboarding Guide (Expanded)
🔧 Environment Setup
Node.js  18+

Appwrite project created

Collections created with correct permissions

Vercel account (optional)
🧪 Local Development
npm run dev

- Auto reloads on save
- Uses Vite for fast HMR

🧱 Build
npm run build

- Outputs to /dist.

🚀 Deployment
- Push to GitHub → Vercel auto‑deploys
- Use preview deployments for testing
- Clear Vercel cache if stale files appear

🧹 Code Organization Rules
- UI → /components
- Hooks → /utils/useSomething.js
- Pure logic → /utils or /lib
- Pages → /pages
- Appwrite client → /appwrite.js
