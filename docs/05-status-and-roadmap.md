# 05: Status and roadmap

## Status

| Item | Status |
|---|---|
| UI, flow and design | ✅ Built and iterated (May 2026) |
| Vision analysis prompt and JSON contract | ✅ Built |
| Server-side proxy and rate limiting | ✅ Built (hardened in this repo) |
| Builds with `next build` | ✅ Verified Nov 2026 |
| Production deployment for clients | 🟡 Not shown in this repo |
| CRM integration (lead → nurture) | ⬜ Not built |
| Validation across skin tones | ⬜ Not done |

## Roadmap

1. Lead webhook to a CRM with interest areas as tags, so nurture starts automatically.
2. Shared rate-limit store (Redis) and request logging.
3. An evaluation set of licensed or synthetic faces across Fitzpatrick types to check score stability.
4. Admin config for each clinic's treatment menu.
