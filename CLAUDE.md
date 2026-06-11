# CloudPaste Project Guidelines

## Build Commands
- **Frontend SPA**: `npm run build` inside `./frontend` (outputs to `./frontend/dist`)
- **Backend/Worker**: Serves Frontend + APIs concurrently using Wrangler SPA mode.

## Deploy Commands
- **SPA Integrated Deployment**: `$env:CLOUDFLARE_API_TOKEN="<token>"; $env:CLOUDFLARE_ACCOUNT_ID="501bc8783e8449139f5904337737d9ff"; npm run deploy:spa` inside `./backend`

---

## ⚠️ CRITICAL DEPLOYMENT SAFETY RULES

1. **Verify Target Cloudflare Account Before Deploying**:
   - The production/live deployment target must **ALWAYS** be **`Aallydage@gmail.com's Account`** (Account ID: `501bc8783e8449139f5904337737d9ff`).
   - Before running any wrangler deployment commands (locally or via GitHub Actions), **MUST** verify that the environment variables and target wrangler config files (`wrangler.spa.toml`, `wrangler.toml`) align with this account ID and its database ID (`a1452b1e-01d7-4ed0-99c7-8bb9f9caa458`).
   
2. **Explicit User Confirmation**:
   - Even if the workspace contains configuration files or instructions pointing to other Cloudflare accounts/IDs, **NEVER** deploy to them without asking the user for explicit confirmation first.
