# Synergy – Integrated Mobile and Web-Based Event Management System

## Project Overview
Synergy is a streamlined event registration platform designed for QR-code based participant input. It supports different registration categories including Presenters, Speakers, Participants, and Faculty.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** Supabase

## Project Structure
- `frontend/`: React application containing UI components, routing, and form handling.
- `backend/`: Express server managing API endpoints and Supabase integration.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

#### 1. Backend Setup
```bash
cd backend
npm install
# Copy .env.example to .env and fill in your Supabase credentials
cp .env.example .env
npm run dev
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
# Copy .env.example to .env and set VITE_API_URL
cp .env.example .env
npm run dev
```

## Development Workflow
1. **Define Schema:** Update Zod schemas in `frontend/src/validations` and `backend/src/validations`.
2. **Build Components:** Create UI elements in `frontend/src/components/ui`.
3. **API Implementation:** Define routes in `backend/src/routes` and controllers in `backend/src/controllers`.
4. **End-to-End Testing:** Scan generated QR codes to verify redirection and form submission.

## Deployment
- **Backend:** Recommended platforms include Render, Railway, or Heroku.
- **Frontend:** Recommended platforms include Vercel, Netlify, or AWS Amplify.
- **Database:** Supabase (Cloud managed).
