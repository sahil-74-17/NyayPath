# AGENTS.md — Developer and AI Agent Guidelines for NyayPath

## 1. Project Overview & Core Mission
**NyayPath** is an AI-powered legal aid assistant designed for ordinary Indian citizens facing legal issues (money recovery, tenancy, cheque bouncing, harassment, cybercrime, domestic violence, consumer disputes, RTI, etc.).
- **Core Principle:** NyayPath provides **informational legal guidance, not legal advice**, and is **never a lawyer**.
- **Golden Rule:** Always propose the cheapest lawful route first, always cite real law sections from the curated knowledge base, and always prioritize safety in emergencies.
- **Single Source of Truth:** `docs/PRD.md` is the authoritative specification for all features, architecture, schemas, and milestones.

---

## 2. Milestone-Driven Development Workflow
Development must proceed strictly **one milestone at a time**. Never jump ahead or implement components belonging to later milestones.

| Milestone | Scope | Status |
|---|---|---|
| **M0** | Monorepo scaffold (`client/`, `server/`, `ml-service/`, `docs/`), env examples, basic health endpoints, README | **COMPLETED** |
| **M1** | Legal corpus ingestion + RAG retrieval (`npm run ingest`, vector search in MongoDB, debug search endpoint) | UPCOMING |
| **M2** | Chat API with structured Gemini output + card-based Chat UI | PENDING |
| **M3** | ML service: dataset, training, `/classify`, emergency gate integration | PENDING |
| **M4** | Media upload + fact extraction + user confirmation step | PENDING |
| **M5** | Voice input/output (STT via Gemini, TTS via browser speechSynthesis) | PENDING |
| **M6** | Document drafting (RTI, complaints, legal notices) + HTML preview + PDF print | PENDING |
| **M7** | Guest mode / auth, conversation history, feedback, "Delete my data" | PENDING |
| **M8** | Safety evaluation (50-scenario golden set), polish, production deployment | PENDING |

---

## 3. Technology Stack & Strict Boundaries

### Allowed Technologies (PRD Section 6)
- **Frontend (`client/`):** Next.js (App Router), React, Tailwind CSS, Lucide icons (or lightweight icons).
- **Backend (`server/`):** Node.js, Express, Mongoose / MongoDB, `@google/genai` SDK, `zod` (runtime schema validation), `multer` (file handling), `helmet`, `cors`, `express-rate-limit`, `dotenv`.
- **ML Service (`ml-service/`):** Python 3.10+, FastAPI, Uvicorn, scikit-learn (TF-IDF + Logistic Regression), joblib, pandas, numpy.
- **RAG & Vectors:** In-memory cosine similarity over MongoDB embeddings (or Atlas Vector Search for scale).
- **Document Generation:** HTML templates filled by server, printed/exported via browser CSS print stylesheet (Unicode-safe for Hindi/Devanagari).

### Prohibited Technologies & Overengineering (PRD Section 6 & 117)
- **DO NOT ADD:** GraphQL, Redux, LangChain, LlamaIndex, vector DB servers (e.g. Pinecone/Chroma/Milvus unless specified), microservice service-meshes, Kubernetes, or heavy PDF rendering engines (Puppeteer/wkhtmltopdf).
- Plain functions and lightweight modules are strictly preferred over complex abstractions.

---

## 4. Repository & Monorepo Structure

```
nyaypath/
├── AGENTS.md                  # This document
├── README.md                  # Project overview & quickstart
├── .gitignore                 # Root gitignore protecting all secrets and artifacts
├── docs/                      # PRD.md, golden_set.json, architecture notes
│   └── PRD.md
├── client/                    # Next.js App Router frontend
│   ├── app/                   # App Router pages and layout
│   ├── components/            # UI components (cards, mic, chat, etc.)
│   ├── lib/                   # Frontend helpers, API clients
│   ├── public/                # Static assets, PWA manifest
│   ├── .env.example           # Example client environment variables
│   └── package.json
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Rate limiting, validation, error handling
│   │   ├── models/            # Mongoose schemas
│   │   ├── prompts/           # LLM system prompts and rules
│   │   ├── routes/            # Express routes
│   │   ├── services/          # gemini, rag, ml, voice, documents
│   │   └── templates/         # Document templates (HTML)
│   ├── data/                  # Curated static JSON (helplines.json, forums.json)
│   ├── scripts/               # ingest.js, evaluate.js
│   ├── corpus/                # Raw legal text/PDFs
│   ├── .env.example           # Example server environment variables
│   └── package.json
└── ml-service/                # Python + FastAPI ML microservice
    ├── app.py                 # FastAPI application
    ├── train.py               # Model training script
    ├── data/                  # scenarios.csv
    ├── models/                # Trained joblib model files
    ├── requirements.txt       # Python dependencies
    └── .env.example           # Example ML service environment variables
```

---

## 5. Safety, Invariants & Security Rules

1. **Emergency First Gate:**
   - Any message indicating violence, suicide, active threat to life, child abuse, or domestic emergency triggers **Emergency Mode** immediately.
   - Helplines (112, 181, 1098, 1930, etc.) and emergency safe steps must be presented before any detailed legal analysis.
2. **Strict Citation Grounding:**
   - All legal sections and acts claimed by the assistant must map to a verified chunk in the legal knowledge base (`applicable_laws[].source_chunk_id`). Unverified claims must be dropped.
   - Current Indian criminal laws apply: **Bharatiya Nyaya Sanhita (BNS) 2023**, **Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023**, **Bharatiya Sakshya Adhiniyam (BSA) 2023**. If user mentions IPC/CrPC, map them where context supports it.
3. **No Legal Advice / Outcome Guarantees:**
   - Always display the disclaimer: *"Informational legal guidance, not legal advice. NyayPath is not a lawyer."*
   - Never predict court outcomes or promise specific judgments.
   - Never generate false complaints, encourage illegal acts, or advise on evading law enforcement.
4. **Environment & Secrets:**
   - Never hardcode API keys, database connection strings, JWT secrets, or credentials.
   - Never log full sensitive user messages or personal identifiable information (PII) to server console or persistent files.
5. **Validation:**
   - Every input payload and every LLM output must be validated against `zod` schemas.

---

## 6. How to Run Services (M0 Quick Reference)

- **Client:**
  ```bash
  cd client
  npm run dev
  # Runs on http://localhost:3000
  ```
- **Server:**
  ```bash
  cd server
  npm run dev
  # Runs on http://localhost:5000 (Health: http://localhost:5000/health)
  ```
- **ML Service:**
  ```bash
  cd ml-service
  # In Python virtual environment:
  uvicorn app:app --host 0.0.0.0 --port 8000 --reload
  # Runs on http://localhost:8000 (Health: http://localhost:8000/health)
  ```
