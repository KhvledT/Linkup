# Linkup — Architecture & Reverse-Engineering Notes

> **Purpose.** Descriptive, reverse-engineered documentation of the **Linkup** social-media SPA
> (React). This document records how the application *actually* behaves from its source code.
> The two fix rounds (Phase-1 contract alignment and JWT auth hardening) documented in
> `REVERSE_ENGINEERING.md` §5.2/§5.7 were applied on 2026-08-10 **before** this revision, so the
> facts below describe the **post-fix** tree; §38/§39/§40 keep pre-fix findings where they are
> still informative.
>
> - **Snapshot date:** 2026-08-10 · **Root:** `d:\Linkedin\social media app`
> - **Scope:** every source file read in full (61 files: 6 root/config, 3 `public/`, 52 `src/`,
>   including the auth-hardening module `src/Services/authHeaders.js`).
> - **Method:** facts below cite exact file paths and line numbers. Where the README and the
>   code disagree, the **code wins** and the discrepancy is called out explicitly (§34, §39, §40).
> - **Live verification:** the backend contract (envelopes, endpoints, auth header) was fully
>   exercised with live HTTP probes on 2026-08-10; the verified shapes are captured verbatim in
>   `REVERSE_ENGINEERING.md` Part II and summarized in §39.

---

## Table of Contents

| # | Section | # | Section |
|---|---------|---|---------|
| 01 | Project Overview | 21 | Comments |
| 02 | Technology Stack | 22 | Profile |
| 03 | Repository Structure | 23 | User Page |
| 04 | Build & Tooling | 24 | Image Handling |
| 05 | Application Entry Points | 25 | HeroUI Usage |
| 06 | Dependency Graph | 26 | Theming & Styling |
| 07 | Routing Architecture | 27 | Responsive Layout |
| 08 | Route Protection & Guards | 28 | Toast Notifications |
| 09 | AuthContext | 29 | Loading & Error States |
| 10 | ThemeContext | 30 | Utility Modules |
| 11 | React Query Configuration | 31 | User-Facing Data Flows |
| 12 | API Service Layer | 32 | Query Invalidation & Refetch |
| 13 | Endpoints Catalog | 33 | Error Handling Strategy |
| 14 | Authentication Flow | 34 | Configuration & Environment |
| 15 | Authorization & Token Handling | 35 | Deployment |
| 16 | Data Models | 36 | Security Observations |
| 17 | Form Validation | 37 | Performance Notes |
| 18 | Feed | 38 | Code Smells |
| 19 | Post CRUD | 39 | API Contract Discrepancies |
| 20 | Post Rendering | 40 | Roadmap Indicators |

---

## 01 · Project Overview

Linkup is a **frontend-only single-page application** that mimics a LinkedIn-style social
network:

- **Authentication** — register and login with Zod-validated forms (`src/pages/LoginPage.jsx`,
  `src/pages/RegisterPage.jsx`), token stored in `localStorage`.
- **Post feed** — infinite-scroll feed of posts (`src/pages/FeedPage.jsx`), create/delete posts
  (`CreatePost`, `Post`), and an edit page (`src/pages/EditPostPage.jsx`).
- **Post details** — one post with its full comment list (`src/pages/PostDetailsPage.jsx`).
- **Comments** — create, edit, delete with confirmation modals and toasts.
- **Profile** — current user's profile (`src/pages/ProfilePage.jsx`) with avatar preview,
  avatar upload, settings modal (dark-mode toggle, change password), and the user's own posts.
- **User page** — a card for the author of a post (`src/pages/UserPage.jsx`).
- **Theme** — light/dark red theme driven by React Context (`src/Contexts/ThemeContext.jsx`).

There is **no backend code, database, or build-time environment configuration** in this
repository. All server state lives in a remote REST API whose base URL is hard-coded in four
service modules (§12, §13). The live backend exposed by that URL is a *different version* of
the API than the frontend expects (§39).

Key structural facts:

- SPA shell: `index.html` → `src/main.jsx` → `src/App.jsx` (§5).
- Client-side routing: `createBrowserRouter` (`src/App.jsx:39–70`), §7.
- Auth state: boolean + user ID in React Context, seeded from `localStorage` (`src/Contexts/AuthContext.jsx:10–13`), §9.
- The API token is read **ad hoc from `localStorage` inside every service call** — there is
  no axios instance, no interceptor, and no centralized request layer (§12).
- Several UI features are **stubbed/UI-only** (like/shares counters, sidebar lists, Settings
  "Soon" rows) — §40.

---

## 02 · Technology Stack

Versions below are the semver ranges declared in `package.json` (lockfile resolves exact
installs).

| Layer | Package | Declared version | Used in |
|---|---|---|---|
| Core | `react` / `react-dom` | `^19.1.0` / `^19.1.1` | every component, `src/main.jsx` |
| Build | `vite` / `@vitejs/plugin-react` | `^7.0.4` / dev | `vite.config.js` |
| Styling | `tailwindcss` / `@tailwindcss/vite` | `^4.1.11` | `src/index.css`, `vite.config.js` |
| UI kit | `@heroui/react` | `^2.8.2` | Navbar, Login/Register, CreateComment, Sidebar |
| Routing | `react-router-dom` | `^7.7.1` | `src/App.jsx`, all pages |
| Server state | `@tanstack/react-query` + devtools | `^5.85.3` | `src/App.jsx`, pages, components |
| HTTP | `axios` | `^1.11.0` | `src/Services/*` |
| Forms | `react-hook-form` + `@hookform/resolvers` | `^7.62.0` / `^5.2.1` | LoginPage, RegisterPage |
| Validation | `zod` | `^4.0.14` | `src/schema/*` |
| Toasts | `react-hot-toast` | `^2.6.0` | Register, EditPost, Comments, modals, Navbar |
| Icons | `@fortawesome/fontawesome-free` | `^7.0.0` | global CSS import; `fa-*` classes |
| Lint | `eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` + `globals` | dev | `eslint.config.js` |

**Declared in `package.json` but never referenced in `src/`** (verified by search):

| Package | Version | Note |
|---|---|---|
| `framer-motion` | `^12.23.12` | Peer dependency of `@heroui`; never imported in app code. README advertises "Framer Motion powered transitions" (`README.md:27`) but no `motion`/`framer-motion` import exists. |
| `react-infinite-scroll-component` | `^6.1.0` | Feed pagination is hand-rolled with `IntersectionObserver` (`FeedPage.jsx:56–68`). |
| `@shadcn/ui` | `^0.0.4` | No shadcn component is used anywhere. |

**Not present:** TypeScript, test runner, Prettier config, i18n library, any CI file.

---

## 03 · Repository Structure

```
d:\Linkedin\social media app
├─ eslint.config.js            ESLint flat config (react-hooks + react-refresh rules)
├─ index.html                  Vite HTML entry — mounts #root
├─ package.json                Dependencies/scripts (§02, §04)
├─ package-lock.json
├─ README.md                   Marketing readme (contains several inaccuracies — §34, §39, §40)
├─ vite.config.js              Vite config — plugins: react(), tailwindcss()
├─ public/
│  ├─ _redirects               Netlify SPA fallback:  "/*   /index.html   200"
│  ├─ FakeProfileImage.png     Bundled fallback avatar (imported in Sidebar, Comments)
│  └─ Linkuo-logo.svg          Logo asset (brand spelled "Linkuo" here, app is "Linkup")
└─ src/
   ├─ App.css                  Imported by App.jsx:1 — EMPTY file (dead import)
   ├─ App.jsx                  Module-level QueryClient, router, provider tree, global <Toaster/>
   ├─ hero.js                  Tailwind v4 plugin entry: `heroui()` plugin
   ├─ index.css                Tailwind v4 setup + global styles (~523 lines)
   ├─ main.jsx                 createRoot + provider hierarchy (StrictMode > HeroUI > Theme > Auth > App)
   │
   ├─ Components/   (24 files)  UI components (§25 for HeroUI surface area)
   ├─ Contexts/     (2 files)   AuthContext.jsx, ThemeContext.jsx
   ├─ Layout/       (2 files)   AuthLayout.jsx, MainLayout.jsx
   ├─ Pages/        (9 files)   §18–§23
   ├─ ProtectedRoutes/ (2 files) ProtactedRoute.jsx (sic), ProtectedAuthRoute.jsx
   ├─ Schema/       (2 files)   LoginSchama.js (sic), RegisterSchema.js
   ├─ Services/     (4 files)   AuthService, CommentServices, FeedServices, UserDetailsServices
   └─ Utils/        (1 file)    queryUtils.js
```

**Components (24):** `ChangePasswordModal`, `ChangeProfilePictureModal`, `CommentEditBox`,
`CommentHeader`, `Comments`, `CreateComment`, `CreatePost`, `DeleteCommentConfirmModal`,
`DeletePostConfirmModal`, `DropDown`, `ErrorMessage`, `FetchingIcon`, `LoadingSpinner`,
`LogoutConfirmModal`, `Navbar`, `Post`, `PostBtns`, `PostHeader`, `PostImageModal`,
`PostStatistics`, `ProfilePictureModal`, `SettingsModal`, `Sidebar`, `UserPosts`.

**Pages (9):** `EditPostPage`, `FeedPage`, `LoadingPage`, `LoginPage`, `NotFoundPage`,
`PostDetailsPage`, `ProfilePage`, `RegisterPage`, `UserPage`.

**Services (4):** `AuthService.js`, `CommentServices.js`, `FeedServices.js`,
`UserDetailsServices.js` — each declares its own private `BASE_URL` constant (§12).

---

## 04 · Build & Tooling

- **Vite 7** SPA build. Scripts (`package.json`): `dev`, `build`, `preview`, `lint`.
- **`vite.config.js`** — `plugins: [react(), tailwindcss()]`. No proxy, no aliases, no
  environment branching, no code-splitting config.
- **Tailwind CSS 4** is configured entirely from CSS (no `tailwind.config.*`):

  ```css
  /* src/index.css:1–4 */
  @import "tailwindcss";
  @plugin './hero.js';                                        /* registers HeroUI's plugin */
  @source '../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}';
  @custom-variant dark (&:is(.dark *));
  ```

  `src/hero.js` is `import { heroui } from "@heroui/react"; export default heroui();` — the
  Tailwind v4 plugin bridge that makes HeroUI's design tokens available as utilities.
- **ESLint** flat config (`eslint.config.js`): applies to `**/*.{js,jsx}`; includes
  `eslint-plugin-react-hooks` (recommended) and `eslint-plugin-react-refresh`
  (`only-export-components` = warn); `no-unused-vars` is an error with
  `varsIgnorePattern: '^[A-Z_]'` (this exemption hides unused component-style exports, e.g.
  `AcmeLogo` in `Navbar.jsx:9`). Ignores `dist`.
- **No TypeScript, no tests, no Prettier.** All code is plain JSX with heavy inline comments
  (mix of English and Egyptian-Arabic).
- Line endings in source files are CRLF; the repo has no enforced formatting.

---

## 05 · Application Entry Points

**`index.html`** — standard Vite shell (mount `#root`, `<script type="module" src="/src/main.jsx">`).

**`src/main.jsx`** builds the provider hierarchy (bottom-up in code):

```
createRoot(#root)
 └─ <StrictMode>
     └─ <HeroUIProvider>              ← HeroUI context/theme provider
         └─ <ThemeContextProvider>    ← dark/light palette + body.dark class
             └─ <AuthContextProvider> ← isloggedIn / userID / profilePageIsOpen
                 └─ <App/>
```

**`src/App.jsx`** is the application shell. It:

1. Creates a **module-level** `queryClient` (`App.jsx:35`) and **exports it** —
   `Components/CreatePost.jsx`, `Components/Comments.jsx`, `CreateComment.jsx` and
   `Utils/queryUtils.js` import `{ queryClient } from '../App'` (upward import — §38).
2. Builds the router with `createBrowserRouter` (§7).
3. Renders inside `QueryClientProvider`:
   - `<ReactQueryDevtools/>` — **always mounted**, no `import.meta.env.DEV` gate
     (`App.jsx:80`), so it ships in production builds too (§37).
   - `<RouterProvider router={router}/>`
   - A global `<Toaster/>` from `react-hot-toast`, styled with theme colors (§28).
4. Reads `themeColors` from `useTheme()` to style the Toaster; the App component itself
   renders no other UI.

**Notable:** `App.css` is imported (`App.jsx:2`) but the file is empty.

---

## 06 · Dependency Graph

```
┌────────────────────────────────────────────────────────────────────────────┐
│ index.html → main.jsx                                                      │
│   <HeroUIProvider> <ThemeContextProvider> <AuthContextProvider> <App/>     │
└──────────────────────────────────┬─────────────────────────────────────────┘
                                   ▼
                            App.jsx (shell)
                   ┌──────────────┼──────────────┬─────────────┐
                   ▼              ▼              ▼             ▼
          QueryClientProvider  RouterProvider  <Toaster/>   ReactQueryDevtools
                   │              │
              (exported          ▼
            queryClient)   AuthLayout → login, register
                   │        MainLayout → index(feed), post-details/:id,
                   │                    profile, edit-post/:id,
                   │                    user-page/:id, *(404)
                   │              │
                   │   ┌──────────┴───────────────────────────────┐
                   ▼   ▼                                          ▼
              Pages → Components → Services ── axios ──▶ REST API
                                                │          route-posts.routemisr.com
                                                ▼
                                          localStorage.token (read at call time)
        Contexts (Auth, Theme) wrap all pages/components (global state)
        Utils/queryUtils ──imports queryClient from App──▶ App.jsx (upward import)
```

Key edges worth noting:

- **Services → `localStorage`**: every authenticated request reads
  `localStorage.getItem("token")` inside the service function (`FeedServices.js:7,23,31,40,48`;
  `CommentServices.js:8,16,24`; `UserDetailsServices.js:7,14,23,31`). `AuthService` sends no
  token (§15).
- **Components → App.jsx**: `CreatePost`, `Comments`, `CreateComment`, and `Utils/queryUtils`
  import `queryClient` from `App.jsx`. Because `queryClient` is a module-level export, this
  upward edge works at runtime but couples leaf modules to the root shell (§38).
- **Contexts**: `ThemeContext` is consumed by nearly every component (via `useTheme`);
  `AuthContext` is consumed by layouts, guards, pages, and post/comment components.
- **Public assets**: `Sidebar` and `Comments` import `FakeProfileImage.png` directly from
  `public/` (Vite serves `/FakeProfileImage.png` at runtime).

---

## 07 · Routing Architecture

Defined in `src/App.jsx:39–70` using `createBrowserRouter` (data router, React Router 7).
Two nested route groups each use an empty parent `path: ''`; children paths are relative.

| URL | Element | Layout | Guard | Purpose |
|---|---|---|---|---|
| `/login` | `LoginPage` | `AuthLayout` | `ProtectedAuthRoute` | sign-in |
| `/register` | `RegisterPage` | `AuthLayout` | `ProtectedAuthRoute` | sign-up |
| `/` | `FeedPage` | `MainLayout` | `ProtactedRoute` | index route — post feed |
| `/post-details/:id` | `PostDetailsPage` | `MainLayout` | `ProtactedRoute` | post + full comments |
| `/profile` | `ProfilePage` | `MainLayout` | `ProtactedRoute` | current user profile |
| `/edit-post/:id` | `EditPostPage` | `MainLayout` | `ProtactedRoute` | edit a post |
| `/user-page/:id` | `UserPage` | `MainLayout` | `ProtactedRoute` | author card for a post |
| `*` | `NotFoundPage` | `MainLayout` | **none** | 404 catch-all |

Observations:

- The catch-all `*` lives **inside** `MainLayout` but is **not** wrapped in `ProtactedRoute`,
  so a logged-out visitor can see the 404 page inside the main layout.
- There is **no `/feed` route** — the feed is the index route `/`. `FeedPage` has a
  refetch-on-return effect that fires when `location.pathname === '/'` (`FeedPage.jsx:85–89`,
  retargeted from the old `/feed` check in Phase-1, §38).
- `MainLayout` branches on `isloggedIn`: logged-in users get the 12-column responsive grid
  with left/right `Sidebar`; logged-out users get a centered single column without sidebars
  (`MainLayout.jsx:20–41`). In practice the guarded children of MainLayout can only render
  when logged in.
- `AuthLayout` renders decorative floating shapes + gradient and a centered `<Outlet/>`
  (`AuthLayout.jsx:8–47`).
- Navigation is imperative (`useNavigate`) in most components; `Link` is used only in
  LoginPage/RegisterPage and Navbar Sign Up button.
- All route params (`:id`) are read with `useParams` and used directly as API IDs — no
  parsing/validation of the segment.

---

## 08 · Route Protection & Guards

Two tiny guard components live in `src/ProtectedRoutes/` (note the misspelling of
`ProtactedRoute.jsx` — §38):

| Guard | Logic | Effect |
|---|---|---|
| `ProtactedRoute.jsx` | `isloggedIn ? children : <Navigate to="/login"/>` | protects app routes |
| `ProtectedAuthRoute.jsx` | `isloggedIn ? <Navigate to="/"/> : children` | keeps authed users off login/register |

Both read `isloggedIn` from `AuthContext` (`useContext(AuthContext)`), which is initialized
from `localStorage.getItem('token')` (`AuthContext.jsx:10`).

Characteristics:

- **Boolean-only, no role checks** — any truthy `token` in `localStorage` grants access to
  every protected route; there is no per-route permission model.
- **No token validation** — guards never call the API to confirm the token is still valid.
  A stale/expired token simply leads to 401 errors at query/mutation time (§15, §33).
- **No redirect memory** — `<Navigate to="/login">` discards the originally requested path;
  after login the user always lands on `/` (LoginPage `navigator('/')`, `LoginPage.jsx:64`).
- Guards are applied per-route as wrapper elements in `App.jsx` (`{path, element}`), not as
  layout-level `loader`/`guard` hooks.

---

## 09 · AuthContext

`src/Contexts/AuthContext.jsx` — a minimal, non-memoized React context.

| State | Type | Initializer | Meaning |
|---|---|---|---|
| `isloggedIn` / `setIsloggedIn` | boolean | `Boolean(localStorage.token) && isValidJwt(localStorage.token)` (`:14–21`) — garbage tokens are **cleared** on startup | "is a *well-formed* JWT present?" |
| `userID` / `setUserID` | string | `localStorage.getItem('userID') \|\| ''` (`:24`) | current user `_id` |
| `profilePageIsOpen` / `setProfilePageIsOpen` | boolean | `false` (`:27`) | highlights the Navbar Profile button |

**Who reads it:** `MainLayout` (isloggedIn), `Navbar` (isloggedIn, setUserID, profilePageIsOpen,
setProfilePageIsOpen), `LoginPage`/`RegisterPage` (setIsloggedIn), `FeedPage` (setUserID),
`ProfilePage` (userID), `Post` (userID), `Comments` (userID), `ChangePasswordModal`
(setIsloggedIn), both route guards.

**Responsibilities & quirks:**

- The context stores **no token**. Token persistence is done by the callers:
  `LoginPage` writes `localStorage.token` (only after `isValidJwt` passes) and removes it on
  error (`LoginPage.jsx:63–83`); `Navbar.handleLogout` removes `token` and `userID` then flips
  `isloggedIn` and clears `userID` (`Navbar.jsx:40–47`); `ChangePasswordModal` clears both
  keys and flips the flag after a successful password change (`ChangePasswordModal.jsx:35–46`).
  `clearStoredAuth()` (authHeaders.js) removes both keys in one call.
- **Startup self-heal** (`:14–21`): if a stored token is not a well-formed JWT, `clearStoredAuth()`
  wipes `token` + `userID` and `isloggedIn` starts `false` — the literal `"undefined"` string
  left by an earlier broken build can no longer create a phantom session (§15, §39).
- **`userID` is populated lazily by the feed** — not at login. `FeedPage.getUserID()`
  (`FeedPage.jsx:45–62`) checks `localStorage.userID`; if absent it calls `getUserDetails()`
  and persists `res?.data?.data?.user?._id` (the same `data.data.user` shape `ProfilePage`
  uses — the old `userID.data.user._id` mismatch is gone, §16, §38).
- The provider value object is re-created on every render of the provider; combined with no
  memoization, any `setX` call re-renders every consumer (§37).
- `profilePageIsOpen` is a piece of "current route" state held in context; `Navbar` uses it
  to draw the underline indicator under the Profile button and resets it from
  `location.pathname === '/profile'` in an effect.

---

## 10 · ThemeContext

`src/Contexts/ThemeContext.jsx` — the theming system.

**Palettes** (two hard-coded objects, `:9–29`):

| Token | Light | Dark |
|---|---|---|
| `primary` | `#8B0000` (dark red) | `#FF6B6B` |
| `secondary` | `#DC143C` (crimson) | `#FF8E8E` |
| `accent` | `#8B0000` | `#FF6B6B` |
| `background` | `#F5F5F5` | `#1A1A1A` |
| `surface` | `#FFFFFF` | `#2D2D2D` |
| `text` | `#1A1A1A` | `#FFFFFF` |
| `textSecondary` | `#65676B` | `#B0B0B0` |

**Mechanism:**

- `isDarkMode` initializes from `localStorage.getItem('darkMode')` parsed as JSON, default
  `false` (`:35–39`). Note: `JSON.parse` is not wrapped in try/catch.
- A `useEffect` on `isDarkMode` (`:64–87`) re-applies all seven colors from the chosen
  palette, persists `'darkMode'` to `localStorage`, and toggles `document.body.classList`
  `'dark'`. The `.dark` class on `<body>` is what Tailwind's `@custom-variant dark`
  (`index.css:4`) and the hand-written `.dark ...` CSS rules react to.
- `toggleDarkMode()` flips the flag (`:90–92`).
- `updateTheme(newColors)` (`:96–105`) can override individual colors, but **no component
  calls it** (verified by search) — it is dead API surface, despite README claims of
  "5 pre-built color schemes with real-time switching" (`README.md:23`; only light/dark red
  exist, §39/§40).
- `useTheme()` throws if used outside the provider (`:122–130`) — the only context hook with
  such a guard.

**How components use it:** almost exclusively via `const { themeColors } = useTheme()` and
inline `style={{ backgroundColor: themeColors.surface }}` etc. Tailwind `dark:` utilities are
almost never used; the CSS file carries bespoke `.dark` overrides for scrollbars, inputs,
selects, dropdowns and the profile-nav underline. Several light-only pages/areas hard-code
`bg-white` (LoginPage/RegisterPage cards, LoadingPage, NotFoundPage, left Sidebar, Profile
cards) and therefore ignore dark mode (§26).

---

## 11 · React Query Configuration

**Client creation** — `App.jsx:35`: `export const queryClient = new QueryClient();`
No `defaultOptions` are set, so every query inherits TanStack defaults: **retry 3**, retry
delay backoff, `staleTime: 0`, `gcTime: 5min`, `refetchOnWindowFocus: true` (until overridden
per query).

**DevTools** — `<ReactQueryDevtools/>` is always rendered inside the provider (`App.jsx:80`),
unconditionally (no `process.env.NODE_ENV` / `import.meta.env.DEV` gate).

**Query keys in use:**

| Key | Created by | Fetches |
|---|---|---|
| `['posts']` | `FeedPage` (useInfiniteQuery) | paginated feed |
| `['postDetails', id]` | `PostDetailsPage`, `UserPage` | single post |
| `['userDetails']` | `ProfilePage` | current user |
| `['userPosts', userID]` | `UserPosts` (`enabled: !!userID`) | current user's posts |
| `['postComments', postId]` | `Comments` | `GET /posts/:id/comments` |

**Per-query options (as configured):**

| Query | Options |
|---|---|
| Feed `['posts']` (`FeedPage.jsx:28–39`) | `getNextPageParam`: `const posts = lastPage?.data?.data?.posts \|\| []; return posts.length < 50 ? undefined : allPages.length + 1` (`GET /posts` returns **no** `meta`, so the length heuristic is authoritative — RE §2.1/§5.4); `refetchOnWindowFocus: false`; `refetchOnReconnect: true`; `refetchOnMount: true`; `staleTime: 15000` |
| Post details `['postDetails', id]` (`PostDetailsPage.jsx:18–26`) | `refetchOnWindowFocus: false`; `refetchOnReconnect: true`; `refetchOnMount: true`; `retry: 2`; `staleTime: 15000` |
| User details `['userDetails']` (`ProfilePage.jsx:24–32`) | `refetchOnWindowFocus: false`; `refetchOnReconnect: true`; `refetchOnMount: true`; `retry: 2`; `staleTime: 30000` |
| User posts `['userPosts']` (`UserPosts.jsx`) | same refetch flags, `retry: 2` |
| User page `['postDetails', id]` (`UserPage.jsx:17–21`) | only `refetchOnWindowFocus: false` — reuses the post-details cache entry |

**Mutation style:** every mutation (login, register, create/update/delete post, comments,
password change, photo upload) is a `useMutation` with `onSuccess`/`onError` inline. There is
**no centralized invalidation** — each component decides what to invalidate/refetch (§32).
`EditPostPage` even loads its "query" through a `useMutation` (`EditPostPage.jsx:21–33`).

---

## 12 · API Service Layer

There is **no shared axios instance** and **no interceptor**. Each of the four service
modules defines its own `BASE_URL` constant:

```js
const BASE_URL = "https://route-posts.routemisr.com/";   // trailing slash
// AuthService.js:3, FeedServices.js:3, CommentServices.js:3, UserDetailsServices.js:3
```

Since the auth-hardening round, token handling is **centralized** in
`Services/authHeaders.js` — `getStoredToken()`, `isValidJwt()`, `clearStoredAuth()`,
`getAuthHeaders()` — and every authenticated call uses it:

```js
// FeedServices.js:5–14 (representative)
export const getAllPosts = (page = 1) => {
  return axios.get(`${BASE_URL}posts`, {
    headers: getAuthHeaders(),       // { Authorization: `Bearer ${token}` } — or {} if invalid
    params: { limit: 50, page, sort: "-createdAt" },
  });
};
```

`getAuthHeaders()` returns `{ Authorization: 'Bearer <token>' }` only when the stored token
passes `isValidJwt()` (3 dot-separated base64url segments, length > 20); otherwise it **clears
`token` + `userID`** and returns `{}`, so a malformed value is never sent (RE §5.7).

**Module summaries (current):**

| Module | Exports | Notes |
|---|---|---|
| `Services/authHeaders.js` | `getStoredToken`, `isValidJwt`, `clearStoredAuth`, `getAuthHeaders` | single source of truth for the auth header (§15) |
| `Services/AuthService.js` | `registerUser(userData)` → `POST users/signup`; `loginUser(userData)` → `POST users/signin` | no auth header, no config object at all |
| `Services/FeedServices.js` | `getAllPosts(page)` → `GET posts`; `postDetails(id)` → `GET posts/:id`; `createPost(data)` → `POST posts`; `deletePost(id)` → `DELETE posts/:id`; `updatePost(data, id)` → `PUT posts/:id` | feed pagination params live here (`limit: 50, sort: -createdAt`) |
| `Services/CommentServices.js` | `getPostComments(postId, page, limit)` → `GET posts/:id/comments`; `createComment(postId, data)` → `POST posts/:id/comments`; `deleteComment(postId, commentId)` → `DELETE posts/:id/comments/:cid`; `updateComment(postId, commentId, data)` → `PUT posts/:id/comments/:cid` | comment writes build **FormData** (`content`, optional `image`) — the API requires multipart even for text-only |
| `Services/UserDetailsServices.js` | `getUserDetails()` → `GET users/profile-data`; `UploadUserImage(data)` → `PUT users/upload-photo`; `getUserPosts(id)` → `GET users/:id/posts?limit=50`; `changeUserPassword(body)` → `PATCH users/change-password` | no manual `Content-Type` anywhere (axios sets the multipart boundary) |

**Design consequences:**

- Because the token is read at call time, a changed/cleared token affects the next request
  immediately; but nothing retries or redirects on a 401 (§15, §33).
- There is no response unwrapping, no error normalization, and no request logging.
- Axios errors (`error.response?.data?.message`) are handled inconsistently across callers
  (§33).

---

## 13 · Endpoints Catalog

All paths below are relative to `https://route-posts.routemisr.com/`. The frontend calls
**15 distinct endpoints** across the four service modules. "Auth" = `Authorization: Bearer`
via `getAuthHeaders()` (except the two auth endpoints).

| # | Method | Path | Service fn (line) | Auth | Consumed by |
|---|---|---|---|---|---|
| 1 | POST | `/users/signup` | `registerUser` (AuthService.js:5) | – | RegisterPage |
| 2 | POST | `/users/signin` | `loginUser` (AuthService.js:10) | – | LoginPage |
| 3 | GET | `/posts?limit=50&page=&sort=-createdAt` | `getAllPosts` (FeedServices.js:5) | ✅ | FeedPage |
| 4 | GET | `/posts/:id` | `postDetails` (FeedServices.js:16) | ✅ | PostDetailsPage, UserPage, EditPostPage |
| 5 | POST | `/posts` | `createPost` (FeedServices.js:22) | ✅ | CreatePost |
| 6 | DELETE | `/posts/:id` | `deletePost` (FeedServices.js:28) | ✅ | Post |
| 7 | PUT | `/posts/:id` | `updatePost` (FeedServices.js:34) | ✅ | EditPostPage |
| 8 | GET | `/posts/:id/comments` | `getPostComments` (CommentServices.js:5) | ✅ | Comments |
| 9 | POST | `/posts/:id/comments` | `createComment` (CommentServices.js:12) | ✅ | CreateComment |
| 10 | PUT | `/posts/:id/comments/:cid` | `updateComment` (CommentServices.js:27) | ✅ | Comments |
| 11 | DELETE | `/posts/:id/comments/:cid` | `deleteComment` (CommentServices.js:21) | ✅ | Comments |
| 12 | GET | `/users/profile-data` | `getUserDetails` (UserDetailsServices.js:5) | ✅ | ProfilePage, FeedPage |
| 13 | PUT | `/users/upload-photo` | `UploadUserImage` (UserDetailsServices.js:11) | ✅ | ChangeProfilePictureModal |
| 14 | GET | `/users/:id/posts?limit=50` | `getUserPosts` (UserDetailsServices.js:17) | ✅ | UserPosts |
| 15 | PATCH | `/users/change-password` | `changeUserPassword` (UserDetailsServices.js:23) | ✅ | ChangePasswordModal |

**Payload shapes the frontend sends:**

| Endpoint | Body |
|---|---|
| `users/signup` | `{ name, username, email, password, rePassword, dateOfBirth, gender }` (RegisterPage form — `username` added by Phase-1) |
| `users/signin` | `{ email, password }` (the API also accepts `{ login, password }`, RE §2.2) |
| `POST /posts` | `FormData` — `body` (text) and `image` (file) if provided (`CreatePost.jsx`) |
| `PUT /posts/:id` | `FormData` — `body`, `image` (only changed fields are appended; `EditPostPage.jsx:40–42`) |
| `POST /posts/:id/comments` | `FormData` — `content` (multipart is required by the API even for text-only; `CreateComment.jsx` trims) |
| `PUT /posts/:id/comments/:cid` | `FormData` — `content` (`Comments.jsx` edit flow) |
| `PUT /users/upload-photo` | `FormData` with field `photo` (`ChangeProfilePictureModal`) |
| `PATCH /users/change-password` | `{ password, newPassword, confirmPassword }` (ChangePasswordModal form state) |

**Expected response shapes** (as accessed in code — all verified live in RE Part II; §39
summarizes the remaining mismatches):

| Endpoint | Response path used in code |
|---|---|
| `users/signin` | `data.data.token` (LoginPage.jsx:63) |
| `posts` (feed) | `data.data.posts` for pagination (FeedPage.jsx:32); the **render path** still reads `page?.data?.posts` — a pre-fix unwrap mismatch, see §18/§39 |
| `posts/:id` | `data.data.post` (PostDetailsPage.jsx:57, UserPage.jsx:23) |
| `posts/:id/comments` | `data.data.comments` (Comments.jsx:31) |
| `users/profile-data` | `data.data.user` — consistently in ProfilePage and FeedPage (the old `data.user` read is gone) |
| `users/:id/posts` | `data.data.posts` (UserPosts.jsx:27) |

---

## 14 · Authentication Flow

### Registration (`RegisterPage.jsx`)

```
submit → handleSubmit(registerSchema) ──▶ useMutation(registerUser)
    onSuccess: toast.success('Account created successfully!', 7s)
               setTimeout 2s ──▶ navigator('/login')          (:37–42)
    onError:   toast.error(error?.response?.data?.message || 'Registration failed', 7s)   (:43–47)
               setIsloggedIn(false); localStorage.removeItem('token')
```

The form posts `{ name, username, email, password, rePassword, dateOfBirth, gender }` to
`POST /users/signup` (Phase-1 added the required `username` field). No token is stored on
registration; the user must log in. The `setIsloggedIn(false)` and token removal on error are
defensive leftovers — no token exists yet at that point.

### Login (`LoginPage.jsx`)

```
submit → loginSchema ──▶ useMutation(loginUser) POST /users/signin
    onSuccess: const token = data?.data?.token;
               if (!isValidJwt(token)) → show error, setIsloggedIn(false), remove token, DON'T navigate  (:63–69)
               else localStorage.setItem('token', token); setIsloggedIn(true); navigator('/')  (:70–74)
    onError:   setLoginErrorMessage(error.response?.data?.message || error.message)
               setIsloggedIn(false); localStorage.removeItem('token')   (:76–83)
```

- The error banner renders `{loginErrorMessage || 'Email or password is incorrect, please try again.'}`
  (`:269`) — the **real server message is now displayed**, with the old static string only as a
  fallback (previously the banner was always static; §33/§38).
- The token is persisted **before** navigation and only after `isValidJwt` passes; guards react
  on the next render.
- `userID` is NOT stored at login; it is bootstrapped by `FeedPage.getUserID()` on the feed
  (§9, §18).

### Change password (`ChangePasswordModal.jsx`)

- Fields `password` (current), `newPassword`, `confirmPassword`; manual validation (regex +
  match check); mutation `changeUserPassword`.
- `onSuccess` shows an inline success panel, then after **3 s** clears `token` + `userID`,
  sets `isloggedIn(false)`, closes, and navigates to `/login` (`:29–46`). The user is
  forcibly logged out after changing their password.

### Logout (`Navbar.jsx`)

- A confirmation modal (`LogoutConfirmModal`) precedes logout.
- `handleLogout` (`:40–46`): removes `token` and `userID`, sets `isloggedIn(false)` and
  `setUserID('')`, navigates to `/login`, and shows `toast.success('Logged out')`.

### AuthLayout chrome

Login/Register render inside `AuthLayout` (floating shapes, gradient overlay, centered
content, `AuthLayout.jsx`). The cards themselves hard-code `bg-white` (no dark variant).

---

## 15 · Authorization & Token Handling

| Aspect | Implementation |
|---|---|
| Storage | `localStorage` key `token` (written LoginPage.jsx:70; removed on logout / pw-change / login error / startup self-heal) |
| Header | `Authorization: Bearer <token>` produced by `getAuthHeaders()` (authHeaders.js) — **not** the old custom `token` header, which the API rejects with `401 "token not provided"` (RE §2.1/§5.7) |
| Validation | `isValidJwt()` accepts only well-formed JWTs (3 base64url segments, length > 20); `getAuthHeaders()` **never sends a malformed token** — it clears `token`+`userID` and returns `{}` instead |
| Read timing | Read inside each service function at request time |
| Expiry | Not decoded client-side; no `exp` inspection |
| 401 handling | None automatic — surfaces as query/mutation `onError`; a stale-but-well-formed token persists in `localStorage` |
| Refresh | No refresh-token mechanism |
| Secondary key | `userID` (`_id`) cached in `localStorage` to skip a profile-data call (FeedPage.jsx:45–62, ProfilePage.jsx:37–42) |

Effective client-side authorization = **presence of a well-formed JWT in `localStorage.token`**
(AuthContext.jsx:14–21 — validated at startup; garbage is cleared and the session starts
logged-out). The guards never ask the server whether the token is valid, so an expired session
shows the app shell and only errors once a query fires. There is no request-interceptor layer
where a 401 could be turned into a global logout; each caller must handle errors itself (§33).

---

## 16 · Data Models

There are **no TypeScript types, PropTypes, or zod schemas for API data** — shapes below are
inferred from how the code accesses response objects.

**Post** — accessed as `post?._id`, `post?.body`, `post?.image`, `post?.user`
(Post/PostHeader/PostStatistics). **Comments are not embedded** in `Post` — they come from a
separate `GET /posts/:postId/comments` call (§21):

```
Post {
  _id: string
  body?: string
  image?: string (URL)
  user: { _id, name, username?, photo? }      // used in PostHeader
  privacy?: string                            // "public" etc. — never rendered
  likesCount / commentsCount / sharesCount    // read by PostStatistics (Phase-1)
  bookmarked?: boolean                        // never rendered
  isShare?: boolean / sharedPost?: Post       // never rendered
  topComment?                                 // returned by GET /posts/:id, never rendered
  comments?: Comment[]                        // NOT returned by the current API (§21, §39)
  createdAt?: string                          // ISO; sliced to YYYY-MM-DD for display
}
```

**Comment** — `comment._id`, `comment.content`, `comment.commentCreator`, `comment.createdAt`:

```
Comment {
  _id: string
  content: string
  commentCreator: { _id, name, photo? }
  createdAt?: string (ISO, sliced .slice(0,10))
}
```

**User** — from `users/profile-data`: `user.name`, `user.email`, `user.photo`,
`user.dateOfBirth` (`.slice(0,10)` in ProfilePage.jsx:138), `user.gender`, `user._id`.

**`fakePost`** — a client-only object in `Post.jsx` used only for the **avatar fallback** in
`PostHeader` (`fakePost.userAvatar = FakeProfileImage.png`):

```js
const fakePost = { userAvatar: fakeProfilePhoto, likes: 0, shares: 0 };  // Post.jsx:31–35
```

The `likes`/`shares` fields are now **dead** — `PostStatistics` reads real API counts
(`post?.likesCount ?? 0`, `post?.commentsCount ?? 0`, `post?.sharesCount ?? 0`, §20).

**Shape inconsistencies found (as-is, §38):**

| Where | Access | vs | Where |
|---|---|---|---|
| `FeedPage.jsx:107` | `page?.data?.posts` (render) | → | `FeedPage.jsx:32` `lastPage?.data?.data?.posts` (pagination) and the live envelope `response.data.data.posts` — the **feed renders an empty list** on success (§18/§39) |
| `UserPage.jsx:23` | `data?.data?.post?.user` | → | same call as PostDetailsPage `data?.data.post` |

---

## 17 · Form Validation

Two forms use **React Hook Form + Zod** (`zodResolver`); the change-password modal validates
manually.

**`src/schema/LoginSchama.js`** (sic) — `loginSchema`:

| Field | Rules |
|---|---|
| `email` | `zod.string()` nonempty + regex `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` |
| `password` | nonempty + min 8 + regex `^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$` (uppercase, lowercase, digit, special) |

**`src/schema/RegisterSchema.js`** — `registerSchema`:

| Field | Rules |
|---|---|
| `name` | nonempty, min 3, max 20 |
| `username` | nonempty, min 3, max 20, regex `^[a-zA-Z0-9._]+$` (Phase-1 — required by the API) |
| `email` | same regex as login |
| `password` | same strong-password regex |
| `rePassword` | nonempty; `.refine((d) => d.password === d.rePassword, { path: ['rePassword'] })` |
| `dateOfBirth` | `zod.coerce.date()` + refine age ≥ 18 (`currentYear - birthYear >= 18`) |
| `gender` | nonempty + regex `^(male\|female)$` |

Usage details:

- `LoginPage` (`:50–53`): `useForm({ defaultValues: {email:'',password:''}, resolver: zodResolver(loginSchema) })`.
- `RegisterPage` (`:20–31`): 7 default fields (incl. `username`) + `zodResolver(registerSchema)`.
- The HeroUI `Select` for gender is bridged to RHF by **manually synthesizing an event**
  (`RegisterPage.jsx:264–271`: `register('gender').onChange({ target: { name:'gender', value: selectedKey } })`)
  because HeroUI's `Select` doesn't accept RHF's standard register props.
- Password visibility toggles are implemented locally on both auth pages and in
  `ChangePasswordModal` (per-field: current/new/confirm).
- `ChangePasswordModal.jsx:78–108` duplicates the password regex client-side (no RHF, no zod)
  and validates current-password presence + confirm match.

**Not validated anywhere:** post body length/content, comment length, uploaded image type or
size.

---

## 18 · Feed

**Route:** `/` → `FeedPage.jsx` (inside `MainLayout`, guarded).

**Infinite query:**

```js
// FeedPage.jsx:28–39
useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 1 }) => getAllPosts(pageParam),
  getNextPageParam: (lastPage, allPages) => {
    const posts = lastPage?.data?.data?.posts || [];
    return posts.length < 50 ? undefined : allPages.length + 1;
  },
  refetchOnWindowFocus: false, refetchOnReconnect: true, refetchOnMount: true,
  staleTime: 15000,
});
```

`GET /posts` returns **no `meta`** (RE §2.1/§5.4), so the length heuristic (`< 50` → stop) is
the authoritative exhaustion signal, not `meta.pagination`.

**Scroll loading:** an `IntersectionObserver` watches a sentinel `<div ref={loadMoreRef}/>`
with `rootMargin: '10000px'` — i.e. the next page is fetched when the sentinel is within
10,000 px of the viewport — and calls `fetchNextPage()` when intersecting
(`FeedPage.jsx:69–81`). The observer disconnects on cleanup.

**userID bootstrap** (`FeedPage.jsx:45–62`): on mount, if no `localStorage.userID`, calls
`getUserDetails()` and stores `res?.data?.data?.user?._id` both in context and `localStorage`,
**wrapped in try/catch** so a failed profile bootstrap cannot break the feed (§9, §16).

**Refetch-on-return effect** (`FeedPage.jsx:85–89`): refetches when `location.pathname === '/'`
— the actual home route (the old `/feed` check was dead; fixed in Phase-1, §38).

**Render flow:**

```
isFetching && !isLoading      → <FetchingIcon/>            (background refresh pill)
isLoading                     → <LoadingPage/>             (full-block spinner)
isError                       → <ErrorMessage error refetch/>   (shows error.response.data.message)
else                          → pages = data?.pages ?? []  (crash-proof; data is undefined on error)
                                    → (page?.data?.posts ?? []).map(...) → <Post commentLimit={1} from="feedPage"/>
                              → sentinel div
isFetchingNextPage            → <FetchingIcon/>
```

**✅ Feed rendering fixed (2026-08-10).** The render used to unwrap `page?.data?.posts`
(`FeedPage.jsx:107`), i.e. `response.data.posts`, while the live envelope puts the array at
`response.data.data.posts` (the pagination code already reads it correctly at `:32`). The
render path was fixed to `page?.data?.data?.posts`, and the same one-level-short unwrap was
fixed in `ProfilePage` (`data.data.data.user`), `UserPosts` (`data.data.data.posts`),
`PostDetailsPage` / `UserPage` / `EditPostPage` (`data.data.data.post`). Verified live in a
headless-browser run: feed renders 50 posts, profile renders fully, zero exceptions (§39).

`CreatePost` sits above the list (§19). Each feed post shows only **1** comment
(`commentLimit={1}`) and navigates to `/post-details/:id` on click.

---

## 19 · Post CRUD

### Create — `Components/CreatePost.jsx`

- Toggle composer; fields `body` (textarea) + optional image (file input with preview).
- On submit: guard `if (body.trim() === '' && !image)` → toast "Write something or add a
  photo" (`:63`). Builds `FormData` with `body` and `image` fields and calls `createPost`.
- `onSuccess`: clears fields, `queryClient.invalidateQueries(['posts'])`, then after 500 ms
  `queryClient.refetchQueries({ queryKey: ['userPosts'] })`, toast "Post created" (`:51–53`).

### Read

- Feed: infinite query `['posts']` — §18.
- Details: `['postDetails', id]` (`PostDetailsPage`) — §20.
- Own posts: `['userPosts']` via `UserPosts` — §22.

### Update — `Pages/EditPostPage.jsx`

- **Loads the post through a `useMutation`**, not a query (`:21–35`): on success it sets
  `body`, `originalBody`, `imagePreview`, `originalImage` and flips a `loading` flag; on
  failure it **toasts "Failed to load the post" and redirects to `/`** (`:30–34`, added in
  Phase-1 — previously it only `console.error`ed, leaving an infinite spinner). Rendering
  waits on that boolean `loading`.
- Submit (`:37–50`): builds `FormData` appending only fields the user actually provides
  (`body` if trimmed non-empty, `image` if a new file was chosen); calls
  `updatePost(formData, id)`. On success: toast "Post updated", navigate to
  `/post-details/:id`. On error: toast "Failed to update post".
- Save is disabled while updating, when nothing changed
  (`originalBody?.trim() === body?.trim() && originalImage === imagePreview`), or when both
  fields are empty (`:74–76`).
- Preview uses `URL.createObjectURL(...)`; the created object URL is not revoked on removal.

### Delete — `Components/Post.jsx` + `DeletePostConfirmModal.jsx`

```
handleDeletePost(postId) → confirm modal → useMutation(deletePost)
  onSuccess: invalidateAndRefetch({ from, getPosts, getPostDetails })   (:77)
             if from==="PostDetailsPage" navigator('/')
             else if from==="userProfilePage" getUserPosts(userID)      (:80–81)
             toast 'Post deleted'
  onError:   toast 'Failed to delete post'
```

---

## 20 · Post Rendering

`Components/Post.jsx` is the shared post card used by the feed, the post-details page, and
the user profile's post list. Props: `post`, `commentLimit = 1000`, `getPostDetails`,
`getPosts`, `getUserPosts`, `from` (`'feedPage' | 'PostDetailsPage' | 'userProfilePage'`).
The `postId` prop and the **conditional `useParams()`** (a Rules-of-Hooks violation in the
pre-fix code) were **removed in Phase-1** (`Post.jsx:39–46`); `post?._id` is the single
source of the id.

**Card structure:**

```
┌──────────────────────────────────────────────┐
│ PostHeader  (avatar, name, date, DropDown ▲) │   edit/delete only if post.user._id === userID
├──────────────────────────────────────────────┤
│ body (clickable → post-details, except when  │
│   rendered on the details page itself)       │
├──────────────────────────────────────────────┤
│ image (aspect 16/9) + PostImageModal on click│
├──────────────────────────────────────────────┤
│ PostStatistics (likes / comments / shares)   │   real post.likesCount/commentsCount/sharesCount
├──────────────────────────────────────────────┤
│ PostBtns (Like · Comment · Share)            │   like/share are UI-only (§40)
├──────────────────────────────────────────────┤
│ Comments + CreateComment (commentLimit)      │
└──────────────────────────────────────────────┘
```

Details:

- `PostHeader` (`Components/PostHeader.jsx`): name click → `navigate('/user-page/' + post?._id)`
  — note the **post id** is passed, not the author's user id (§23, §38). Avatar falls back to
  `fakePost.userAvatar` when `post.user.photo` is missing or contains `"undefined"`. `createdAt`
  is sliced `(0, 10)` for display. `DropDown` (HeroUI) shows Edit / Delete when
  `post.user._id === userID` (Edit navigates to `/edit-post/:id`).
- `handlePostClick` navigates to `/post-details/${post?._id}` only for
  `from === 'feedPage' | 'userProfilePage'` (`Post.jsx:107–111`).
- `PostStatistics` shows `post?.likesCount ?? 0`, `post?.commentsCount ?? 0`, `post?.sharesCount ?? 0`
  — real API counts since Phase-1 (the `fakePost` counters are gone from the stats row; §16/§40).
- `CreateComment` receives `getPostDetails/getPosts/getUserPosts/from` props from `Post` but
  destructures only `postId` — those props are silently ignored (`CreateComment.jsx:22`).
- `Comments` is rendered below `CreateComment`, honoring `commentLimit`.

---

## 21 · Comments

**Create — `Components/CreateComment.jsx`:** HeroUI `Input` + `Button`; Enter (without
Shift) submits. Mutation `createComment(postId, { content: content.trim() })` (`:32,57`),
which builds **FormData** `content` and posts to `POST /posts/:id/comments` (Phase-1 — the old
top-level `POST /comments` JSON call is gone). `onSuccess` (`:33–44`): invalidates
`['postComments', postId]`, `['postDetails', postId]` and `['posts']`, delayed refetch of
`['userPosts']`, clear input, toast "Comment posted".

**List — `Components/Comments.jsx`:** comments are **no longer embedded in posts** — the
component fetches them itself via `useQuery(['postComments', postId], () => getPostComments(postId))`
(`:25–30`, `enabled: !!postId`), unwrapping `commentsData?.data?.data?.comments || []` (`:31`):

```js
comments.slice(0, commentLimit).reverse()   // newest-ish first, limited count
```

- Each row: `CommentHeader` (fallback `fakeCommentPhoto` when
  `comment.commentCreator.photo` is missing/`"undefined"`, `commentCreator.name`, content,
  `createdAt.slice(0, 10)`) + a `DropDown` (Edit/Delete) **only when
  `comment.commentCreator._id === userID`** (`:95–110`).
- `key={comment._id}` is used (Phase-1).
- Inline editing via `CommentEditBox` (textarea + Save/Cancel), toggled per comment by
  `editComment` state; `updateComment(postId, commentId, { content })` (`:57`).
- Delete goes through `DeleteCommentConfirmModal`; on success it invalidates
  `['postComments', postId]`, `['posts']` and `['postDetails', postId]`, refetches
  `['userPosts']` after 500 ms, and toasts "Comment deleted" (`:34–48`).
- Toasts: "Comment deleted"/"Comment updated"/"Comment posted" and generic failure messages.

**Counts and limits:**

- `commentLimit`: feed/user-profile use `1`; post-details uses
  `data?.data.post.commentsCount ?? 0` (Phase-1 — the old `.comments.length` was a hard crash
  because the current API never embeds comments, `PostDetailsPage.jsx:57`).
- The comment list renders inside the `Post` card on every page — there is no separate
  comments route.
- `fakeCommentPhoto` (the bundled `FakeProfileImage.png`) is the avatar fallback in
  `CommentHeader` (`:10–16`).

---

## 22 · Profile

**Route:** `/profile` → `ProfilePage.jsx` (guarded).

**Query:** `useQuery(['userDetails'], getUserDetails, { retry: 2, staleTime: 30000 })`
(`ProfilePage.jsx:24–32`).

**Layout (when data is loaded):**

```
┌────────────────────────────────────────────────┐
│ header card (bg-white):                        │
│   avatar img (click → ProfilePictureModal)     │
│   camera button (→ ChangeProfilePictureModal)  │
│   name / email                                 │
│ info rows: Date of Birth (dateOfBirth.slice(0,10)) │
│            Gender (capitalized)                │
│ Settings button (→ SettingsModal)              │
└────────────────────────────────────────────────┘
UserPosts(userID)   ← own posts list below the card
```

**Modals wired here:**

- `ProfilePictureModal` — full-size avatar preview.
- `ChangeProfilePictureModal` — avatar upload (FormData field `photo`, §24).
- `SettingsModal` — dark-mode toggle, Change Password (opens `ChangePasswordModal`),
  **Notifications row is a "Soon" placeholder**, footer "More settings coming soon...".
- The comment `// Direct upload flow removed; handled inside ChangeProfilePictureModal`
  (`ProfilePage.jsx:34`) records that upload logic lives in the modal.

**`Components/UserPosts.jsx`** — `useQuery(['userPosts', userID], () => getUserPosts(userID),
{ enabled: !!userID, ... })` (Phase-1 — the key now includes `userID` and the query is disabled
until an id exists, which also fixes direct-navigation where `GET /users//posts` would 404).
Renders `<Post key={post._id} ... commentLimit={1} from="userProfilePage" getUserPosts={refetch}/>`;
renders `''` when the query errors (`isError`). `userID` comes from `AuthContext`, and
`ProfilePage` **bootstraps it from `GET /users/profile-data`** when missing
(`ProfilePage.jsx:37–42`) so the list works on direct navigation.

**Dark-mode caveat:** the profile header card, info rows and settings modal hard-code light
styles (`bg-white`, `border-gray-100`, hover `bg-gray-50`) — they ignore dark mode (§26).

---

## 23 · User Page

**Route:** `/user-page/:id` → `UserPage.jsx` (guarded).

**Where the URL comes from:** `PostHeader` navigates with **`post?._id`**
(`PostHeader.jsx` → `/user-page/${post._id}`), i.e. the `:id` segment is a **post** id, even
though the page is styled as a user profile.

**Query:** `useQuery(['postDetails', id], () => postDetails(id))` — reuses the same key and
fetcher as `PostDetailsPage`, so navigating between the two pages for the same post serves
from cache. The user shown is `data?.data?.post?.user` (`UserPage.jsx:23`).

**Content:**

- Avatar (click → `ProfilePictureModal`), name, and a **hard-coded** bio
  ("Exploring tech & creativity — building ideas, learning, and connecting.",
  `:106–108`) and **hard-coded** join date ("Joined **January 15, 2023**", `:120`).
- No posts list, no follow button, no real user data beyond the post author.
- Error state passes a **plain Arabic string** to `ErrorMessage` (`<ErrorMessage error="حدث خطأ" .../>`,
  `:29`); `ErrorMessage` reads `error.message`, so this string is not actually displayed
  (§33, §38).
- If the author has no `photo`, the avatar `<img src={user?.photo}/>` renders broken (no
  fallback here, unlike PostHeader).

---

## 24 · Image Handling

| Concern | Implementation |
|---|---|
| Post images in cards | plain `<img src={post?.image}>` in a 16:9 aspect container (`Post.jsx`) |
| Full-size preview + download | `PostImageModal` — on open it fetches the image URL as a **blob** (`axios`), creates `URL.createObjectURL`, shows the image, and offers a download link (blob URL + `download` attribute) |
| Avatar fallback (posts/comments) | `post.user.photo` present → `<img>`; else bundled `FakeProfileImage.png` (`PostHeader` via `fakePost.userAvatar`, `CommentHeader` via `fakeCommentPhoto`) |
| Fake avatar asset | `FakeProfileImage.png` imported from `public/` in `Sidebar`, `Post.jsx` and `Comments` |
| Post create/edit images | file input (`accept="image/*"`), preview via `URL.createObjectURL`, sent as `FormData` field `image` |
| Avatar upload | `ChangeProfilePictureModal`: file picker → local preview → `UploadUserImage` with `FormData` field `photo` (no manual `Content-Type` — axios sets the multipart boundary, `UserDetailsServices.js:11–15`) |
| Profile picture preview | `ProfilePictureModal` (`ProfilePage`, `UserPage`) |

**Observations:**

- **No client-side validation** of file type/size anywhere; `accept="image/*"` is advisory
  and only present on some inputs (`EditPostPage.jsx:162`). A non-image file could be
  submitted.
- `URL.createObjectURL` results are not revoked after use (minor leak per preview/open).
- The avatar upload uses **PUT** and the multipart field name is **`photo`** — the backend
  contract the frontend was written against (see §39 for the live-backend mismatch).
- Post-image downloads happen through a same-origin-agnostic blob fetch; if the image is
  cross-origin without CORS, the blob fetch fails (no fallback shown).

---

## 25 · HeroUI Usage

HeroUI (`@heroui/react` 2.8.2) is the primary component library.

**Provider:** `HeroUIProvider` wraps the whole tree in `main.jsx:27`.

**Components actually used:**

| Component | Used in |
|---|---|
| `Button` | Navbar, LoginPage, RegisterPage, CreateComment |
| `Input` | LoginPage, RegisterPage, CreateComment |
| `Select` / `SelectItem` | RegisterPage (gender) |
| `Navbar`, `NavbarBrand`, `NavbarContent`, `NavbarItem`, `NavbarMenu`, `NavbarMenuToggle`, `NavbarMenuItem` | Navbar |
| `Dropdown`, `DropdownTrigger`, `DropdownMenu`, `DropdownItem` | DropDown (post/comment actions) |

**Not used:** HeroUI `Modal`, `Avatar`, `Card`, `Textarea`, etc. All modals in the app are
**hand-rolled** overlay `<div>`s (e.g. `DeletePostConfirmModal`, `SettingsModal`,
`ProfilePictureModal`, `LogoutConfirmModal`), not HeroUI `Modal`.

**Tailwind integration:** HeroUI v2 for Tailwind v4 is registered via `hero.js` +
`@plugin`/`@source` in `index.css` (§04). HeroUI styling is customized with the
`classNames` prop pointing at custom CSS classes defined in `index.css`:

```
Input  → classNames={{ input: 'custom-input', inputWrapper: 'custom-input-wrapper …' }}
Select → classNames={{ trigger: 'custom-select-trigger', listbox: 'custom-select-listbox', … }}
```

Those classes carry `!important` overrides for borders, focus rings, and invalid states
(§26). `AcmeLogo` is exported from `Navbar.jsx:9` but never rendered — the brand uses a
`fa-link` icon + "Linkup" text.

---

## 26 · Theming & Styling

Two mechanisms coexist:

1. **Inline styles from `themeColors`** (dominant) — surfaces, buttons, borders, text,
   background of layouts/pages/modals use `style={{ backgroundColor: themeColors.surface }}`
   etc. Colors are also used in **alpha-concatenated** form, e.g.
   `themeColors.primary + '20'`, `themeColors.primary + '10'`, `+ '02'`, `+ '03'` (hex + alpha)
   — a pattern that only works because all palette values are 6-digit hex.
2. **Tailwind utilities + global CSS** (`index.css`, ~523 lines).

**`src/index.css` contents:**

- Tailwind v4 setup: `@import`, `@plugin './hero.js'`, `@source` for HeroUI theme,
  `@custom-variant dark (&:is(.dark *))` (`:1–4`).
- `@layer base`: `h1` (text-xl font-bold), `button { cursor: pointer }`, a global
  `* { transition: background-color…, color…, border-color… }` (`:6–18`) — every element
  animates color/background changes (theme switch).
- Custom scrollbar (light + `.dark` variants) tinted with brand colors (`:21–49`).
- `floating-shape` keyframe animation and `glass-effect` backdrop blur (`:52–69`).
- **Input wrapper styling** — `custom-input-wrapper` (light + `.dark`), hover/focus-within
  states, `.is-invalid` variants, `!important` overrides (`:72–113`).
- **Select styling** — `custom-select-trigger`, `custom-select-listbox`, `custom-select-item`
  (light + `.dark`).
- **Dropdown items** — `custom-dropdown-item-danger` hover states.
- **Profile nav underline** — `profile-nav-button::after` animated underline (light + `.dark`)
  plus a pile of dead/legacy selectors (`profile-link-focus`, `profile-focus-line`) that
  target elements no longer present (§38).

**Dark-mode mechanics:**

- `ThemeContext` toggles `.dark` on `<body>` (§10).
- Tailwind `dark:` utilities and `.dark` CSS rules then apply.
- In practice most components use inline `themeColors` styles, so the `.dark` class mostly
  affects scrollbars, inputs, selects, dropdowns, and the navbar underline.

**Hard-coded light styling that ignores dark mode** (as-is): login/register cards
(`bg-white`, `border-gray-200`), `LoadingPage` and `NotFoundPage` (bg-white cards),
left `Sidebar` (`bg-white`), profile header card & info rows (`bg-white`/`border-gray-100`),
modals' inner surfaces (`bg-white`).

---

## 27 · Responsive Layout

Mobile-first Tailwind classes throughout.

**Page scaffold (`MainLayout.jsx:19–41`):**

```
max-w-[1600px] mx-auto px-4 sm:px-6 py-4
  logged in:  grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 xl:gap-8
                <Sidebar position="left"/>      hidden below lg (lg:col-span-3)
                <main class="lg:col-span-6"/>   Outlet
                <Sidebar position="right"/>     hidden below lg (lg:col-span-3)
  logged out: single centered column max-w-4xl, no sidebars
```

**Breakpoints used:** `sm` (640), `md` (768), `lg` (1024), `xl` (1280). Sidebars appear only
at `lg+`; the feed column spans 6 of 12 columns.

**Mobile-specific affordances:**

- Back buttons rendered only on mobile (`sm:hidden`) on PostDetailsPage, ProfilePage,
  UserPage, EditPostPage.
- Navbar: hamburger `NavbarMenuToggle` (visible `sm:hidden`), labels collapse
  (`hidden sm:inline` / `sm:hidden` "In/Out/Up"), and a mobile menu listing profile/logout or
  login/register (`Navbar.jsx`).
- Text/image sizes scale with `text-xs sm:text-sm sm:text-base`, `w-24 sm:w-28`, etc.
- Comments use `rtl:space-x-reverse` (partial RTL support).

---

## 28 · Toast Notifications

**Global `<Toaster/>`** (`App.jsx:86–120`):

- Position `top-right`, `reverseOrder: false`, default `duration: 2500`.
- Style from `themeColors`: `borderRadius: 16px`, surface/text colors, border
  `1px solid ${primary}20`, soft shadow. Success adds `borderLeft: 4px solid primary`;
  error adds `borderLeft: 4px solid secondary`; icon themes follow primary/secondary.

**All toast call sites (complete list):**

| File | Message |
|---|---|
| `RegisterPage.jsx:38,44` | success "Account created successfully!" (7 s) / error `error?.response?.data?.message \|\| 'Registration failed'` (7 s) |
| `EditPostPage.jsx:32,46,49` | "Failed to load the post" (then redirect `/`) / "Post updated" / "Failed to update post" |
| `CreatePost.jsx:53,56,63` | "Post created" / "Failed to create post" / "Write something or add a photo" |
| `CreateComment.jsx:43,46` | "Comment posted" / "Failed to post comment" |
| `Comments.jsx:45,47,68,72` | "Comment deleted" / "Failed to delete comment" / "Comment updated" / "Failed to update comment" |
| `Post.jsx:75,80` | "Post deleted" / "Failed to delete post" |
| `Navbar.jsx:46` | "Logged out" |
| `ChangeProfilePictureModal.jsx:25,27` | "Profile photo updated" / "Failed to update profile photo" |
| `PostBtns.jsx:26,28` | share result via local helper (3 s) — see §40 |

**Not using toasts:** LoginPage (inline error banner instead), ChangePasswordModal (inline
success panel instead), UserPage, FeedPage, NotFoundPage.

---

## 29 · Loading & Error States

**Loading primitives:**

- `LoadingPage` (`src/pages/LoadingPage.jsx`) — full-block spinner (double ring + pulse dot +
  bouncing dots + "Loading… / Please wait while we prepare your content"), on a white card.
- `LoadingSpinner` (`src/components/LoadingSpinner.jsx`) — reusable spinner with `size`
  (`sm|md|lg|xl`) and `text`/`showText` props; used for inline spinners.
- `FetchingIcon` (`src/components/FetchingIcon.jsx`) — a small "Updating" pill shown during
  background refetches (`isFetching && !isLoading`).

**Error primitive:** `ErrorMessage` (`src/components/ErrorMessage.jsx`) — themed error card
that renders `error?.response?.data?.message || error?.message` (Phase-1 — the server message
wins) and a Retry button wired to `refetch`.

**Per-page pattern (consistent):**

```
isLoading ? <LoadingPage/>
: isError  ? <ErrorMessage error refetch/>
:            content
+ (isFetching && !isLoading) && <FetchingIcon/>   // on FeedPage / PostDetailsPage / ProfilePage
```

**Mutation-level feedback:** submit buttons swap their label for an inline spinner and
"Logging in… / Creating… / Commenting… / Posting… / Changing…" text and are disabled while
pending (LoginPage, RegisterPage, CreateComment, EditPostPage, ChangePasswordModal).

**Gaps (as-is):** `UserPosts` returns `''` on error (silent); `UserPage` passes a plain
Arabic string into `ErrorMessage` so its message never shows; network failures mid-feed show
the `ErrorMessage` card. Login no longer falls in these gaps — the banner shows the real
server message (`loginErrorMessage || <static fallback>`, `LoginPage.jsx:269`).

---

## 30 · Utility Modules

`src/utils/queryUtils.js` is the only util module. All four exports manipulate the app-wide
`queryClient` imported from `App.jsx`.

| Export | Behavior |
|---|---|
| `invalidateAndRefetch({ invalidatePosts, invalidatePostDetails, invalidateUserDetails, invalidateUserPosts, getPosts, getPostDetails, getUserPosts, from, postId })` | Default-invalidates **all four** query keys, then calls the matching refetch fn by `from` (`'feedPage'`, `'PostDetailsPage'`, `'userProfilePage'`); `postId` optional for details |
| `invalidateAll()` | invalidates `['posts']`, `['postDetails']`, `['userDetails']`, `['userPosts']` |
| `invalidatePosts()` | invalidates `['posts']` |
| `invalidatePostDetails()` | invalidates `['postDetails']` |

**Usage (verified by search):** only `invalidateAndRefetch` is consumed — in `Post.jsx:24,77`
on post delete. `invalidateAll` / `invalidatePosts` / `invalidatePostDetails` are exported
but unused anywhere.

**Other "utility-like" patterns living in components:** `Post.jsx` defines `fakePost`; many
components re-implement the same spinner SVG inline (Login, Register, CreateComment,
EditPostPage, ChangePasswordModal) instead of using `LoadingSpinner`.

---

## 31 · User-Facing Data Flows

### Login → Feed

```
user submits email+password
 → RHF+zod validates
 → loginUser() POST /users/signin
 → token = data?.data?.token; if !isValidJwt(token) → error banner, stay on /login
 → else localStorage.token = token; isloggedIn=true   → redirect '/'
 → FeedPage mounts → getUserID() (cached localStorage.userID or GET /users/profile-data, try/catch)
 → useInfiniteQuery(['posts']) GET /posts?limit=50&page=1&sort=-createdAt
 → render CreatePost + Post cards (commentLimit=1) — ⚠️ see the empty-feed unwrap bug (§18/§39)
```

### Create post

```
fill body/choose image → createPost(FormData) POST /posts
 → invalidate ['posts']  → feed refetches
 → after 500ms refetch ['userPosts'] → profile list updates
 → toast "Post created"
```

### Delete post

```
DropDown ▸ Delete ▸ DeletePostConfirmModal ▸ deletePost(id) DELETE /posts/:id
 → invalidateAndRefetch({ from, getPosts, getPostDetails })  (invalidates all 4 keys)
 → if on details page: navigate '/'; if on profile: refetch userPosts
 → toast "Post deleted"
```

### Add a comment (feed)

```
CreateComment: createComment(postId, { content }) → FormData → POST /posts/:id/comments
 → invalidate ['postComments', postId], ['postDetails', postId], ['posts'] → feed refetches
 → after 500ms refetch ['userPosts']
 → toast "Comment posted"
```

### View a post's comments (details page)

```
navigate /post-details/:id → useQuery(['postDetails', id]) GET /posts/:id
 → <Post commentLimit={commentsCount ?? 0}> → Comments fetches GET /posts/:id/comments itself
```

### Change password

```
Settings ▸ Change Password → changeUserPassword({password, newPassword, confirmPassword}) PATCH
 → inline success → 3s later: clear token+userID, isloggedIn=false → /login
```

### Logout

```
Navbar ▸ Logout ▸ confirm ▸ remove token+userID, isloggedIn=false → /login, toast
```

---

## 32 · Query Invalidation & Refetch

**Mutation → invalidation matrix (as implemented):**

| Mutation | Invalidates | Also refetches |
|---|---|---|
| `createPost` | `['posts']` (CreatePost.jsx:51) | `['userPosts']` after 500 ms |
| `deletePost` | all 4 keys via `invalidateAndRefetch` (Post.jsx:70) | `getPosts`/`getPostDetails` per `from`; `getUserPosts(userID)` on profile page |
| `updatePost` | **none** | — navigates to `/post-details/:id` and relies on that query's refetch |
| `createComment` | `['postComments', postId]`, `['postDetails', postId]`, `['posts']` (CreateComment.jsx:35–37) | `['userPosts']` after 500 ms |
| `updateComment` | `['postComments', postId]`, `['posts']`, `['postDetails', postId]` (Comments.jsx:62–64) | — |
| `deleteComment` | `['postComments', postId]`, `['posts']`, `['postDetails', postId]` (Comments.jsx:37–39) | `['userPosts']` after 500 ms |
| `UploadUserImage` | `['userDetails']` (ChangeProfilePictureModal onSuccess) | — |
| `changeUserPassword` | — (forces logout instead) | — |
| `login`/`register` | — | — |

**Patterns & inconsistencies:**

- Three different refetch styles coexist: (a) `queryClient.invalidateQueries(['key'])`,
  (b) `queryClient.refetchQueries({ queryKey: ['key'] })` after a 500 ms `setTimeout`, and
  (c) calling a `refetch` function passed down via props (`getPosts`, `getPostDetails`,
  `getUserPosts`).
- `updatePost` and `changeUserPassword` invalidate nothing — correctness depends on route
  navigation and cache staleness.
- `invalidateQueries(['posts'])` on the feed's infinite query causes TanStack to refetch the
  cached pages (page 1 is active; deeper pages refetch as they come into view).
- The 500 ms delays (CreatePost, CreateComment, Comments) exist to avoid refetching the
  user-posts list while the mutation's own `['posts']` refetch is still in flight.
- `queryUtils.invalidateAndRefetch` invalidates **all** keys by default even when the caller
  only cares about one — a broad-but-simple approach.

---

## 33 · Error Handling Strategy

There is **no centralized error handling**: no axios interceptor, no Query error boundary,
no global 401 hook. Errors are dealt with at three levels:

1. **Query errors** — each page checks `isError` and renders `<ErrorMessage error refetch/>`;
   TanStack default retry (3, or `retry: 2` where configured) gives transient failures
   several attempts.
2. **Mutation errors** — `onError` callbacks in `useMutation`. Behavior varies by caller:
   - RegisterPage: toasts `error?.response?.data?.message || 'Registration failed'` (Phase-1 —
     reads `.message`, not `.error`, matching the live error envelope).
   - ChangePasswordModal: stores `error.response?.data?.message` in a `submit` error panel.
   - LoginPage: stores `error.response?.data?.message || error.message` in `loginErrorMessage`,
     and the banner renders it (static text is only a fallback) — Phase-1.
   - Posts/comments/photo: fixed generic toasts ("Failed to …").
3. **Unhandled paths** — `UserPosts` silently returns `''` on error; `UserPage`'s error text
   is a plain string that `ErrorMessage` never renders; network failures mid-feed show the
   `ErrorMessage` card. (`EditPostPage`'s load failure is now handled: toast + redirect, §19.)

**Error-message parsing is inconsistent** — the same backend error object is read as
`.message` (login, password), `.error` (register), or ignored (comments/posts). Because the
live backend (§39) returns different shapes, these reads can produce `undefined` fallbacks.

**No global "session expired" UX** — a 401 on any query just leaves that section in the
error state while the rest of the (stale) UI keeps rendering (§15).

---

## 34 · Configuration & Environment

- **No `.env` files, no `import.meta.env` usage, no Vite env variables.** The API base URL is
  hard-coded in four service files: `https://route-posts.routemisr.com/`
  (`AuthService.js:3`, `FeedServices.js:2`, `CommentServices.js:2`,
  `UserDetailsServices.js:2`).
- **README vs code conflict (resolved):** the README previously documented the base URL as
  `https://linked-posts.routemisr.com/` (`README.md:136`); it now matches the code —
  `https://route-posts.routemisr.com/`.
- No runtime feature flags; behavior differences come only from `localStorage` values
  (`token`, `userID`, `darkMode`).
- Vite config has no proxy; the browser calls the third-party API directly, so CORS must be
  satisfied server-side.

---

## 35 · Deployment

- **Static SPA**: `vite build` produces `dist/`. Deployment config is host-specific:
  - **Vercel** (primary): `vercel.json` pins the Vite preset
    (`framework: "vite"`, `buildCommand: "npm run build"`, `outputDirectory: "dist"`) and adds
    the SPA fallback rewrite `{"source": "/(.*)", "destination": "/index.html"}` so
    `createBrowserRouter` deep links (e.g. `/post-details/:id`) work on refresh.
  - **Netlify**: `public/_redirects` (`/* /index.html 200`) provides the same fallback and is
    kept for compatibility; harmless on Vercel.
- `package.json` `engines.node` is `>=20.19.0` (Vite 7 requirement; Vercel honors it).
- `README.md` has a "Deployment (Vercel)" section with import steps.

---

## 36 · Security Observations

Descriptive findings from the code (nothing was changed):

- **Token in `localStorage`** — readable by any XSS-injected script on the page; there is no
  HttpOnly/cookie-based session. The token is sent as `Authorization: Bearer` over HTTPS via
  `getAuthHeaders()`. Standard trade-off for a SPA; worth noting as-is. Mitigations in place:
  the token is **validated as a JWT** before use (`isValidJwt`), and a malformed/garbage value
  is **cleared automatically** (startup in `AuthContext` + inside `getAuthHeaders`), so the
  literal `"undefined"` phantom-session class of bug is gone (§9/§15).
- **No 401/session-expiry handling** — expired tokens leave stale UI; there is no
  auto-logout or redirect-to-login path from API errors (§15, §33).
- **Hard-coded API URL** — the backend topology is baked into the bundle; combined with no
  `.env` indirection, there is no environment separation (§34).
- **No content sanitization of user text** — post/comment bodies are rendered through React
  text nodes (React's default escaping applies); the app never uses `dangerouslySetInnerHTML`
  for user content.
- **File uploads unvalidated client-side** — no type/size checks before sending `FormData`
  (only advisory `accept="image/*"`); the server must enforce limits.
- **No rate limiting / CAPTCHA** on login/register client-side; `signup`/`signin` rely purely
  on server controls.
- **No CSRF tokens** — irrelevant for the custom-header token scheme in practice (no cookies
  are used), but also no protection beyond the bearer header.
- **DevTools shipped in production** — `<ReactQueryDevtools/>` is mounted unconditionally,
  exposing query data in production builds (§37).
- The password policy (min 8, upper/lower/digit/special) is enforced only client-side; the
  server policy is unknown.

---

## 37 · Performance Notes

- **Single bundle, no code splitting** — all routes and components are statically imported in
  `App.jsx`; Vite default build produces one JS chunk (plus vendor), and `ReactQueryDevtools`
  code ships in production.
- **Eager feed prefetch** — the infinite-scroll observer uses `rootMargin: '10000px'`, i.e.
  it starts loading the next page while the sentinel is still far below the fold; combined
  with `limit: 50` this can issue network requests earlier than needed.
- **Staleness tuning** — feed and post-details use `staleTime: 15000`; user details
  `staleTime: 30000`; `refetchOnWindowFocus` is disabled for all queries (the default would
  have refetched on every tab focus).
- **Context re-renders** — `AuthContext`/`ThemeContext` values are recreated each render and
  not memoized; every consumer re-renders whenever any provider state changes (e.g. toggling
  dark mode re-renders the whole app tree; ThemeContext holds 7 color states that all change
  together on toggle).
- **Global CSS transition on `*`** (`index.css:16–18`) — every element animates
  background/color/border changes; on long feeds this triggers a broad repaint during theme
  switches or hover states.
- **Duplicate inline spinners** — five components hand-copy the same SVG spinner instead of
  sharing `LoadingSpinner`.
- **`URL.createObjectURL` never revoked** (EditPostPage previews, PostImageModal, avatar
  preview) — object URLs accumulate until page unload.
- **Feed rendering** — every render maps all loaded pages' posts; keys are `post?._id`
  (feed, UserPosts since Phase-1) but `comment._id` for comments (since Phase-1), limiting
  reconciliation quality only where older `key={index}` remains (none currently).
- **No lazy images** — post images use plain `<img>` without `loading="lazy"`.
- **Dead weight** — empty `App.css` import and unused deps (`framer-motion` not imported;
  unused `react-infinite-scroll-component`, `@shadcn/ui`) confuse tooling.

---

## 38 · Code Smells

Compiled list of anomalies found while reading the code. Status reflects the 2026-08-10
fix rounds (Phase-1 + auth hardening). Items kept for the record even when fixed:

1. **Misspelled filenames/exports** — `ProtactedRoute.jsx`, `LoginSchama.js`, `Linkuo-logo.svg`
   (brand is "Linkup"). [open]
2. **Rules-of-Hooks violation** — `useParams()` called conditionally inside `if (getPostDetails)`
   in the old `Post.jsx:66–69`. **[FIXED — Phase-1 removed the conditional hook and the
   `postId` prop]** (§20). [resolved]
3. **Dead `/feed` refetch effect** — old `FeedPage.jsx:72–76` checked a path that never
   exists. **[FIXED — Phase-1 retargeted it to `'/'`, the real home route]** (§18). [resolved]
4. **Wrong id in URL** — `PostHeader` navigates to `/user-page/${post?._id}` (post id as the
   user-page param; `UserPage` then fetches `posts/:id`). [open]
5. **`key` mismatches** — `Comments` previously used `key={index}`. **[FIXED — Phase-1 switched
   to `comment._id`]**. `UserPosts` previously used `key={post.id}`. **[FIXED — now `post._id`]** (§21/§22). [resolved]
6. **Response-shape drift for `getUserDetails()`** — old `FeedPage.jsx:44` read
   `userID.data.user._id` while `ProfilePage.jsx:80` read `data?.data.user.name`.
   **[FIXED — FeedPage now reads `res?.data?.data?.user?._id`, matching the envelope]** (§9/§16). [resolved]
7. **`EditPostPage` loads data via `useMutation`** and gates rendering on a `loading` boolean
   instead of `useQuery` (`EditPostPage.jsx:21–35`). [open]
8. **Manual RHF↔Select bridging** — RegisterPage synthesizes a fake change event
   (`RegisterPage.jsx:264–271`). [open]
9. **Upward imports** — `CreatePost`, `CreateComment`, `Comments`, and `queryUtils` import
   `queryClient` from `App.jsx` (child modules importing the root component module). [open]
10. **Dead exports** — `AcmeLogo` (`Navbar.jsx:9`), `updateTheme` (ThemeContext), and
    `invalidateAll`/`invalidatePosts`/`invalidatePostDetails` (queryUtils) are never used. [open]
11. **Ignored props** — `Post` passes `getPostDetails/getPosts/getUserPosts/from` to
    `CreateComment`, which only reads `postId` (`CreateComment.jsx:22`). [open]
12. **Login error swallowed** — old `LoginPage.jsx:66–73,250–261` captured the server message
    but showed a hard-coded banner. **[FIXED — the banner now renders
    `loginErrorMessage || <static fallback>`]** (§14/§29/§33). [resolved]
13. **`localStorage` `JSON.parse` without try/catch** (`ThemeContext.jsx:38`). [open]
14. **Hard-coded user data** — `UserPage` bio and "Joined January 15, 2023"
    (`UserPage.jsx:106–120`). [open]
15. **Legacy CSS** — `index.css` keeps `profile-link-focus` / `profile-focus-line` selectors
    for elements that no longer exist, alongside ~100 lines of `!important` overrides. [open]
16. **Light-styling hard-coded in components** (`bg-white`, `border-gray-100`) breaking dark
    mode in Login/Register/Loading/404/Sidebar-left/Profile (§26). [open]
17. **Mixed-language comments** — English and Egyptian-Arabic inline comments (e.g.
    `Comments.jsx:50`), plus an Arabic comment inside `RegisterSchema.js`. [open]
18. **Duplicate password regex** in both schema files and `ChangePasswordModal.jsx:79`. [open]
19. **`fakePost` object** — the `likes`/`shares` counters are no longer used (PostStatistics
    reads real `likesCount`/`commentsCount`/`sharesCount` since Phase-1); only
    `fakePost.userAvatar` survives as the avatar fallback (§16/§20). [mostly resolved]
20. **Duplicate spinner markup** across five components. [open]
21. **Feed unwraps the wrong depth on render** — `FeedPage.jsx:107` mapped `page?.data?.posts`
    (i.e. `response.data.posts`) while the live envelope has the array at
    `response.data.data.posts` (the pagination code at `:32` reads it correctly). **Fixed
    2026-08-10** to `page?.data?.data?.posts`; the same one-level-short unwrap was fixed in
    ProfilePage / UserPosts / PostDetailsPage / UserPage / EditPostPage. Verified live:
    feed renders 50 posts, profile renders fully, zero uncaught exceptions. [fixed]

---

## 39 · API Contract Discrepancies

The frontend was written against one API version; the server reachable at the hard-coded
URL responds like a different version. Findings below are from **live probes during
reverse-engineering** (2026-08-10) and from reading the code — they may change at any time.

**Live probe results (initial + verified rounds):**

| Request | Result |
|---|---|
| `GET https://route-posts.routemisr.com/signin` | **404** — the auth path the frontend originally called (`/signin`) does not exist |
| `GET https://route-posts.routemisr.com/users/profile-data` | **401** without token (endpoint exists; token required) |
| `GET https://route-posts.routemisr.com/posts` | **401** without token (endpoint exists; token required) |
| `POST /users/signin` (fresh login) | **200** → `data: { token, tokenType, expiresIn, user }` (live account) |
| `GET /users/profile-data` with Bearer token | **200** → `data.user` (envelope shape confirmed) |
| `GET /posts?limit=50&page=1&sort=-createdAt` with Bearer | **200** → `data.posts` (50 posts, newest-first, **no `meta`**) |
| `GET /posts?limit=2` page 1 / page 2 / deep page | distinct pages; deep page empty (length heuristic valid) |
| `GET /posts/:id/comments` | live shape `data.comments[]` (nested `/posts/:id/comments` paths) |

**Contract mismatches — RESOLVED by Phase-1 + auth hardening (RE §5.2/§5.7):**

| Area | As-found | Live truth | Status |
|---|---|---|---|
| Auth endpoints | `POST /signup`, `POST /signin` (old AuthService) | `POST /users/signup`, `POST /users/signin` | ✅ fixed in code |
| Token transport | custom header named `token` | `Authorization: Bearer <token>` (anything else → `401 "token not provided"` / `jwt malformed`) | ✅ fixed (`getAuthHeaders`) |
| Phantom session | `localStorage.token = "undefined"` → app "logged in", every call 401 | — | ✅ fixed (`isValidJwt` + startup self-heal) |
| Registration | `{ name, email, … }` (no username) | `username` required by signup | ✅ fixed (schema + form) |
| Error envelope | code read `error.response.data.error` | errors carry `data.message` | ✅ fixed (RegisterPage, ErrorMessage, LoginPage) |
| Comments | top-level `POST/DELETE/PUT /comments...` with JSON body | nested `/posts/:id/comments[/:cid]`, **multipart FormData**, plus `GET /posts/:id/comments` | ✅ fixed (CommentServices + components) |
| `userID` bootstrap | `userID.data.user._id` read | profile-data envelope is `data.data.user` | ✅ fixed (FeedPage) |
| Post stats | `fakePost` zeros, `post.comments.length` | `data.post` carries `likesCount/commentsCount/sharesCount`; comments fetched separately | ✅ fixed (PostStatistics, PostDetailsPage, Comments) |
| Login feedback | static banner hid server message | — | ✅ fixed (real message shown) |
| Feed crash | `lastPage.data.posts.length` on an envelope with no `meta` crashed | — | ✅ fixed (`data.data.posts` + `\|\| []`) |

**Contract mismatches — REMAINING (documented, not fixed — out of scope):**

| Area | Frontend | Live behavior |
|---|---|---|
| **Feed render unwrap** | `FeedPage.jsx:107` maps `page?.data?.posts` | envelope has the array at `response.data.data.posts` → **successful feed renders zero posts** (pagination already reads the right depth; §18/§21) |
| Avatar fallback | `PostHeader`/`CommentHeader` use the bundled `FakeProfileImage.png` when `photo` is falsy **or the string `"undefined"`** | the live API returns `photo: "undefined"` for users without an avatar — the string check was the actual fix |
| PostDetails comments | `commentLimit = data?.data.post.commentsCount ?? 0` | `commentsCount` exists; if it were ever missing, `0` hides all comments (defensive, unlikely) |
| User page | `/user-page/:id` receives a **post** id from `PostHeader` | `UserPage` fetches `posts/:id` — the page shows the wrong user for any post that isn't the author's first (§38) |

**README vs. code vs. reality:**

- README base URL `https://linked-posts.routemisr.com/` (`README.md:136`) ≠ code
  `https://route-posts.routemisr.com/` (§34).
- README claims "5 pre-built color schemes with real-time switching" (`README.md:23`) and
  "Framer Motion powered transitions" (`README.md:27`) — the code has only light/dark red
  palettes and no `motion` imports (§10, §02).
- As of the probe date the **core auth round-trip works**: fresh login → feed data returns
  200 with 50 posts, profile-data returns `data.user`, and comment reads/writes use the
  nested multipart contract (RE §5.7). The remaining user-visible breakage is the feed
  render unwrap above.

---

## 40 · Roadmap Indicators & Stubbed Features

UI/UX surface that is decorative or explicitly marked as not-yet-implemented:

| Feature | Where | Reality |
|---|---|---|
| Like button | `PostBtns` `handleLike` | Local color/animation toggle only — **no API call**, count never changes |
| Share button | `PostBtns` `handleShare` | Copies the current post URL to the clipboard via `navigator.clipboard` + toast (local only) |
| Like/shares counters | `PostStatistics` | Real `post?.likesCount ?? 0` / `commentsCount` / `sharesCount` since Phase-1 (the old `fakePost = { likes: 0, shares: 0 }` stats row is gone, §16/§20) |
| Left sidebar | `Sidebar position="left"` | Hard-coded sections: Quick Actions, Stories, Online Friends (fake data, no routes/API) |
| Right sidebar | `Sidebar position="right"` | Hard-coded Trending + Suggested Friends (fake data) |
| Notifications settings | `SettingsModal` | "Soon" badge placeholder; no notification feature exists |
| Settings footer | `SettingsModal` | "More settings coming soon..." |
| Theme picker | `ThemeContext.updateTheme` | Exposed API, zero consumers — future multi-scheme picker never wired |
| User page bio/join date | `UserPage` | Hard-coded strings ("Exploring tech & creativity…", "January 15, 2023") |
| Infinite scroll | `FeedPage` | Custom `IntersectionObserver` (the installed `react-infinite-scroll-component` is unused) |
| shadcn | — | `@shadcn/ui` installed, no shadcn components |
| Profile route note | `ProfilePage.jsx:34` comment | "Direct upload flow removed; handled inside ChangeProfilePictureModal" — records a refactor |
| `.dark` cleanup | `index.css` | Dead legacy selectors (`profile-link-focus`, `profile-focus-line`) remain |

---

## Appendix A · File Index

| File | Role |
|---|---|
| `index.html` / `main.jsx` / `App.jsx` / `App.css`(empty) / `hero.js` / `index.css` | SPA shell, providers, router, Tailwind/HeroUI wiring |
| `Contexts/AuthContext.jsx` | auth state (isloggedIn validated via `isValidJwt` + startup self-heal, userID, profilePageIsOpen) |
| `Contexts/ThemeContext.jsx` | light/dark palettes, toggleDarkMode, updateTheme, body.dark |
| `Layout/AuthLayout.jsx` | decorative shell for login/register |
| `Layout/MainLayout.jsx` | navbar + responsive 12-col grid + sidebars |
| `ProtectedRoutes/ProtactedRoute.jsx` / `ProtectedAuthRoute.jsx` | auth guards |
| `Pages/LoginPage.jsx` / `RegisterPage.jsx` | auth forms (RHF + zod + HeroUI; JWT-validated login, real server error) |
| `Pages/FeedPage.jsx` | infinite feed + userID bootstrap (⚠️ render unwrap, §18/§39) |
| `Pages/PostDetailsPage.jsx` | single post + full comments |
| `Pages/ProfilePage.jsx` | profile card + modals + user posts (+ userID bootstrap) |
| `Pages/EditPostPage.jsx` | post edit form (load-failure toast + redirect) |
| `Pages/UserPage.jsx` | post-author card |
| `Pages/LoadingPage.jsx` / `NotFoundPage.jsx` | full-block spinner / 404 |
| `Schema/LoginSchama.js` / `RegisterSchema.js` | zod validation (register adds `username`) |
| `Services/authHeaders.js` | `getStoredToken` / `isValidJwt` / `clearStoredAuth` / `getAuthHeaders` — single source of truth for the `Authorization: Bearer` header (§12/§15) |
| `Services/AuthService.js` / `FeedServices.js` / `CommentServices.js` / `UserDetailsServices.js` | axios calls (§13) |
| `Utils/queryUtils.js` | query invalidation helpers |
| `Components/Navbar.jsx` | top nav, mobile menu, logout |
| `Components/Sidebar.jsx` | fake left/right panels |
| `Components/Post.jsx` + `PostHeader/PostBtns/PostStatistics/PostImageModal` | post card suite |
| `Components/CreatePost.jsx` | composer |
| `Components/Comments.jsx` + `CommentHeader/CommentEditBox/CreateComment` | comments suite |
| `Components/DropDown.jsx` | HeroUI edit/delete menu (post or comment) |
| `Components/ErrorMessage.jsx` / `FetchingIcon.jsx` / `LoadingSpinner.jsx` | feedback primitives |
| `Components/*ConfirmModal.jsx` (DeletePost/DeleteComment/Logout) | hand-rolled confirm modals |
| `Components/ProfilePictureModal.jsx` / `ChangeProfilePictureModal.jsx` / `SettingsModal.jsx` / `ChangePasswordModal.jsx` | profile + settings modals |
| `public/_redirects` | Netlify SPA fallback |
| `public/FakeProfileImage.png` / `Linkuo-logo.svg` | fallback avatar / logo asset |

---

*End of document. All statements derive from the source tree at the snapshot date; live
backend observations are flagged as such and may be outdated.*

