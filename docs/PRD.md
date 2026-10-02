# PRD: NyayPath (working title) — AI Legal Aid Assistant for Ordinary Citizens

**Version:** 1.0 | **Type:** Web app (mobile-first PWA) | **Stack:** Next.js + Express + MongoDB + small Python ML service + Gemini API

> Instruction to the coding agent: Read this whole document before planning. Build **one milestone at a time** (Section 17), stop after each, and wait for review. Do not add libraries that are not justified in Section 6. Never hardcode secrets or model names.

---

## 1. Vision

Many people in India face harassment, unpaid money, cheating, workplace abuse, cybercrime, or other legal trouble and do not know **what law applies, what to do first, where to complain, or what it will cost**. Lawyers are expensive and legal text is hard to read.

NyayPath lets a person describe their problem in their own language (typing, speaking, or uploading photos/documents). The platform explains in simple words:
1. What happened, in legal terms.
2. Which laws and sections apply.
3. The cheapest legal path, step by step.
4. Where to go (police, consumer commission, labour office, free legal aid, etc.).
5. It can draft the paperwork (RTI, complaint letter, legal notice, consumer complaint).

**Principle:** Informational legal guidance, not a lawyer. Always cheapest-lawful-route first, always cited to real law text, always safe in emergencies.

## 2. Target users

| Persona | Needs |
|---|---|
| **Sunita**, rural woman, low literacy, speaks Hindi/Rajasthani | Voice in, voice out. Very simple language. Big buttons, few words. |
| **Rahul**, college student/young worker, uses Hinglish | Fast typed chat, understand rights, draft a notice. |
| **Mohan**, shopkeeper owed money / cheque bounced | Money recovery path and costs. |
| **Community helper** (ASHA worker, NGO volunteer) | Help others quickly; may use shared device in guest mode. |

## 3. Goals and non-goals

**Goals**
- Explain a situation legally in plain language, in the user's language.
- Cite applicable acts and sections, grounded only in a curated law knowledge base (RAG).
- Give a practical, low-cost action plan with realistic time and cost ranges.
- Support voice in/out and media upload (photo, PDF, screenshot, audio).
- Generate editable drafts: RTI, police complaint, legal notice, consumer complaint, general complaint letter.
- Use ML for issue classification and urgency/emergency detection.
- Support "what if" questions (consequences of an action) in educational mode.

**Non-goals (v1)**
- No lawyer marketplace, payments, or e-filing integration.
- No prediction of case outcomes or guaranteed results.
- No representation of the user in any proceeding.
- No heavy infrastructure (no Kubernetes, microservice mesh, fine-tuned LLMs).

## 4. Features and priority

| ID | Feature | Priority |
|---|---|---|
| F1 | Chat assistant (text) with structured legal guidance | P0 |
| F2 | RAG over Indian law corpus with section citations | P0 |
| F3 | Emergency detection and instant helpline card | P0 |
| F4 | ML issue-category classifier + urgency classifier | P0 |
| F5 | Voice input (mic) and audio reply (listen button / auto-play) | P0 |
| F6 | Media upload (images, PDFs, audio) analyzed for context | P0 |
| F7 | Document drafting (RTI, police complaint, legal notice, consumer complaint) with preview, edit, print/PDF | P0 |
| F8 | "What if" scenario mode | P1 |
| F9 | Follow-up questions when facts are missing | P0 |
| F10 | Guest mode + optional account, conversation history | P1 |
| F11 | Language selector (English, Hindi, plus 1-2 more) and simple-language mode | P0 |
| F12 | "Delete my data" and privacy controls | P1 |
| F13 | Admin analytics dashboard (anonymous category counts) | P2 |
| F14 | Case file/timeline with evidence checklist | P2 |

## 5. Core user flows

**Flow A — Typed problem**
1. User opens app, picks language (or auto-detect), types: "My landlord is not returning my deposit of ₹30,000."
2. Backend: ML classifies (`property_tenancy`/`money_recovery`), urgency = normal.
3. If key facts missing (agreement? how long? notice given?), assistant asks at most 3 short follow-up questions.
4. Assistant returns the structured answer: summary, applicable laws, steps, cost, documents, helplines.
5. Buttons: "Listen", "Draft legal notice", "Ask a follow-up".

**Flow B — Voice**
1. User taps big mic button, speaks in Hindi.
2. Audio is sent to backend, transcribed, language detected.
3. Same pipeline as Flow A. Reply is shown AND spoken aloud using a short, plain `spoken_summary`.

**Flow C — Emergency**
1. Message indicates violence, threat to life, child abuse, suicide, active crime.
2. ML urgency + keyword rules trigger **Emergency Mode**: show helplines FIRST (112 and relevant ones), then short safe steps. No long legal explanation before safety.

**Flow D — Media**
1. User attaches photo of a bounced cheque / screenshot of threatening messages / PDF agreement.
2. Gemini multimodal reads it, extracts facts (names, amounts, dates, clauses) shown to user for confirmation ("I understood this from your file: ... Is that correct?").
3. Confirmed facts feed into the legal analysis and any draft.

**Flow E — Draft a document**
1. User taps "Draft RTI" (or says it).
2. Assistant collects missing fields conversationally (name, address, authority, information sought, dates).
3. Template is filled; user sees an editable preview; "Print / Save as PDF".
4. Draft includes a "how to submit and where" note.

**Flow F — What if**
1. User asks "What happens if I don't pay my cheque amount?" or "What if I hit back at someone?"
2. Assistant explains legal consequences neutrally with citations. It never encourages unlawful acts and notes lawful alternatives.

## 6. Tech stack (keep it light)

| Layer | Choice | Reason |
|---|---|---|
| Frontend | **Next.js (App Router) + React + Tailwind CSS** | PWA-capable, mobile-first, familiar |
| Backend API | **Node.js + Express** | Simple REST, easy file upload (multer) |
| Database | **MongoDB (Atlas free tier) + Mongoose** | Flexible documents, fits chat and cases |
| LLM + multimodal + embeddings | **Google Gemini API** via official `@google/genai` SDK | Handles Indian languages, images, PDFs, audio; free tier available |
| Vector search | MVP: embeddings stored in MongoDB, cosine similarity in Node memory (corpus is small). Upgrade path: Atlas Vector Search | Avoids extra infrastructure |
| ML service | **Python + FastAPI + scikit-learn** (TF-IDF + Logistic Regression), saved with joblib | Light, trainable on a laptop |
| Voice STT | Record with browser `MediaRecorder`, transcribe via Gemini audio input. (Optional upgrade: Bhashini) | Works for many Indian languages |
| Voice TTS | Browser `speechSynthesis` for MVP. (Upgrade: server-side TTS or Bhashini for better Hindi voices) | Free, no extra service |
| Doc generation | Server fills templates → HTML preview → client print-to-PDF (Unicode-safe for Hindi) | Avoids heavy PDF libraries |
| Auth | JWT in httpOnly cookie + anonymous guest sessions | Simple and private |
| Validation | `zod` | Validate every request and every LLM JSON output |
| Deploy | Frontend: Vercel. API + ML: Render/Railway/Cloud Run. DB: Atlas | All have free or cheap tiers |

**Do not add:** GraphQL, Redux, Kubernetes, LangChain, vector DB servers, microservice frameworks. Plain functions are preferred over heavy abstractions.

## 7. System architecture

```
 Browser (Next.js PWA)
   |  text / audio blob / images / PDFs
   v
 Express API  ------------------------------+
   |  1. transcribe audio (Gemini)          |
   |  2. extract facts from media (Gemini)  |
   |  3. POST /classify -> ML service       |---> FastAPI + scikit-learn
   |  4. emergency check (rules + ML)       |      (category, urgency, confidence)
   |  5. RAG: embed query, retrieve law chunks (MongoDB)
   |  6. Gemini: generate structured JSON answer (grounded in chunks)
   |  7. validate JSON (zod), attach helplines, save to DB
   v
 MongoDB (users, conversations, messages, documents, legal_chunks, feedback)
```

## 8. AI pipeline specification

### 8.1 Message processing steps
1. **Normalize input:** text, or transcript of audio, plus extracted facts from attachments.
2. **Detect language** (use the transcript/LLM; user-selected language overrides).
3. **ML classify:** call `ml-service /classify` → `{category, category_confidence, urgency, urgency_confidence}`.
4. **Emergency gate:** if urgency is `emergency` OR keyword rules match (violence, "kill", "suicide", child abuse, rape, kidnapping, active threat) → return Emergency Mode response immediately (helplines + safety steps), then optionally continue with legal guidance as a second message.
5. **Missing-facts check:** if `category_confidence` < 0.5 or key facts missing, ask up to 3 follow-up questions (return `follow_up_questions`).
6. **RAG retrieval:** embed the query (in English translation + original), fetch top 8 chunks, filtered/boosted by category metadata.
7. **Generate answer:** Gemini call with system prompt (Section 8.3), retrieved chunks, conversation history, extracted media facts. Output must be JSON matching schema 8.2.
8. **Validate:** zod-parse; if invalid, retry once with a repair prompt; if still invalid, return a safe fallback message.
9. **Citation check:** every `applicable_laws[].source_chunk_id` must exist in the retrieved set; drop any law claim without a valid chunk.
10. **Attach static data:** helplines for the category and state from a curated JSON file (not generated by the LLM).
11. **Store and return.**

### 8.2 Response JSON schema (validated with zod)
```json
{
  "language": "hi",
  "situation_summary": "string, 2-3 sentences, plain language",
  "category": "consumer | money_recovery | cheque_bounce | property_tenancy | workplace_wages | harassment | domestic_violence | cybercrime | criminal | rti_governance | family | other",
  "urgency": "emergency | high | normal",
  "needs_more_info": false,
  "follow_up_questions": ["max 3 short questions"],
  "what_happened_legally": "string",
  "applicable_laws": [
    { "act": "string", "section": "string", "plain_explanation": "string", "source_chunk_id": "string" }
  ],
  "steps": [
    { "order": 1, "title": "string", "detail": "string", "where": "string", "cost_estimate": "string", "time_estimate": "string" }
  ],
  "cheapest_path_summary": "string",
  "documents_to_collect": ["string"],
  "free_legal_aid_note": "string",
  "risks_and_warnings": ["string"],
  "draft_options": ["rti", "police_complaint", "legal_notice", "consumer_complaint", "general_complaint"],
  "spoken_summary": "string, max 120 words, very simple spoken-style language in the user's language",
  "disclaimer_shown": true
}
```

### 8.3 System prompt rules (the agent must implement these in `server/src/prompts/`)
- You are a legal information assistant for Indian citizens, not a lawyer.
- Use ONLY the provided legal context chunks for law and section claims. If the context does not support a claim, say you are not certain and recommend free legal aid.
- Use current Indian criminal laws: **Bharatiya Nyaya Sanhita (BNS) 2023, Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023, Bharatiya Sakshya Adhiniyam (BSA) 2023** (effective 1 July 2024). If the user mentions IPC/CrPC sections, map them to the BNS/BNSS equivalent where the context supports it.
- Always suggest the lowest-cost lawful route first (talk/notice → free legal aid → mediation/Lok Adalat → complaint/forum → court).
- Never predict outcomes or promise results. Never encourage violence, evidence tampering, false complaints, or any unlawful act. For "what if" questions, explain consequences neutrally and mention lawful alternatives.
- Mention the free legal aid options (District Legal Services Authority, Tele-Law, NALSA) when relevant.
- Reply in the user's language, at a simple reading level. `spoken_summary` must avoid section numbers and jargon.
- Ask at most 3 follow-up questions and only when truly needed.
- Output only valid JSON per the schema.

## 9. ML components

| Model | Input | Output | Method |
|---|---|---|---|
| **Issue classifier** | user text (English/Hindi/Hinglish) | category + confidence | TF-IDF (word + char n-grams) + Logistic Regression |
| **Urgency classifier** | user text | `emergency / high / normal` + confidence | TF-IDF + Logistic Regression, combined with keyword rules (rules win for emergencies) |

**Dataset:** `ml-service/data/scenarios.csv` with columns `text, category, urgency, language`. Target 80-100 examples per category (800-1000 total), mix of English, Hindi (Devanagari), and Hinglish. Generate drafts with Gemini, then **manually review** and fix labels. Hold out 20% for testing.

**Required outputs from training script:** accuracy, macro F1, confusion matrix saved as PNG/JSON, and `models/*.joblib`.

**Fallback rule:** if confidence < 0.5, the LLM decides category from context and may ask a follow-up.

**ML service API**
```
POST /classify   {text: string}  ->  {category, category_confidence, urgency, urgency_confidence}
GET  /health
```
The Node API must handle ML service downtime gracefully (fallback to LLM classification, log a warning).

## 10. Legal knowledge base (RAG)

**Sources (official text only):** India Code (indiacode.nic.in) and other government publications.

**Initial corpus (verify current status of each before ingesting):**
- Bharatiya Nyaya Sanhita 2023; Bharatiya Nagarik Suraksha Sanhita 2023; Bharatiya Sakshya Adhiniyam 2023
- Consumer Protection Act 2019
- Right to Information Act 2005
- Negotiable Instruments Act 1881 (especially Section 138, cheque dishonour)
- Indian Contract Act 1872
- Transfer of Property Act 1882 (and note that rent laws are state-specific)
- Protection of Women from Domestic Violence Act 2005
- Sexual Harassment of Women at Workplace (POSH) Act 2013
- Information Technology Act 2000 (cybercrime)
- Payment of Wages Act 1936 / labour codes (verify commencement status of the Code on Wages 2019)
- POCSO Act 2012
- Legal Services Authorities Act 1987 (free legal aid)
- Motor Vehicles Act 1988

**Ingestion pipeline (script: `server/scripts/ingest.js`):**
1. Convert PDFs to text (script may use a PDF text extractor).
2. Split by section (not fixed size). One chunk = one section (split very long sections).
3. Store metadata: `act, section_number, section_title, year, category_tags[], source_url, chunk_id`.
4. Embed with the Gemini embedding model; store the vector in MongoDB.
5. Provide a command `npm run ingest` that is idempotent.

**Retrieval:** embed query, cosine similarity, top 8, optional category-tag boost. Return the chunks with metadata to the prompt.

**Static data files (curated by a human, NOT LLM-generated):**
- `server/data/helplines.json`: 112 (emergency), 1930 (cybercrime), 181 (women), 1098 (child), 15100 (NALSA free legal aid), 14454 (Tele-Law), 1915 (consumer), 14416 (Tele-MANAS mental health). **Verify all numbers before launch.**
- `server/data/forums.json`: where to go per category (police station / e-FIR, cybercrime.gov.in, e-Daakhil consumer commission, RTI portal, labour office, DLSA, Lok Adalat), with typical fee ranges. Mark "verify".

## 11. Voice requirements

- Big, centered mic button; tap to start, tap to stop; show recording timer and waveform/pulse animation.
- Record via `MediaRecorder` (prefer `audio/webm;codecs=opus`, fall back as needed). Max 60 seconds per clip. Requires HTTPS or localhost.
- `POST /api/voice/transcribe` (multipart) → `{text, language}`. Show the transcript to the user for correction before sending (toggle: "send automatically").
- Every assistant message has a **Listen** button that speaks `spoken_summary` using `speechSynthesis` in the reply language. Setting: "Auto-play replies".
- If no voice is available for the language on the device, show a friendly message and keep the text.
- Provide a clean abstraction (`voiceProvider`) so Bhashini or another TTS can replace the MVP implementation later.

## 12. Media upload requirements

- Accept: JPG, PNG, WEBP, PDF, MP3/WAV/WEBM (audio). Max 10 MB per file, max 5 files per message.
- Validate type and size on client and server. Store uploads temporarily; delete after analysis unless the user saves them to a case (v2).
- Send to Gemini multimodal for fact extraction. Return an `extracted_facts` list for the user to **confirm or correct** before it influences the answer.
- Warn users: "Do not upload Aadhaar/PAN numbers unless needed" and offer a blur reminder.

## 13. Document drafting

**Supported types:** `rti`, `police_complaint`, `legal_notice`, `consumer_complaint`, `general_complaint`.

**Process:**
1. Template per type in `server/src/templates/` with named placeholders.
2. LLM extracts fields from the conversation; list of missing required fields is returned; assistant asks for them.
3. Server fills template, returns HTML.
4. Frontend shows an **editable preview** and a Print/Save as PDF button (print stylesheet, A4, Unicode fonts such as Noto Sans/Noto Sans Devanagari).
5. Every draft includes: "This is a draft. Review carefully. Consider free legal aid review before sending." plus submission instructions and typical fees (marked "verify").

**RTI template minimums:** To (PIO, department, address), subject, specific information sought (numbered), period, applicant details, fee payment note, BPL note, date and signature block.

## 14. Data model (MongoDB)

- **users:** `_id, name?, phone?/email?, passwordHash?, isGuest, language, createdAt`
- **conversations:** `_id, userId|guestId, title, category, language, createdAt, updatedAt, retentionDays`
- **messages:** `_id, conversationId, role (user|assistant), text, attachments[{type, name, extractedFacts}], structured (assistant JSON), createdAt`
- **documents:** `_id, userId|guestId, conversationId, type, fields, html, createdAt`
- **legal_chunks:** `_id, chunkId, act, sectionNumber, sectionTitle, year, text, categoryTags[], sourceUrl, embedding[]`
- **feedback:** `_id, messageId, rating (up|down), comment?, createdAt`
- **events (anonymous analytics):** `_id, category, state?, language, createdAt` (no personal data)

## 15. API specification (REST, JSON)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/guest` | Create guest session |
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | Account auth |
| POST | `/api/chat` | multipart: `message`, `language`, `mode` (advice/whatif), `conversationId?`, `files[]` → structured response |
| POST | `/api/voice/transcribe` | multipart `audio` → `{text, language}` |
| GET | `/api/conversations` / `/api/conversations/:id` | History |
| POST | `/api/documents/draft` | `{type, conversationId, fields?}` → `{missingFields[]}` or `{html}` |
| GET | `/api/helplines?state=&category=` | Curated helplines |
| POST | `/api/feedback` | Thumbs up/down |
| DELETE | `/api/me/data` | Delete user data |
| GET | `/api/admin/stats` | Anonymous counts (admin only, P2) |

Rate limit chat and transcription endpoints (`express-rate-limit`). Use `helmet`, CORS allowlist, request size limits.

## 16. UI/UX requirements

- **Mobile-first**, works on low-end Android phones; PWA manifest; fast first load.
- Home screen: language selector, **big mic button**, text box, attach button, 6 quick-start cards ("Money not returned", "Harassment", "Cheating/fraud", "Workplace issue", "Cyber crime", "Draft an RTI").
- Answer rendered as **cards**: Summary → What happened legally → Laws that apply → Step-by-step plan (with cost/time chips) → Documents to collect → Warnings → Help & helplines. Collapsible sections, large readable text.
- Emergency Mode: red banner with tap-to-call buttons at the top.
- "Simple language" toggle and font-size control.
- Always-visible disclaimer footer: "Legal information, not legal advice."
- Accessible: sufficient contrast, ARIA labels, keyboard usable, icon + text on buttons.
- Languages (UI + replies): English, Hindi at minimum. Use an i18n JSON file approach (`next-intl` or a simple custom dictionary).

## 17. Milestones and acceptance criteria

| # | Milestone | Done when |
|---|---|---|
| M0 | Monorepo scaffold: `client/`, `server/`, `ml-service/`, `docs/`, env examples, README | All three apps start locally; health endpoints work |
| M1 | Legal corpus ingestion + RAG retrieval | `npm run ingest` loads chunks; `GET /api/debug/search?q=` returns relevant sections for 10 test queries |
| M2 | Chat API with structured Gemini output + chat UI | Typed scenario returns validated JSON rendered as cards with citations |
| M3 | ML service: dataset, training, `/classify`, integrated emergency gate | Reported test macro F1 shown; emergency test phrases trigger Emergency Mode |
| M4 | Media upload + fact extraction + confirmation step | Photo and PDF produce confirmable `extracted_facts` |
| M5 | Voice in/out | Hindi speech → text → answer → spoken reply works in Chrome on Android and desktop |
| M6 | Document drafting (RTI first, then others) | Editable preview, printable PDF with correct Hindi/English text |
| M7 | Guest/auth, history, feedback, delete-my-data | History persists; deletion removes data |
| M8 | Safety evaluation, polish, deploy | Golden-set results documented; app live on public URLs |

## 18. Safety, legal and privacy requirements

- Disclaimer on first use and in every document draft. Never claim to be a lawyer.
- Emergency Mode takes priority over everything.
- Citation grounding enforced in code (Section 8.1 step 9).
- No outcome predictions, no encouragement of unlawful acts, no guidance for evading law enforcement.
- Refuse and redirect: requests to forge documents, harass, or file knowingly false complaints.
- Privacy: collect minimum data; encrypt in transit; guest mode default; user can delete data; do not log full message text in server logs; keep API keys server-side only.
- Note for the builder: free-tier LLM APIs may use submitted content to improve products. For real users with sensitive legal data, use a paid/privacy-appropriate tier and update the privacy policy. Align with India's Digital Personal Data Protection Act 2023.
- Have a **law student or lawyer review** the golden-set answers and the templates before any public launch.

## 19. Quality evaluation (must be built)

Create `docs/golden_set.json` with **50 scenarios** (English, Hindi, Hinglish) covering every category, each with: expected category, expected laws (acts/sections), whether emergency, must-include helplines. Write `server/scripts/evaluate.js` that runs all 50 and reports:
- Category accuracy
- Citation validity (every cited chunk exists) = 100% required
- Emergency recall = 100% required
- Average latency (target under 10 seconds)
- Manual review sheet output (CSV) for the lawyer

## 20. Non-functional requirements

- p95 chat response under 12 seconds on free-tier infrastructure (show streaming/typing indicator).
- Graceful degradation: if Gemini fails → friendly retry message; if ML service fails → LLM fallback.
- Input validation (zod) on all endpoints; sanitize file names; reject unexpected MIME types.
- Logging with request IDs; no sensitive content in logs.
- Basic tests: unit tests for retrieval, schema validation, emergency rules; one end-to-end test for chat.

## 21. Environment variables

```
# server/.env
PORT=5000
MONGODB_URI=
GEMINI_API_KEY=
GEMINI_MODEL=            # chat/generation model, check current Google docs
GEMINI_EMBEDDING_MODEL=  # embedding model, check current Google docs
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=
CLIENT_ORIGIN=http://localhost:3000

# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 22. Repository structure

```
nyaypath/
  AGENTS.md
  docs/                PRD.md, golden_set.json, architecture notes
  client/              Next.js app (app/, components/, lib/, public/, i18n/)
  server/
    src/ (routes/, controllers/, services/{gemini,rag,ml,voice,documents}/, prompts/, templates/, models/, middleware/)
    data/ (helplines.json, forums.json)
    scripts/ (ingest.js, evaluate.js)
    corpus/ (raw law PDFs/text)
  ml-service/
    app.py, train.py, data/scenarios.csv, models/
```

## 23. Risks and mitigations

| Risk | Mitigation |
|---|---|
| LLM hallucinates sections | RAG-only grounding, citation validation, "not sure" fallback, lawyer-reviewed golden set |
| Outdated or wrong law text | Versioned corpus with `source_url` and year; update procedure; show "last updated" |
| Poor Hindi/regional voice quality | Transcript confirmation step; start with Hindi + English; Bhashini upgrade path |
| Emergency mishandled | Rules + ML, 100% recall target on test set, helplines from static file |
| Privacy of sensitive data | Guest mode, minimal storage, delete-my-data, paid LLM tier before real users |
| Misuse (false complaints, harassment) | Refusal rules, warnings about false complaints having legal consequences |
| Free-tier rate limits and cold starts | Caching, retries, loading states, keep-alive during demos |
