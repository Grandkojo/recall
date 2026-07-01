# Recall Backend

The backend engine for **Recall**, powering the life memory graph using FastAPI, PostgreSQL, Celery, and Cognee.

## Tech Stack
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL (with `pgvector` for Cognee vector storage)
- **Background Tasks**: Celery + Redis
- **Memory Graph**: Cognee (Self-hosted inside FastAPI)
- **Media Processing**: Cloudinary (Storage) & OpenAI Whisper (Transcription)
- **Authentication**: Firebase Admin (JWT Verification)

## Setting Up Locally
1. Rename `.env` and fill in your Cloudinary, OpenAI, and Firebase JSON credentials.
2. Ensure Docker is installed.
3. Run the following command from the `backend/` directory:
   ```bash
   docker compose up --build
   ```
4. The API will be available at `http://localhost:8001` (mapped to avoid port 8000 conflicts).

---

## API Endpoints Overview

For full request/response schemas, import the `recall_postman_collection.json` file found in the root directory into Postman, or visit the auto-generated Swagger UI at `http://localhost:8001/docs`.

### Authentication
*   **`POST /api/auth/sync`**: Synchronizes a newly logged-in Firebase user with our local PostgreSQL database.

### Memories (Cognee Integration)
*   **`POST /api/memories/`**: Upload a memory. Accepts `FormData` containing `patient_id`, `media_type`, `caption`, and an optional `file`. Triggers an asynchronous Celery task to upload to Cloudinary, transcribe via Whisper, and ingest into the Cognee graph (`cognee.remember`).
*   **`GET /api/memories/query`**: Queries the patient's memory graph. Pass `q` (semantic search string) and `patient_id`. Uses `cognee.recall`.
*   **`POST /api/memories/enrich`**: Triggers a background graph enrichment job (`cognee.improve`).
*   **`DELETE /api/memories/{media_id}`**: Deletes a specific memory from the database.

---

## Frontend Integration & Design Guide

This section is dedicated to the Frontend team building the React/Vite interfaces.

### 1. Authentication Flow
Because we are using Firebase, the backend **does not** handle passwords or direct login.
1. The frontend uses the Firebase JS SDK to handle user Sign Up / Log In.
2. Once the user is authenticated, retrieve their Firebase JWT (ID Token).
3. Send a request to `POST /api/auth/sync` with the JWT in the `Authorization: Bearer <token>` header, along with a body containing `{"role": "CAREGIVER", "full_name": "Name"}`.
4. The backend will verify the token and register the user in the local PostgreSQL database, assigning them the correct permissions.

### 2. Calling the APIs
*   **Headers**: Every request to the backend (except the health check) must include the `Authorization: Bearer <your_firebase_token>` header.
*   **File Uploads**: When hitting `POST /api/memories/`, you cannot use JSON. You must use `FormData` so the audio/image file can be transmitted properly.
*   **Asynchronous UX**: When a user uploads a video or voice note, the backend will return a `200 OK` almost immediately. However, the transcription and graph processing happen in the background via Celery. Ensure your UI reflects this (e.g., show a "Processing Memory..." state on the timeline instead of waiting for the HTTP request to hang).

### 3. Design Aesthetics (Vanilla CSS)
*   **Caregiver Dashboard**: Should feel clean, professional, and data-rich. Use subtle glassmorphism for panels and cards.
*   **Patient Interface**: Must be radically simplified. 
    *   Use high-contrast modes and vibrant, warm colors.
    *   Typography must be large (minimum 18pt) and modern (e.g., Inter, Outfit, or Roboto).
    *   Avoid complex navigation menus. Use large buttons and smooth, calming micro-animations to draw attention to the "Add Memory" or "Reminisce" actions.
    *   Never use raw generic colors (like `red` or `blue`). Use curated HSL color palettes that feel premium.
