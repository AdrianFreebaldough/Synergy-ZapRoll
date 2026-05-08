# Event Management QR Registration System - Project Blueprint

This repository now contains a **full-stack starter structure** with a React frontend and Node.js + Express backend designed for scalable event registration using category-based QR redirects.

## Final Folder Structure (Tree)

```text
Synergy-ZapRoll/
├── backend/
│   ├── .env.example
│   ├── eslint.config.js
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── qrController.js
│   │   │   └── registrationController.js
│   │   ├── database/
│   │   │   ├── index.js
│   │   │   ├── migrations/
│   │   │   └── seeders/
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   ├── notFound.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── validateRequest.js
│   │   ├── models/
│   │   │   ├── Participant.js
│   │   │   ├── QrCode.js
│   │   │   ├── Registration.js
│   │   │   └── User.js
│   │   ├── qr/
│   │   │   ├── qrGenerator.js
│   │   │   └── qrRedirectResolver.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── index.js
│   │   │   ├── qrRoutes.js
│   │   │   └── registrationRoutes.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── dashboardService.js
│   │   │   ├── qrService.js
│   │   │   └── registrationService.js
│   │   ├── utils/
│   │   │   ├── apiResponse.js
│   │   │   ├── constants.js
│   │   │   ├── generateSlug.js
│   │   │   └── logger.js
│   │   └── validators/
│   │       ├── authValidators.js
│   │       └── registrationValidators.js
│   └── tests/
│       └── qrRedirectResolver.test.js
├── frontend/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api/
│   │   │   ├── apiClient.js
│   │   │   ├── authApi.js
│   │   │   └── registrationApi.js
│   │   ├── assets/
│   │   │   ├── icons/
│   │   │   └── images/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── RoleRoute.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── AdminOverviewCard.jsx
│   │   │   ├── layout/
│   │   │   │   └── DashboardLayout.jsx
│   │   │   └── registration/
│   │   │       └── RegistrationForm.jsx
│   │   ├── config/
│   │   │   └── env.js
│   │   ├── context/
│   │   │   ├── authContext.js
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboardPage.jsx
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── landing/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   └── UnauthorizedPage.jsx
│   │   │   ├── participant/
│   │   │   │   └── ParticipantDashboardPage.jsx
│   │   │   ├── registration/
│   │   │   │   └── CategoryRegistrationPage.jsx
│   │   │   └── staff/
│   │   │       └── StaffDashboardPage.jsx
│   │   ├── qr/
│   │   │   └── scanHandler.js
│   │   ├── routes/
│   │   │   └── AppRouter.jsx
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── qrService.js
│   │   │   └── registrationService.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   └── utils/
│   │       └── roles.js
├── docs/
│   └── project-structure.md
├── .gitignore
└── README.md
```

## Folder and File Purpose (Short Descriptions)

- `frontend/src/components`: reusable UI blocks.
- `frontend/src/pages`: route-level screens.
- `frontend/src/routes`: centralized route configuration and guards.
- `frontend/src/api`: HTTP client wrappers.
- `frontend/src/services`: business logic consumed by pages/components.
- `frontend/src/context`, `frontend/src/hooks`: shared auth/session state.
- `frontend/src/qr`: QR scan-to-redirect helper flow.
- `frontend/src/assets`, `frontend/src/styles`: static resources and styling.
- `backend/src/routes`: REST endpoint grouping by domain.
- `backend/src/controllers`: request/response handlers.
- `backend/src/services`: domain logic and orchestration.
- `backend/src/middleware`: auth, validation, and error pipelines.
- `backend/src/config`: env/bootstrap/db connectors.
- `backend/src/database`: migration/seeding entry points.
- `backend/src/models`: persistence-layer models/entities.
- `backend/src/qr`: QR generation and category routing logic.
- `backend/src/utils`: cross-cutting helper utilities.
- `backend/src/validators`: schema definitions and request rules.

### Key Starter File Purposes

- `frontend/src/routes/AppRouter.jsx`: central route map (public, registration, and role-protected dashboards).
- `frontend/src/components/common/ProtectedRoute.jsx`: redirects unauthenticated users to login.
- `frontend/src/components/common/RoleRoute.jsx`: blocks authenticated users without required role.
- `frontend/src/pages/registration/CategoryRegistrationPage.jsx`: dynamic registration entry based on scanned category.
- `frontend/src/qr/scanHandler.js`: QR scan redirect resolver on the client.
- `backend/src/routes/index.js`: aggregates versioned REST API modules.
- `backend/src/controllers/*Controller.js`: request handling per domain.
- `backend/src/services/*Service.js`: business/domain logic layer.
- `backend/src/qr/qrGenerator.js`: builds QR images and redirect payloads.
- `backend/src/qr/qrRedirectResolver.js`: maps category to safe registration route with fallback.
- `backend/src/database/index.js`: migration and seeding entry metadata.
- `backend/tests/qrRedirectResolver.test.js`: starter test validating QR redirect mapping behavior.

## Recommended npm Packages

### Frontend
- Core: `react`, `react-dom`, `react-router-dom`
- API/state/forms: `axios`, `zustand`, `react-hook-form`
- Optional for scaling: `@tanstack/react-query`, `zod`, `dayjs`

### Backend
- Core: `express`, `cors`, `helmet`, `dotenv`
- Auth/security: `jsonwebtoken`, `bcryptjs`, `express-rate-limit`
- Data/validation/QR: `mongoose`, `zod`, `qrcode`
- Dev/testing: `nodemon`, `eslint`, `supertest`

## Environment Variables

### Frontend (`frontend/.env.example`)
- `VITE_APP_NAME`: display name.
- `VITE_API_BASE_URL`: backend API base path.
- `VITE_AUTH_STORAGE_KEY`: local token key.
- `VITE_QR_SCAN_PATH`: default scan entry route.

### Backend (`backend/.env.example`)
- `NODE_ENV`: runtime mode.
- `PORT`: API server port.
- `CLIENT_URL`: allowed frontend origin.
- `MONGO_URI`: DB connection string.
- `JWT_SECRET`, `JWT_EXPIRES_IN`: auth token signing config.

## Suggested Workflow Architecture

1. **QR generation**
   - Admin creates category QR via `/api/v1/qr/:category`.
   - Backend `qrGenerator` produces image data URL with category route.
2. **QR scanning flow**
   - User scans QR from printed badge/signage.
   - Browser opens frontend route `/register/:category`.
3. **Redirect logic**
   - Backend and frontend both use category maps with safe fallback (`regular-participant`).
4. **Participant registration flow**
   - Category page renders proper form variant.
   - Form submits to `/api/v1/registrations`.
5. **Database storage**
   - Registration service persists user + registration + QR references in model layer.

## Auth and Role-Based Access

- Login endpoint: `/api/v1/auth/login`
- Profile endpoint: `/api/v1/auth/me`
- Protected frontend routes:
  - `/admin` for `admin`
  - `/staff` for `staff`
  - `/participant` for `participant`
- Guards:
  - `ProtectedRoute`: checks login
  - `RoleRoute`: enforces role authorization

## API Endpoint Structure Examples

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/registrations`
- `GET /api/v1/qr/:category`
- `GET /api/v1/dashboards/admin`
- `GET /api/v1/dashboards/staff`
- `GET /api/v1/dashboards/participant`

## Recommended Naming Conventions

- **Folders**: lowercase (`services`, `middleware`, `routes`).
- **React components/pages**: PascalCase (`AdminDashboardPage.jsx`).
- **Utility/service/controller files**: camelCase with suffix (`qrService.js`, `authController.js`).
- **Route paths**: kebab-case (`regular-participant`, `employee-faculty`).
- **Env vars/constants**: UPPER_SNAKE_CASE.

This layout is beginner-friendly (clear module boundaries) and scalable (layered responsibilities + role segregation + environment-driven config).
