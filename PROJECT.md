# Project: TeamSync Frontend Audit Remediation

## Architecture
The application is a React 19 SPA bundled with Vite and Tailwind CSS v4 in `Frontend/` interacting with a Node.js/Express/MongoDB backend in `Backend/`.
State is managed via Redux Toolkit (`Frontend/src/app/store.js`) with feature slices:
- `auth`: `src/features/auth/store/authSlice.js`
- `tasks`: `src/features/tasks/store/taskSlice.js`
- `projects`: `src/features/projects/store/projectSlice.js`
- `admin`: `src/features/admin/store/adminSlice.js`

Network communication flows through Axios (`Frontend/src/shared/api/axios.js`) configured with interceptors for silent token refresh, request queueing, and session expiration handling.
Routing and RBAC guards are defined in `Frontend/src/app/router/` (`AppRouter.jsx` and `ProtectedRoute.jsx`).

## Feature Inventory
Every prioritized finding identified in the survey and audit action plan (`doc/frontend-audit/10-priority-action-plan.md`):

| # | Feature / Bug ID | Description | Milestone | Source |
|---|------------------|-------------|-----------|--------|
| 1 | BUG-FE-01 (P0) | Clear task/project memory caches & Redux slices on logout; purge `agentrateam` from `localStorage` | M1 | Survey / Audit P0 |
| 2 | BUG-FE-02 (P1) | Terminate session immediately on 401 when refresh token is absent or refresh payload lacks access token | M2 | Survey / Audit P1 |
| 3 | BUG-FE-03 (P1) | Synchronize refreshed access token with Redux `state.auth.token` via `setCredentials` action in `authSlice` | M2 | Survey / Audit P1 |
| 4 | BUG-FE-04 (P1) | Implement server-side logout in `authService` calling `POST /api/auth/logout` and invoke it from `useAuth.logout()` | M2 | Survey / Audit P1 |
| 5 | BUG-FE-05 (P1) | Fix `ProtectedRoute.jsx` RBAC: normalize `allowedRoles`, allow authorized non-admin roles, and prevent fail-open bypass | M3 | Survey / Audit P1 |
| 6 | VERIF-01 | Clean build and lint execution: `npm run build` and `npm run lint` with 0 errors and zero regressions | M4 | Requirements R2 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Cache & State Reset Lifecycle (P0) | `useTasks.js`, `useProjects.js`, `taskSlice.js`, `projectSlice.js`, `adminSlice.js` | none | DONE |
| M2 | Auth Session Lifecycle & Token Sync (P1) | `authSlice.js`, `auth.service.js`, `useAuth.js`, `axios.js` | M1 | DONE |
| M3 | Route Authorization & Multi-Role RBAC (P1) | `ProtectedRoute.jsx` | M2 | DONE |
| M4 | Comprehensive Build & Code Quality Gate | Full frontend build, lint check, static integrity verification | M1, M2, M3 | DONE |

## Interface Contracts

### Tasks & Projects Cache ↔ Auth / Axios Lifecycle
- `clearTasksCache(): void` exported from `Frontend/src/features/tasks/hooks/useTasks.js`
  - Resets `inFlightTasksPromise = null` and `lastTasksFetchTimestamp = 0`.
- `clearProjectsCache(): void` exported from `Frontend/src/features/projects/hooks/useProjects.js`
  - Resets `inFlightProjectsPromise = null` and `lastProjectsFetchTimestamp = 0`.

### Redux Auth Logout Action ↔ Feature Slices
- `logout()` action dispatched from `Frontend/src/features/auth/store/authSlice.js`
- `taskSlice.extraReducers`: listens for `logout` and resets state to `{ tasks: [], filter: "ALL", search: "", loading: false, error: null }`.
- `projectSlice.extraReducers`: listens for `logout`, executes `storage.remove("agentrateam")`, and resets state to `{ projects: [], filter: "ALL", search: "", loading: false, error: null }`.
- `adminSlice.extraReducers`: listens for `logout` and resets state to initial users/stats/activityLogs.

### Auth Service ↔ Backend Logout Endpoint
- `authService.logout(): Promise<any>` in `Frontend/src/features/auth/services/auth.service.js`
  - Calls `apiClient.post("/auth/logout", {}, { withCredentials: true })`
  - Handled with best-effort try/catch so local logout proceeds even if server is offline.

### Silent Token Refresh ↔ Redux Auth State
- `setCredentials(payload: { accessToken, refreshToken?, user? })` exported from `authSlice.js`
  - Updates `state.token = accessToken`, `state.isAuthenticated = Boolean(state.token)`, persists to `localStorage`.
- `Frontend/src/shared/api/axios.js` dispatches `store.dispatch(setCredentials({ accessToken: newAccessToken, refreshToken: data?.refreshToken, user: data?.user }))` upon successful refresh response.

### ProtectedRoute RBAC Contract
- Input prop `allowedRoles: string[] | undefined`
- Normalization: `normalizedAllowedRoles = allowedRoles.map(r => String(r).toLowerCase().trim())`
- Behavior:
  - If unauthenticated -> redirect to `ROUTES.LOGIN`
  - If authenticated and `normalizedAllowedRoles` present:
    - If user role (verified via `freshRole` from `checkAuth()` or cached `userRole`) is not in `normalizedAllowedRoles`, redirect to `ROUTES.DASHBOARD` and toast access denied.
    - If user role is in `normalizedAllowedRoles`, render `<Outlet />`.

## Code Layout
All frontend code is in `Frontend/src/`:
- `Frontend/src/features/auth/store/authSlice.js`
- `Frontend/src/features/auth/services/auth.service.js`
- `Frontend/src/features/auth/hooks/useAuth.js`
- `Frontend/src/shared/api/axios.js`
- `Frontend/src/features/tasks/hooks/useTasks.js`
- `Frontend/src/features/projects/hooks/useProjects.js`
- `Frontend/src/features/tasks/store/taskSlice.js`
- `Frontend/src/features/projects/store/projectSlice.js`
- `Frontend/src/features/admin/store/adminSlice.js`
- `Frontend/src/app/router/ProtectedRoute.jsx`
