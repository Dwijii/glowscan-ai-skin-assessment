# 03: Design decisions

## ADR-001: Gate results after the analysis, not before

The visitor sees "Your results are ready" *before* giving contact details. Showing that the value already exists raises form completion compared with asking for details up front. Trade-off: the model call is spent even if the visitor leaves, which is why rate limiting matters.

## ADR-002: Server-side proxy owns the prompt (changed for this repo)

**Original prototype (May 2026):** the browser built the full Anthropic request (prompt included), and a thin `/api/analyze` route forwarded it with the API key. Anyone could send any prompt through the proxy, so it was effectively an open relay on the key.

**This version:** the browser sends only `{ image, mediaType }`. The route adds the model, prompt and limits. Validation rejects other file types and files over about 5 MB.

## ADR-003: Generous, enhancement-only scoring

Scores are deliberately generous (overall 60–95), and notes use enhancement language with no medical terms. The tool is a marketing experience, not a diagnostic. Harsh or clinical output would hurt conversion and create risk.

## ADR-004: Treatment mapping in code, not in the model

The model returns *interest areas*. The app maps those to a fixed treatment menu. That keeps recommendations limited to what the clinic actually offers, and stops the model from naming procedures the clinic doesn't do.

## ADR-005: White-label through environment variables (changed for this repo)

The original hard-coded one agency's logo, advisor name and booking URL. Moving them to `NEXT_PUBLIC_*` variables lets the same deployment pattern serve any clinic, and keeps client identifiers out of the code.

## ADR-006: Explicit consent checkbox (added for this repo)

The original showed consent text under the form. This version requires a ticked checkbox plus a privacy link before results unlock, in line with the consent and biometric-privacy considerations noted during the original build (US/Canada market).

## Summary of changes from the original prototype

| Change | Reason |
|---|---|
| Prompt moved server-side; request body reduced to the image | Security (ADR-002) |
| File type and size validation, structured error codes | Robustness |
| Branding moved to env vars; client names removed | Confidentiality and reuse |
| Consent checkbox | Privacy |
| Medical-advisor attribution removed | Not applicable to a fictional clinic |
