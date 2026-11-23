# 01: Requirements

## Users

| User | Goal |
|---|---|
| Prospect (clinic website visitor) | A quick, fun, flattering read on their skin and hair; ideas for treatments |
| Clinic | More and better-qualified consultation bookings; context on what each lead wants |
| Agency | One app that can be re-branded for many clinics |

## Functional

| ID | Requirement |
|---|---|
| F1 | Capture a face photo by upload or camera |
| F2 | Return skin (8) and hair (6) scores, type, age range, highlights and interest areas |
| F3 | Show results only after name, email and consent |
| F4 | Map interest areas to the clinic's treatment menu |
| F5 | Send the visitor to the clinic's booking page |
| F6 | Re-brand without code changes |

## Non-functional

| Area | Requirement |
|---|---|
| Security | API key never reaches the browser; the prompt can't be altered by the client |
| Cost | Cap usage per visitor; one model call per scan |
| Privacy | Photo processed in real time, not stored; explicit consent before contact details are used |
| Positioning | Cosmetic and entertainment language only; no medical claims |
| Performance | Result in under about 15 seconds; friendly errors on failure |
