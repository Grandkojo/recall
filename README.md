# Life Memory Graph for Dementia Care

> A persistent, AI-powered life memory system for people living with dementia and the families caring for them — built on [Cognee](https://github.com/topoteretes/cognee)'s hybrid graph-vector memory layer.

**WeMakeDevs x Cognee Hackathon — June 29 – July 5, 2026**
**Track: Best Use of Open Source**

---

## The Problem

People living with early-stage dementia don't lose their life story — they lose access to it. Personal context (names of children, a spouse's face, the house they grew up in, daily routines, comforting rituals) exists scattered across family photos, old letters, shared stories, and caregiver memory. It's fragmented, unstructured, and inaccessible at the moment it's needed most.

Caregivers spend hours every time a new carer visits trying to explain a person's life. Patients feel disoriented, unrecognized, and alone. The information exists — it just has no home.

## The Solution

Life Memory Graph gives that information a home. Caregivers upload a person's life story — photos, voice notes, written stories, routines — and Cognee structures it into a persistent, queryable knowledge graph. When a patient asks "who is that in the photo?" or a caregiver needs to know "what calms her when she's distressed?", the system surfaces precise, grounded answers drawn from real uploaded memories.

No hallucination. No generic responses. Every answer traces back to something a family member actually wrote, said, or uploaded.

---

## Product Overview

Two distinct interfaces serve two distinct users:

**Caregiver Dashboard** — upload-rich, management-oriented, query-capable
- Ingest photos, stories, voice notes, structured person and routine entries
- Browse and manage the full memory graph
- Natural language queries for care guidance
- One-click care brief generation for new carers

**Patient Interface** — visually calm, large text, cognitively accessible
- Familiar faces gallery: large photos with names and relationship labels
- "Who is this?" — tap a face, get a warm description of who that person is
- "What's today?" — orientation card with date, greeting, and today's context
- "Tell me a story" — a gentle, narrated memory from their life
- Simple conversational chat

---

## Mental Model

```
Caregiver uploads photos/stories/routines
           ↓
  Cognee remember() structures them
  into the life memory graph
           ↓
Patient or caregiver asks a question
           ↓
  Cognee recall() retrieves relevant
  people, places, events, and cues
           ↓
Claude generates a grounded, warm response
traceable to real uploaded content
```

---

## How Cognee Powers This

All four of Cognee's core APIs map directly to product features:

| API | What it does in this product |
|---|---|
| `remember()` | Ingests text stories, photo captions, voice transcripts, person forms, routine forms into the knowledge graph |
| `recall()` | Powers every query: "Who is this?", "Tell me a story", care brief sections, caregiver chat, patient orientation |
| `improve()` | Called when a caregiver corrects a wrong answer — updates the graph with accurate information |
| `forget()` | Removes nodes on deletion; protects patients from distressing memories by surgically pruning them from recall results |

The `forget()` use case is intentional and ethically grounded: caregivers can mark specific memories — a loss, a distressing event, a family rift — so they never surface in patient-facing responses. This maps to the real clinical practice of controlled reminiscence therapy.

---

## Memory Graph Data Model

Cognee stores the following node types in its hybrid graph-vector store:

### Nodes

| Type | Key Fields |
|---|---|
| **Patient Profile** | full name, preferred name, date of birth, primary home, orientation facts |
| **Person** | name, nicknames, relationship to patient, emotional valence, current status, known details |
| **Place** | name, type (childhood home / holiday / workplace), period, emotional significance |
| **Event** | title, approximate date, type (family / milestone / loss / celebration), participants, description |
| **Routine** | name, type (daily / weekly / care protocol), ordered steps, associated persons, notes |
| **Care Context** | category (comfort / distress trigger / medical / preference), description, priority |
| **Media** | type (photo / audio / document), storage path, caption, extracted text |

### Relationships (Graph Edges)

```
PERSON      --[KNOWS]---------> PERSON
PERSON      --[APPEARS_IN]----> EVENT
PERSON      --[LIVED_AT]------> PLACE
EVENT       --[OCCURRED_AT]---> PLACE
ROUTINE     --[PERFORMED_BY]--> PERSON
MEDIA       --[DEPICTS]-------> PERSON / EVENT / PLACE
CARE_CONTEXT --[APPLIES_TO]--> PATIENT_PROFILE
```

### Why Hybrid Graph + Vector

Graph traversal handles relational precision ("who are Margaret's siblings and where do they live?"). Vector embeddings handle semantic fuzzy matching ("what makes Margaret feel safe and calm?"). Neither alone is sufficient. Cognee provides both natively — this is the technical foundation of the project.

---

## Architecture

```
[Caregiver Browser]     [Patient Browser]
        │                       │
        └───────── REST ─────────┘
                     │
         [FastAPI Backend — Python 3.11]
          │                │              │
    [Cognee SDK]    [Anthropic Claude]  [Local File
     (Memory)        (Generation)        Storage]
          │
   [Cognee Internal Stack]
    ├── Graph DB (NetworkX — default, zero config)
    └── Vector Store (LanceDB — default, embedded)
```

### Generation Pattern

Claude is used exclusively as a generation layer. It does not store memory — Cognee does.

1. User submits a query
2. Backend calls `cognee.recall(query)` to retrieve relevant graph nodes
3. Retrieved context is injected into a structured Claude prompt
4. Claude generates a natural language response grounded in the retrieved context
5. Response is returned with source attribution (which memories were used)

This grounding pattern prevents hallucination and ensures every response is traceable to real uploaded content.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Memory | Cognee (self-hosted, open-source) |
| Backend | FastAPI 0.111 + Python 3.11 |
| LLM | Claude via Anthropic SDK |
| Transcription | Whisper (local, `whisper-tiny`) |
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v3 |
| Server state | TanStack Query (React Query) |
| Graph DB | NetworkX (Cognee default) |
| Vector Store | LanceDB (Cognee default, embedded) |

---

## Project Structure

```
cognee-dementia/
  backend/
    app/
      main.py
      config.py
      routers/
        ingest.py       # /ingest/text, /photo, /audio, /person, /routine
        query.py        # /query/caregiver, /query/patient
        memory.py       # GET /memory/nodes
        manage.py       # PUT/DELETE /manage/node/{id}
        patient.py      # GET /patient/faces, /today, /story
      services/
        cognee_service.py   # remember(), recall(), improve(), forget() wrappers
        llm_service.py      # Claude API with Cognee context injection
        media_service.py    # file handling, Whisper transcription
        brief_service.py    # care brief generation
      models/
        schemas.py          # Pydantic request/response models
    uploads/                # local media storage
    requirements.txt
    .env.example
  frontend/
    src/
      caregiver/
        pages/          # Dashboard, Upload, GraphBrowser, NodeDetail, Query, CareBrief
        components/     # UploadZone, PersonForm, RoutineForm, NodeCard, QueryChat
      patient/
        pages/          # Home, Faces, FaceDetail, Story, Chat
        components/     # OrientationCard, FaceCard, StoryCard, GentleChat
      shared/
        api/            # Axios client, endpoint modules
        components/     # LoadingSpinner, ErrorBoundary
        hooks/          # useQuery, useIngest
    package.json
    vite.config.ts
  README.md
```

---

## Key User Flows

### Flow 1 — Caregiver Builds the Memory Graph

1. Create patient profile → `remember(profile summary)`
2. Add family members via Person form → `remember(descriptive prose)`
3. Upload photos with captions → `remember(caption + prior context)`
4. Paste a life story → `remember(full narrative)` (background task)
5. Upload voice note → Whisper transcription → `remember(transcript)` with review step
6. Browse graph browser → spot an error → Edit → `improve(correction)`
7. Add Care Context: "Do not surface memories about her miscarriage — causes severe distress" → `forget()` removes it from patient-facing recall

### Flow 2 — Patient Uses the Interface

1. Margaret opens the app → orientation card: *"Good morning, Margaret. It is Sunday, June 29."*
2. Taps **Familiar Faces** → large photo grid with names in large text
3. Taps Joan's photo → *"This is Joan, your younger sister. You called her Joanie. You went to Blackpool together the summer you finished school."*
4. Taps **Tell Me a Story** → Cognee retrieves a positive memory → Claude narrates it warmly in large, calm text

### Flow 3 — New Carer Gets Up to Speed

1. James opens the caregiver interface → taps **Care Brief**
2. Backend fires multiple `recall()` calls: routine, comfort factors, distress triggers, key people
3. Claude synthesizes into a structured 1-page brief
4. James reads: *"Margaret prefers to choose her own clothes. She calms down with Dusty Springfield. Do not mention her son's divorce — she is unaware."*
5. James queries: *"She seems upset this morning — what helps?"* → grounded, specific answer from the memory graph

---

## Feature List

### MVP — Shipping by Demo Day

**Ingestion**
- Text story upload
- Photo upload with caption
- Voice note → local Whisper transcription → review → ingest
- Structured Person entry form
- Structured Routine entry form

**Memory Management**
- Graph browser: view all nodes by type
- Edit a node → `improve()`
- Delete a node → `forget()`

**Caregiver Interface**
- Natural language query chat (Cognee `recall()` + Claude generation)
- Person lookup with full relationship context
- Care brief generation (one-click, multi-section)

**Patient Interface**
- Familiar faces gallery (large photos + names)
- "Who is this?" face detail with warm narrative
- "What's today?" orientation card
- "Tell me a story" memory narration
- Simple patient chat (gentle tone, filtered responses)

### Stretch Goals

- Relationship graph visualization (D3 / React Force Graph)
- Life events timeline view
- Explicit correction → `improve()` feedback loop
- PDF care brief export
- Daily orientation schedule
- Multi-profile support

---

## Build Plan

| Day | Focus | Checkpoint |
|---|---|---|
| **Day 1** — Jun 29 | Project setup, Cognee integration, first `remember()` + `recall()` end-to-end | Text ingestion working through full stack |
| **Day 2** — Jun 30 | All 5 ingestion paths (photo, audio, person, routine, text) | All ingestion types working with real data |
| **Day 3** — Jul 1 | Caregiver query + memory management (`improve()`, `forget()`) | Full Cognee API loop demonstrated |
| **Day 4** — Jul 2 | Patient interface: faces, orientation, story, accessibility styling | Patient UI functional and visually distinct |
| **Day 5** — Jul 3 | Patient chat, caregiver chat polish, care brief generation | Both conversational interfaces working |
| **Day 6** — Jul 4 | Full demo dataset, polish, stretch goals | App fully demo-ready |
| **Day 7** — Jul 5 | Demo video, README, submission | Submitted |

---

## Setup (Coming Day 1)

> Setup instructions and `.env.example` will be added as the project is built out.

**Prerequisites:** Python 3.11+, Node.js 18+, ffmpeg (for Whisper audio processing)

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Environment Variables

```env
ANTHROPIC_API_KEY=your_key_here
COGNEE_LLM_API_KEY=your_key_here   # can reuse Anthropic key if using Claude for Cognee's LLM
UPLOAD_DIR=./uploads
PATIENT_DATASET_NAME=patient_default
```

---

## The Judging Criteria — How We Address Each

| Criterion | Our Answer |
|---|---|
| **Impact** | Dementia affects 50M+ families globally. The care brief alone saves hours of handoff time per carer. `forget()` as patient memory protection directly maps to clinical reminiscence therapy. |
| **Creativity** | Novel reframing: AI memory as a dignity and care tool, not a productivity tool. Ethical `forget()` inverts the usual "remember more" narrative. Dual-interface design is a genuine product insight. |
| **Technical Excellence** | Hybrid graph+vector retrieval + grounded LLM generation layer. Async FastAPI with background ingestion. Source attribution on all responses. Local Whisper. Two UX-differentiated interface trees. |
| **Best Use of Cognee** | All 4 APIs used. 5 ingestion types via `remember()`. 6+ distinct `recall()` patterns. `improve()` demonstrated live via correction flow. `forget()` demonstrated with clear ethical motivation. Fully self-hosted. |
| **UX** | Patient interface purpose-built for cognitive accessibility: 20px+ font, 60px+ tap targets, max 3 items per screen, soft palette, no complex navigation. Grandparent test applied. |
| **Presentation** | Opens with Margaret's story, not tech specs. Each Cognee API narrated by name as it's used. Emotional peak: Margaret asks about a photo — the system answers with her real memories. |

---

## The Core Demo Moment

If one thing has to work perfectly, it's this:

> A caregiver uploads a photo with the caption *"Margaret and her sister Joan at Blackpool, 1968"* and a short story about Joan.
>
> Margaret opens the patient interface, taps Joan's photo, and the system responds:
>
> *"This is Joan, your younger sister. You called her Joanie. You went to Blackpool together the summer you both finished school."*

That moment — grounded in a real photo, a real caption, a real uploaded story, retrieved from a knowledge graph, rendered by an LLM — is what this project is about.

---

## Team

Built for the WeMakeDevs x Cognee Hackathon, June 29 – July 5, 2026.
