# NyayPath (न्यायपथ) — AI Legal Aid Assistant for Ordinary Citizens

NyayPath is a mobile-first AI legal aid assistant designed for Indian citizens facing legal issues such as harassment, unpaid money, tenancy disputes, cheque bouncing, consumer fraud, cybercrime, domestic violence, and RTI drafting.

> **Principle:** Informational legal guidance, not legal advice. NyayPath is never a lawyer. Always cheapest-lawful-route first, always cited to real law text, always safe in emergencies.

---

## Architecture & Technology Stack

NyayPath is organized as a lightweight monorepo with three core services:

```
nyaypath/
├── client/          # Mobile-first Next.js (App Router) + React + Tailwind CSS
├── server/          # Node.js + Express REST API (RAG, Gemini orchestration, Mongoose)
├── ml-service/      # Python + FastAPI (scikit-learn TF-IDF + Logistic Regression)
└── docs/            # Single source of truth PRD and evaluation datasets
```

- **Frontend:** Next.js (App Router), React, Tailwind CSS (Mobile-first PWA).
- **Backend API:** Node.js, Express, Mongoose (MongoDB), `@google/genai` SDK, Zod schema validation.
- **ML Microservice:** Python 3.10+, FastAPI, scikit-learn, joblib (Issue category & urgency classification).
- **Legal Knowledge Base:** Curated Indian statutes grounded via RAG (BNS, BNSS, BSA 2023, Consumer Protection, RTI, NI Act, etc.).

---

## Milestone Status

- [x] **Milestone M0: Monorepo Scaffold & Health Endpoints** *(Current)*
  - Monorepo structure created: `client/`, `server/`, `ml-service/`, `docs/`.
  - Environment examples with safe placeholders.
  - Basic health endpoints implemented and tested across services.
  - Strict developer and agent guidelines established in `AGENTS.md`.
- [ ] **Milestone M1:** Legal corpus ingestion + RAG retrieval (`npm run ingest`)
- [ ] **Milestone M2:** Chat API with structured Gemini output + card-based UI
- [ ] **Milestone M3:** ML classification & emergency gate integration
- [ ] **Milestone M4:** Multimodal media upload & fact extraction
- [ ] **Milestone M5:** Voice input (STT) and spoken summary (TTS)
- [ ] **Milestone M6:** Document drafting (RTI, complaints, legal notices)
- [ ] **Milestone M7:** Guest mode, conversation history, and privacy controls
- [ ] **Milestone M8:** Safety evaluation (50-scenario golden set) and production deployment

---

## Prerequisites

- **Node.js**: v18.0.0 or later (tested on v24.x)
- **npm**: v9.0.0 or later
- **Python**: v3.10 or later (with `pip` and `venv`)

---

## Local Setup & Quickstart

### 1. Environment Configuration

Copy the example environment files in each service directory:

```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.local.example client/.env.local

# ML Service environment
cp ml-service/.env.example ml-service/.env
```

*(Note: On Windows PowerShell, use `Copy-Item server/.env.example server/.env`)*

---

### 2. Client (Next.js)

```bash
cd client
npm install
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).
To verify production build readiness:
```bash
npm run build
```

---

### 3. Server (Express REST API)

```bash
cd server
npm install
npm run dev
```

The server will start on [http://localhost:5000](http://localhost:5000).
- Health check: `curl http://localhost:5000/health`
- API health check: `curl http://localhost:5000/api/health`

---

### 4. ML Service (FastAPI)

```bash
cd ml-service

# Create and activate virtual environment
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The ML service will start on [http://localhost:8000](http://localhost:8000).
- Health check: `curl http://localhost:8000/health`
- Interactive API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Safety & Invariants

1. **Emergency First:** Immediate red banner and direct tap-to-call buttons for 112 / 181 / 1098 / 1930 whenever active danger or violence is detected.
2. **Citation Grounding:** Every legal claim must reference an exact section and act from verified legal corpus chunks.
3. **No Hallucinated Law:** If legal chunks do not support a claim, the system directs the citizen to free legal aid (NALSA / Tele-Law / DLSA).
4. **Data Privacy:** DPDP Act 2023 compliant. Guest-first mode, zero persistent PII logging, and explicit "Delete my data" functionality.
