# Vaultalk 🛡️

**AI-Witnessed Freelance Contract Negotiation Platform**

Built for the **Streamathon 2026 Hackathon** by StreamPay.sa

---

## What is Vaultalk?

Vaultalk eliminates the trust gap between freelancers and clients. Every negotiation is witnessed by Claude AI, payments are secured through StreamPay escrow, and deliverables are AES-256 encrypted — only unlocked when the StreamPay invoice ID confirms payment.

---

## How It Works

1. **Negotiate** — Client and freelancer chat in a real-time Stream Chat room
2. **AI Witness** — Claude AI reads every message and extracts contract terms (price, deadline, revisions) automatically
3. **Encrypt** — Freelancer uploads deliverables; files are AES-256 encrypted before storage
4. **Pay** — Client pays via StreamPay escrow
5. **Unlock** — StreamPay releases the invoice ID on payment success, which is the decryption key — files are now accessible to the client

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Chat | [Stream Chat](https://getstream.io) |
| Payments & Escrow | [StreamPay.sa](https://streampay.sa) |
| AI Contract Extraction | [Claude AI (Anthropic)](https://anthropic.com) |
| Frontend | React + Vite + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express |
| File Encryption | AES-256 |

---

## Features

- **Real-time negotiation rooms** powered by Stream Chat
- **AI contract term extraction** — Claude reads every message and pulls out price, deadline, and revision count
- **StreamPay escrow** — funds held safely until deliverables are confirmed
- **AES-256 encrypted file delivery** — the StreamPay invoice ID is the decryption key
- **Souk marketplace** — companion marketplace where buyers click "Negotiate with Vaultalk" to auto-create a room
- **Gated file access** — deliverables are hidden from clients until payment is released
- **Interactive pitch deck** at `/pitch` — 11-slide presentation, click-through, fullscreen capable

---

## Business Model

| Stream | Revenue |
|--------|---------|
| Transaction Fee | 1.25% per escrowed deal |
| Pro Plan | 35 SAR/month + 0.75% per deal |
| Enterprise API | White-label licensing |
| StreamPay Rev-Share | Revenue split on every escrow |

---

## Demo Accounts

| Username | Password | Role |
|----------|----------|------|
| `demo_buyer` | `demo123` | Buyer |
| `zaid_dev` | `demo123` | Freelancer |
| `sara2` | `demo123` | Seller |

---

## Project Structure

```
/
├── artifacts/
│   ├── vaultalk/        # Main web app (React + Vite)
│   ├── api-server/      # Backend API (Express)
│   └── souk/            # Souk marketplace companion app
└── packages/            # Shared workspace packages
```

---

## Live Demo

The interactive pitch deck is available at `/pitch` on the deployed app.

---

*Made with ❤️ for Streamathon 2026 · StreamPay.sa*
