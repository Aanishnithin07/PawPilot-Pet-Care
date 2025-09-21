# Copilot Instructions for PawPilot-Pet-Care

## Project Overview
- **Monorepo structure**: Contains `backend/` (Python FastAPI) and `frontend/` (React + Vite) directories.
- **Backend**: Handles authentication, CRUD, database (SQLite), and service logic. Organized by domain (e.g., `routers/`, `services/`).
- **Frontend**: React app using Vite, with modular components and context for language/i18n support.

## Key Patterns & Conventions
- **Backend routers**: All API endpoints are grouped in `backend/routers/` by feature (e.g., `pets.py`, `diagnosis.py`).
- **Service layer**: Business logic and integrations (e.g., image analysis) live in `backend/services/`.
- **Database**: Uses SQLite (`pawpilot.db`) via SQLAlchemy models in `backend/models.py`.
- **Frontend components**: UI split into feature folders under `frontend/src/components/` and `frontend/src/pages/`.
- **i18n**: Language files in `frontend/src/i18n/` and context in `frontend/src/context/LanguageContext.jsx`.

## Developer Workflows
- **Backend**: Run FastAPI app from `backend/main.py`. Install dependencies from `backend/requirements.txt`.
- **Frontend**: Use Vite commands (`npm run dev`, `npm run build`) in `frontend/`.
- **No monorepo tooling**: Backend and frontend are managed independently.

## Integration Points
- **API communication**: Frontend uses Axios (`frontend/src/api/axiosConfig.js`) to call backend endpoints.
- **Authentication**: Managed via `backend/routers/authentication.py` and `backend/auth.py`.
- **Image analysis**: Service logic in `backend/services/image_analysis_service.py`.

## Examples
- To add a new API route: create a file in `backend/routers/`, register the router in `backend/main.py`.
- To add a new frontend page: add a component to `frontend/src/pages/` and update routing in the main app.

## Project-Specific Notes
- **No TypeScript**: Frontend is JavaScript-only.
- **No test suite detected**: Add tests in `backend/tests/` or `frontend/src/__tests__/` if needed.
- **ESLint**: Configured for frontend only (`frontend/eslint.config.js`).

---
For more details, see `frontend/README.md` and backend source files. Update this file as project structure evolves.
