# VedaAI - AI Assessment Creator

An AI-powered assessment creation platform designed to help teachers generate structured, professionally-formatted question papers directly from uploaded reference materials (PDFs, images, textbook pages) or custom instructions.

Built as a full-stack monorepo with robust background job queues, real-time WebSocket status updates, and print-optimized PDF outputs matching real school examinations.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                         │
│             Next.js 16 + TypeScript + CSS Modules       │
│                                                         │
│  Zustand Store ──► API Call ──► WebSocket Listener      │
│       │                              │                  │
│       ▼                              ▼                  │
│  Form State           Real-time Status Updates          │
│  (files, questions,        (processing → completed)     │
│   due date, etc.)                                       │
└──────────────┬──────────────────────┬───────────────────┘
               │ REST API             │ Socket.IO
               ▼                      ▼
┌─────────────────────────────────────────────────────────┐
│                        Backend                          │
│            Node.js + Express + TypeScript               │
│                                                         │
│  POST /api/assignments                                  │
│       │                                                 │
│       ├──► MongoDB (stores assignments & questions)     │
│       │                                                 │
│       └──► BullMQ Queue (adds background generation)    │
│                 │                                       │
│                 ▼                                       │
│            Worker Process (Generates questions)         │
│                 │                                       │
│                 ├──► Gemini API (processes multimodal)  │
│                 ├──► MongoDB (saves generated paper)    │
│                 ├──► Redis (handles job states)         │
│                 └──► Socket.IO (broadcasts progress)    │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Next.js 16 (App Router)** & **React 19**
- **TypeScript** for compile-time safety
- **Tailwind CSS v4** for clean, premium styling
- **Zustand** for lightweight global state management
- **Socket.IO Client** for real-time bi-directional progress tracking
- **Motion (Framer Motion v12+)** for smooth micro-animations and page transitions
- **shadcn/ui** core design primitives (Calendar, Popover, Dialog, Dropdown, Skeleton, Sonner)
- **Groq Whisper API** for high-accuracy voice commands and speech-to-text

### Backend
- **Node.js** & **Express** with **TypeScript**
- **MongoDB (Mongoose)** for primary metadata and generated paper storage
- **Redis & BullMQ** for background task queuing and job-state management
- **Socket.IO** for event-driven real-time client notifications
- **Google Gemini API (1.5 Flash)** for structured AI question paper generation and multimodal parsing

---

## Core Features

- **Dynamic Assignment Creator Form** — File drag-and-drop, date picker, multiple dynamic question-mark distribution rows, and voice instructions.
- **Multimodal AI Question Generation** — Automatically parses uploaded textbook pages/documents, converts them into a structured prompt, and generates sectioned question papers using Gemini.
- **Background Worker Processing** — Offloads heavy AI generation tasks to a BullMQ task worker to prevent server timeout or blockages.
- **WebSocket Real-time Updates** — Real-time generation progress is pushed to the teacher's UI dynamically.
- **Output Page** — Rendered as a formal school exam with student name/roll number inputs, section groups, difficulty badges, and a hidden expandable answer key.
- **One-Click PDF Export** — Custom print-optimized stylesheet tailored for beautiful page flow without raw HTML wrappers.
- **Regeneration Engine** — Ability to easily tweak parameters or completely regenerate papers.

---

## Local Setup Guide

### 1. Prerequisites
- **Node.js** v18+
- **pnpm** v10+
- **MongoDB** instance (Local or Atlas)
- **Redis** instance (Local or Upstash)
- **Google Gemini API Key**

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone <your-repository-url> veda-ai
cd veda-ai
pnpm install
```

### 3. Environment Variables

Create **`backend/.env`**:
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/veda-ai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_google_gemini_api_key
CORS_ORIGIN=http://localhost:2026
```

Create **`frontend/.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
GROQ_API_KEY=your_groq_api_key
```

### 4. Running Development Servers
Execute the following command in the root folder:
```bash
# Starts both services concurrently using pnpm workspaces
pnpm dev:backend    # Express backend (port 5001)
pnpm dev:frontend   # Next.js frontend (port 2026)
```

---

## Production Deployment Guide

Follow this guide to deploy your full-stack monorepo completely for free.

### Step 1: Deploy MongoDB Database (MongoDB Atlas)
1. Sign up for a free tier account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new shared cluster.
3. In **Database Access**, create a user with read/write credentials. Keep these credentials safe.
4. In **Network Access**, add IP Address `0.0.0.0/0` to allow connections from Render or other cloud hosts.
5. Copy your **SRV connection string** (e.g., `mongodb+srv://...`).

### Step 2: Deploy Redis Queue (Upstash Redis)
Because traditional serverless platforms do not host Redis, Upstash provides a serverless Redis cluster ideal for background queues:
1. Create a free account at [Upstash](https://upstash.com).
2. Create a new serverless Redis database.
3. Scroll to the database details and copy the **Redis URL** (`redis://...` or `rediss://...` with port 6379).

### Step 3: Deploy Express Backend (Render)
1. Sign up at [Render](https://render.com) and connect your GitHub repository.
2. Create a new **Web Service**.
3. Configure the following settings:
   - **Environment**: `Node`
   - **Root Directory**: `backend` (or leave empty and adjust build command if building from workspace)
   - **Build Command**: `pnpm install && pnpm build` (Ensure pnpm is supported or use `npm install && npm run build`)
   - **Start Command**: `node dist/index.js`
4. Under **Environment Variables**, add:
   - `PORT` = `10000` (Render defaults to this or configures it automatically)
   - `MONGODB_URI` = `your_mongodb_atlas_connection_string`
   - `REDIS_URL` = `your_upstash_redis_url`
   - `GEMINI_API_KEY` = `your_google_gemini_api_key`
   - `CORS_ORIGIN` = `https://your-frontend-vercel-url.vercel.app`
5. Click **Deploy**. Keep your Render deployment URL (e.g. `https://veda-ai-backend.onrender.com`).

### Step 4: Deploy Next.js Frontend (Vercel)
1. Sign up at [Vercel](https://vercel.com) and link your GitHub repository.
2. Choose to import the repository.
3. Configure the project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-render-url.onrender.com/api`
   - `GROQ_API_KEY` = `your_groq_api_key`
5. Click **Deploy**.

*Note: Once Vercel provides your live frontend URL, remember to update the `CORS_ORIGIN` variable in your Render backend settings to match it.*
