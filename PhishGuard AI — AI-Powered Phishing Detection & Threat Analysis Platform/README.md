
# PhishGuard AI – Universal Fraud & Phishing Detection Platform

PhishGuard AI is an advanced cybersecurity platform designed to protect users from phishing, scams, and social engineering across all communication channels.

## System Architecture

```text
[ USER INTERFACE ]
       |
       v
[ REACT FRONTEND (TS/TAILWIND) ]
       |
       |--- [ DASHBOARD & ANALYTICS MODULE ]
       |--- [ MULTI-CHANNEL SCANNER MODULE ]
       |--- [ HISTORY & FORENSICS STORAGE ]
       |
       v
[ GEMINI AI CORE ]
       |
       |--- [ OCR / COMPUTER VISION ENGINE ] (Image Analysis)
       |--- [ NLP INTENT ANALYSIS ] (Social Engineering Detection)
       |--- [ DOMAIN & URL ANALYZER ] (Typosquatting Detection)
       |--- [ THREAT SCORING ENGINE ] (0-100 Risk Rating)
       |
       v
[ OUTPUT: THREAT LEVEL / SCORE / FORENSIC EVIDENCE ]
```

## Features

- **Omnichannel Support**: Emails, SMS, Telegram, WhatsApp, URLs, and QR Codes.
- **Deep Analysis**: Intent detection using LLMs to find hidden social engineering tactics.
- **Visual Intelligence**: OCR for scanning screenshots and QR code redirection analysis.
- **Cybersecurity UI**: Dark-mode focused, interactive dashboard with real-time risk metering.

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts.
- **AI Engine**: Google Gemini API (Flash/Pro) for NLP and OCR.
- **State Management**: React Hooks.
- **Design**: Modern SaaS aesthetic with Glassmorphism and Cybersecurity motifs.

## Security & Ethics

- **Passive Analysis**: We never click or execute links.
- **Privacy**: No personal identifiable information (PII) is stored in the core analysis pipeline.
- **Education**: Provides clear recommendations for every threat detected.

## Deployment

This is a standalone React application. To deploy:
1. Ensure your Gemini API Key is available in the environment as `API_KEY`.
2. Build the project using your favorite bundler (Vite/Webpack).
3. Host on platforms like Vercel, Netlify, or AWS.
