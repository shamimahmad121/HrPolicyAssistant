# HR Policy Assistant

Angular 18 SPA for the HR Policy Assistant — see `../requirements.md` for the full product/architecture spec.

Two tabs, one app, role-gated by Cognito group:

- **Ask HR** (`/ask`) — every authenticated employee. Grounded Q&A chat UI with source citations.
- **Policy Management** (`/policies`) — `HR-Admin` group only. Upload, replace/version, retire policies.

This is a **frontend-only scaffold**. `PolicyService` and `ChatService`
(`src/app/core/services`) hold in-memory mock data behind the same
interface the real API calls will use — swap their method bodies for
`HttpClient` calls to `environment.apiBaseUrl` once the ASP.NET Core API
exists. Everything else (guards, interceptor, models, UI) is wired for
the real thing already.

## Running it

```bash
npm install
npm start          # ng serve, http://localhost:4200
```

## Auth

`environment.ts` / `environment.prod.ts` hold the Cognito User Pool config
(`cognito.userPoolId`, `cognito.userPoolClientId`). Until those are filled
in, `AuthService` (`src/app/core/auth/auth.service.ts`) falls back to an
in-memory mock login so the UI is usable without live infra. Demo accounts,
shown on the login page:

| Role | Email | Password |
|---|---|---|
| HR-Admin | `admin@hrpolicy.demo` | anything |
| Employee | `employee@hrpolicy.demo` | anything |

Once `cognito.userPoolId`/`userPoolClientId` are set, `AuthService`
automatically switches to real Amplify/Cognito sign-in and reads the
`cognito:groups` claim off the ID token to drive the route guards
(`auth.guard.ts`, `role.guard.ts`) and the `Authorization: Bearer <idToken>`
header attached by `auth.interceptor.ts`. Route guards are UX only — the
real API must re-check the group claim server-side.

## Structure

```
src/app/
  core/
    auth/          AuthService, guards, Amplify config, mock demo accounts
    models/        Policy, ChatMessage, AppUser
    services/      PolicyService, ChatService (mock data for now)
    interceptors/  attaches bearer token to outgoing API calls
  layout/shell/     toolbar + tab nav + router-outlet
  auth/login/       sign-in page
  features/
    ask-hr/chat/            employee chat UI
    policy-management/      admin policy table + upload/replace/history/retire dialogs
```

## Build

```bash
npm run build       # production build → dist/hr-policy-assistant
```

---

Originally generated with [Angular CLI](https://github.com/angular/angular-cli) 18.2.21.
