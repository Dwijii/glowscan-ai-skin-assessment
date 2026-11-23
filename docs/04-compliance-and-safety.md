# 04: Compliance and safety notes

These are design considerations, not legal advice.

| Topic | How the app handles it |
|---|---|
| Medical device risk | Positioned as cosmetic and entertainment. No diagnosis, disease or prescription language. Disclaimer on results |
| Biometric data | Photo held in browser memory, sent once for analysis, not stored by the app. Consent checkbox before contact details are used |
| Model provider data use | Check the API provider's current retention terms before production |
| Lead data | Not persisted in this repo. If connected to a CRM, the clinic becomes the controller and needs its own privacy policy |
| Abuse and cost | Per-IP rate limit, file type and size validation, server-owned prompt |
| Bias | Scores can vary with lighting, skin tone and camera quality. Enhancement-only language reduces harm, but outputs aren't validated across skin types. That's a known limitation |

## Markets considered in the original build

US and Canada: cosmetic wellness positioning, biometric consent (for example Illinois BIPA), Canadian privacy law (PIPEDA), and HIPAA questions if the tool were ever tied to patient records.
