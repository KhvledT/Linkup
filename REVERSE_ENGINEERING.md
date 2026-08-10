# Linkup — Complete System Reverse-Engineering & Architecture Documentation

> **Purpose.** End-to-end reverse-engineered documentation of the **Linkup** social-media system:
> the React SPA in this repository **plus** the remote **Route-Posts REST API** it consumes.
> This document is the authoritative reference for how the two halves connect, where they
> currently disagree, and what the backend is capable of.
>
> - **Snapshot date:** 2026-08-10 · **Root:** `d:\Linkedin\social media app`
> - **Method:** every frontend source file read in full (52 `src/` files + config + `public/`);
>   the backend was **live-probed with real HTTP requests** during this session. All response
>   shapes in Part II are captured from the live API, not guessed.
> - **Scope note:** primarily documentation. The Part I/III descriptions of the frontend were
>   first captured as-found, then **Phase-1 + auth-hardening fixes (documented in §5.2/§5.7)
>   were applied on 2026-08-10**; Part III and §4 now describe the **post-fix** tree, and §5.8
>   records the residual issues found when the docs were reconciled afterwards.
> - **Authoritative sources:** Postman collection for Route-Posts
>   (`route-posts.routemisr.com`), the official API docs, and live probe results quoted
>   verbatim in this file.

---

## Table of Contents

| Part | Content |
|---|---|
| I | System Overview & Technology Stack |
| II | Backend API — Reverse-Engineered Contract (conventions, endpoints, data models) |
| III | Frontend Architecture (entry, routing, state, services, pages, components) |
| IV | Frontend ↔ API Alignment Matrix |
| V | Breakage Root-Cause, Fix Map, & Phase-2 Capability Map |

---

# Part I · System Overview & Technology Stack

## 1.1 Product

**Linkup** is a LinkedIn-style social network SPA. Users register/login, browse an
infinite-scroll post feed, create/edit/delete posts (text + image), comment on posts, manage a
profile (avatar upload, change password, dark mode), and view a lightweight "user page".

The repository is **frontend-only**. All server state lives in the remote Route-Posts API at
`https://route-posts.routemisr.com/`. There is no backend code, no database, and no build-time
environment configuration in the repo; the base URL is hard-coded in four service modules.

## 1.2 Repository layout

```
d:\Linkedin\social media app\
├── index.html                  SPA shell (title "Linkup", favicon public/Linkuo-logo.svg)
├── vite.config.js              Vite 7 + React plugin + Tailwind v4 plugin
├── package.json                dependencies & scripts
├── eslint.config.js            ESLint 9 flat config
├── README.md                   project README (partially stale, see §5.5)
├── ARCHITECTURE.md             existing frontend deep-dive (40 sections, 1504 lines)
├── REVERSE_ENGINEERING.md      this document
├── public/
│   ├── FakeProfileImage.png    bundled fallback avatar
│   ├── Linkuo-logo.svg         logo/favicon (note: "Linkuo" spelling)
│   └── _redirects              Netlify SPA fallback:  /*  /index.html  200
└── src/
    ├── main.jsx                React root, provider nesting
    ├── App.jsx                 queryClient + router + Toaster
    ├── App.css                 empty
    ├── index.css               Tailwind 4 + HeroUI plugin + custom classes
    ├── hero.js                 HeroUI Tailwind plugin export
    ├── Contexts/               AuthContext.jsx, ThemeContext.jsx
    ├── Layout/                 AuthLayout.jsx, MainLayout.jsx
    ├── ProtectedRoutes/        ProtactedRoute.jsx, ProtectedAuthRoute.jsx
    ├── pages/                  FeedPage, PostDetailsPage, ProfilePage, EditPostPage,
    │                           UserPage, LoginPage, RegisterPage, NotFoundPage, LoadingPage
    ├── components/             Post, PostHeader, PostBtns, PostStatistics, PostImageModal,
    │                           Comments, CommentHeader, CommentEditBox, CreateComment,
    │                           CreatePost, UserPosts, Navbar, Sidebar, DropDown,
    │                           SettingsModal, ChangePasswordModal, ChangeProfilePictureModal,
    │                           ProfilePictureModal, LogoutConfirmModal, DeletePostConfirmModal,
    │                           DeleteCommentConfirmModal, ErrorMessage, FetchingIcon, LoadingSpinner
    ├── Services/               AuthService.js, FeedServices.js, CommentServices.js,
    │                           UserDetailsServices.js
    ├── schema/                 LoginSchama.js, RegisterSchema.js   (note the "Schama" typo)
    └── utils/                  queryUtils.js
```

## 1.3 Technology stack (from package.json — all installed)

| Layer | Library | Version |
|---|---|---|
| UI framework | React / react-dom | 19.1.x |
| Build tool | Vite (+ @vitejs/plugin-react, @tailwindcss/vite) | 7.0.x |
| Routing | react-router-dom (`createBrowserRouter`) | 7.7.x |
| Server state | @tanstack/react-query + devtools | 5.85.x |
| HTTP client | axios | 1.11.x |
| Forms / validation | react-hook-form + @hookform/resolvers + zod | 7.62 / 5.2 / 4.0 |
| UI kit | @heroui/react (+ hero.js Tailwind plugin) | 2.8.2 |
| Styling | tailwindcss (v4) | 4.1.x |
| Icons | @fortawesome/fontawesome-free | 7.0.x |
| Toasts | react-hot-toast | 2.6.x |
| Installed but unused | framer-motion, react-infinite-scroll-component, @shadcn/ui | — |

Scripts: `npm run dev` (vite), `npm run build` (vite build), `npm run lint` (eslint), `npm run preview`.

## 1.4 Key architectural facts (frontend)

- SPA shell chain: `index.html` → `src/main.jsx` → `src/App.jsx`.
- Provider nesting in `main.jsx`: `StrictMode > HeroUIProvider > ThemeContextProvider > AuthContextProvider > App`.
- `App.jsx` exports a singleton `queryClient`, defines the router (two route trees, §3.3), and renders a
  theme-aware `Toaster`.
- All API access goes through 4 axios service modules plus the shared
  `Services/authHeaders.js`; every authenticated call sends `Authorization: Bearer <token>`
  via `getAuthHeaders()`. (As-found state was a custom `token` header read inline from
  `localStorage` — one of the primary breakages, fixed in the auth-hardening round, §4/§5.2.)
- Global state: `AuthContext` (isloggedIn, userID, profilePageIsOpen) and `ThemeContext` (light/dark
  palettes, toggleDarkMode, updateTheme).

---

# Part II · Backend API — Reverse-Engineered Contract

> All shapes below were **captured from live calls** on 2026-08-10 against
> `https://route-posts.routemisr.com/` using a throwaway account (see §5.6).

## 2.1 Conventions

### Base URL
```
https://route-posts.routemisr.com/
```
(The README's `https://linked-posts.routemisr.com/` is stale — the live host is `route-posts.routemisr.com`.)

### Success envelope
Every 2xx response has the shape:
```json
{ "success": true, "message": "<human message>", "data": { ... }, "meta": { ... } }
```
- `data` is always present for 2xx (may be `{}` for deletes).
- `meta` is optional — it carries pagination/feed metadata. Signup/signin have **no `meta`**.

### Error envelope
```json
{ "success": false, "message": "<human message>", "errors": "<message or field errors>" }
```
Observed messages: `"token not provided"`, `"invalid token .. login again"`,
`"route not found"`, `"Expected property name or '}' in JSON at position 1"` (body parse failure).

### Authentication — Bearer token (verified)
- Protected routes require `Authorization: Bearer <token>`.
- Sending no token, or a differently-named header (e.g. the frontend's `token`), yields
  `401 {"success":false,"message":"token not provided"}`.
- Official docs: *save `data.token` and send it as `Authorization: Bearer <token>`*.
- JWT payload (decoded from a live token):
  `{ "user": "<userId>", "iat": <sec>, "exp": <sec>, "aud": "linked-posts-client", "iss": "linked-posts-api" }`.
- Expiry `expiresIn: "7d"`; responses return `token` + `tokenType: "Bearer"`.

### Request bodies
- JSON (`Content-Type: application/json`) for: signup, signin, change-password, follow, notifications read.
- **multipart/form-data for everything file-bearing AND for posts/comments writes**, even when
  text-only: `POST/PUT /posts` (fields `body`, `image`), comment/reply writes (fields `content`, `image`),
  `PUT /users/upload-photo` (field `photo`).

### Pagination
Offset pagination via query params `page` + `limit`; metadata in `meta.pagination`:
```json
{ "currentPage": 1, "limit": 2, "total": 3404, "numberOfPages": 1702, "nextPage": 2 }
```
- `nextPage` is `null`/absent on the last page.
- The feed also supports cursor pagination (`cursor` + `limit`) reported as
  `meta.feedMode: "cursor"`; page mode reports `meta.feedMode: "page"`.
- Observed defaults: `/posts` honors `limit`; `GET /users/:id/posts` defaults to 40;
  `GET /posts/:id/likes` defaults to 20.

### Identifiers & media
- Most resources expose both `_id` and a duplicated `id`. The signup/profile `data.user` exposes
  only `_id`.
- Images are served from Cloudflare R2:
  `https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/...` and `.../linkedPosts/...`.
- Uploads are converted to `.webp` and stored under `linked-posts/`; new users get a default photo
  `.../linkedPosts/default-profile.png`.

## 2.2 Endpoint catalog — Auth

### `POST /users/signup`  (public, JSON)
Body (all required): `name`, `username` (**new/required**), `email`, `dateOfBirth` (accepts `YYYY-MM-DD`),
`gender` (`male`|`female`), `password`, `rePassword`.

Live response (201):
```json
{
  "success": true, "message": "account created",
  "data": {
    "token": "<jwt>", "tokenType": "Bearer", "expiresIn": "7d",
    "user": {
      "_id": "6a790c078ebe92c2c01f6b0b", "name": "Linkup Test User",
      "username": "linkuptest0810", "email": "linkuptest0810@gmail.com",
      "photo": "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png",
      "cover": ""
    }
  }
}
```
No `meta`. The JWT has a 7-day expiry. Note: register response does **not** include
`dateOfBirth`/`gender` (those appear in profile-data).

### `POST /users/signin`  (public, JSON)
Body: `{ "login": "<username or email>", "password": "<p>" }` — verified working with **both**
`email` field (`{email, password}`) and `login` field (`{login, password}`).

Live response (200): `message: "signed in successfully"`, same `data` shape as signup
(`data.token`, `data.tokenType`, `data.expiresIn`, `data.user{_id,name,username,email,photo,cover}`).

### `PATCH /users/change-password`  (protected, JSON)
Body: `{ "password": "<current>", "newPassword": "<new>" }`.

Live response (200):
```json
{
  "success": true, "message": "password changed successfully",
  "data": { "token": "<refreshed jwt>", "tokenType": "Bearer", "expiresIn": "7d" }
}
```
A **fresh token is issued**; the old password is invalidated. No user object returned.

### `PUT /users/upload-photo`  (protected, multipart/form-data)
Field: `photo` (image file).

Live response (200):
```json
{
  "success": true, "message": "photo uploaded successfully",
  "data": {
    "photo": "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/<ts>-<uuid>-probe.webp",
    "postId": "<id of auto-created 'updated profile picture' post>"
  }
}
```
Side effect: the API **auto-creates a public post** announcing the photo change and returns its `postId`.

## 2.3 Endpoint catalog — Users & Profiles

### `GET /users/profile-data`  (protected)
Live response (200):
```json
{
  "success": true, "message": "success",
  "data": {
    "user": {
      "_id": "6a790c078ebe92c2c01f6b0b", "name": "Linkup Test User",
      "username": "linkuptest0810", "email": "linkuptest0810@gmail.com",
      "dateOfBirth": "1995-01-01T00:00:00.000Z", "gender": "male",
      "photo": "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png",
      "cover": "",
      "bookmarks": [], "followers": [], "following": [],
      "createdAt": "2026-08-09T23:23:51.016Z",
      "followersCount": 0, "followingCount": 0, "bookmarksCount": 0,
      "id": "6a790c078ebe92c2c01f6b0b"
    }
  }
}
```
`dateOfBirth` is an ISO datetime (frontend `slice(0,10)` still works). `bookmarks` is an array of post ids.

### `GET /users/:userId/profile`  (protected)
Live response (200):
```json
{
  "success": true, "message": "success",
  "data": { "isFollowing": false, "user": { ...same user object as profile-data... } }
}
```

### `GET /users/:userId/posts?page=&limit=`  (protected)
Default `limit` 40. Live response (200):
```json
{
  "success": true, "message": "success",
  "data": { "posts": [ ...post objects, §2.5... ] },
  "meta": { "pagination": { "currentPage": 1, "numberOfPages": 0, "limit": 40, "total": 0 } }
}
```

### `GET /users/suggestions?limit=`  (protected)
Live response (200):
```json
{
  "success": true, "message": "success",
  "data": {
    "suggestions": [
      { "_id": "...", "name": "Ahmed Abd Al-Muti", "username": "ahmedmutti",
        "photo": "...r2.dev/...", "mutualFollowersCount": 0, "followersCount": 222 }
    ]
  },
  "meta": { "pagination": { "currentPage": 1, "limit": 2, "total": 5046, "numberOfPages": 2523, "nextPage": 2 } }
}
```
Note the array key is `data.suggestions` (not `users`).

### `PUT /users/:userId/follow`  (protected) — documented, not live-probed
Toggles follow/unfollow for the target user (per Postman docs).

## 2.4 Endpoint catalog — Posts

### `GET /posts?page=&limit=&sort=-createdAt`  (protected)
`sort=-createdAt` is **accepted** (verified: newest-first). Live response (200):
```json
{
  "success": true, "message": "success",
  "data": {
    "posts": [
      {
        "_id": "6a78ffb58ebe92c2c01f53ef", "body": "test2", "privacy": "public",
        "user": { "_id": "...", "name": "adam", "username": "adam1",
                  "photo": "...r2.dev/linked-posts/...-wmremove-transformed.webp" },
        "sharedPost": null,
        "likes": [],
        "createdAt": "2026-08-09T22:31:17.658Z",
        "commentsCount": 0, "topComment": null,
        "sharesCount": 0, "likesCount": 0, "isShare": false,
        "id": "...", "bookmarked": false
      }
    ]
  },
  "meta": { "pagination": { "currentPage": 1, "numberOfPages": 1702, "limit": 2, "nextPage": 2, "total": 3404 } }
}
```
**Critical:** posts do **not** embed a `comments` array — only `commentsCount` + `topComment`.

### `GET /posts/feed?only=&page=&limit=&hasImage=&cursor=`  (protected)
`only` values verified: `all`, `me` (and default = following). `hasImage` and cursor modes documented.
Response wraps posts in `data.posts`; meta carries `feedMode` (`"page"` or `"cursor"`) + pagination.
Live example (`only=all&page=1&limit=2`) returned the same post objects as `/posts`.

### `GET /posts/:postId`  (protected)
`data.post` with populated `user`; `topComment` present when a comment exists. Shape identical to the
feed objects (§2.5) — again with `commentsCount`/`topComment`, **no embedded comments**.

### `POST /posts`  (protected, multipart/form-data)
Fields: `body` (text), `image` (optional file). Live response (201):
```json
{
  "success": true, "message": "post created successfully",
  "data": { "post": {
    "body": "Contract probe post - Phase1 sync", "privacy": "public",
    "user": "6a790c078ebe92c2c01f6b0b", "sharedPost": null, "likes": [],
    "_id": "6a790ca88ebe92c2c01f6ba5", "createdAt": "2026-08-09T23:26:32.804Z",
    "likesCount": 0, "isShare": false, "id": "6a790ca88ebe92c2c01f6ba5"
  }}
}
```
Note: in the **create** response `user` is a bare id string (not populated).

### `PUT /posts/:postId`  (protected, multipart/form-data)
Fields: `body`, `image` (replace). Verified: body update succeeds; response returns the updated post.
Docs also mention removing an image (exact request field not probed).

### `DELETE /posts/:postId`  (protected)
Live response (200): `{ "success": true, "message": "post deleted successfully", "data": {} }`.

### `PUT /posts/:postId/like`  (protected)
Toggles like for the current user. Verified live: `likesCount` 0→1 and the user id appears in `likes[]`.

### `PUT /posts/:postId/bookmark`  (protected)
Toggles bookmark. Verified live: `bookmarked` true and the post id appears in `profile-data.user.bookmarks`
with `bookmarksCount` incremented.

### `GET /posts/:postId/likes?page=&limit=`  (protected)
Live response (200): `data.likes[]` (array of user objects) + `meta.pagination` (default `limit` 20).

### `POST /posts/:postId/share`  (protected) — documented, not live-probed
Creates a share of the post (mentions/description support per docs).

## 2.5 Post object (reverse-engineered union of all responses)

```json
{
  "_id": "string", "body": "string", "privacy": "public",
  "user": { "_id": "string", "name": "string", "username": "string", "photo": "string" },
  "image": "r2 url (optional)",
  "sharedPost": null | "<post object>",
  "likes": [ "<userId>" ], "likesCount": 0,
  "commentsCount": 0, "topComment": null | "<comment object>",
  "sharesCount": 0, "isShare": false,
  "bookmarked": false,
  "createdAt": "ISO", "id": "string"
}
```

## 2.6 Endpoint catalog — Comments & Replies (nested under posts)

### `GET /posts/:postId/comments?page=&limit=`  (protected)
Live response (200):
```json
{
  "success": true, "message": "success",
  "data": { "comments": [
    { "_id": "...", "content": "...",
      "commentCreator": { "_id": "...", "name": "...", "username": "...", "photo": "..." },
      "post": "<postId>", "parentComment": null, "likes": [],
      "createdAt": "ISO", "repliesCount": 0 }
  ] },
  "meta": { "pagination": { "currentPage": 1, "limit": 5, "total": 1, "numberOfPages": 1 } }
}
```

### `POST /posts/:postId/comments`  (protected, multipart/form-data)
Field: `content` (and `image` per docs). Live response (201):
```json
{
  "success": true, "message": "comment created successfully",
  "data": { "comment": {
    "_id": "6a790ccc8ebe92c2c01f6bac", "content": "Contract probe comment",
    "commentCreator": { "_id": "...", "name": "Linkup Test User", "username": "...", "photo": "...",
                        "followersCount": 0, "followingCount": 0, "bookmarksCount": 0, "id": "..." },
    "post": "<postId>", "parentComment": null, "likes": [],
    "createdAt": "ISO", "likesCount": 0, "isReply": false, "id": "..."
  }}
}
```

### `PUT /posts/:postId/comments/:commentId`  (protected, multipart/form-data)
Field: `content` (and `image`). Verified live: content update succeeds, returns updated comment.

### `DELETE /posts/:postId/comments/:commentId`  (protected)
Live response (200): `{ "success": true, "message": "comment deleted successfully", "data": {} }`.

### `GET /posts/:postId/comments/:commentId/replies?page=&limit=`  (protected)
Live response (200): `data.replies[]` (comment-shaped objects) + `meta.pagination`.

### `POST /posts/:postId/comments/:commentId/replies`  (protected, form-data) — documented
### `PUT /posts/:postId/comments/:commentId/like`  (protected) — documented

## 2.7 Endpoint catalog — Notifications

- `GET /notifications?unread=&page=&limit=` → `data.notifications[]` + `meta.feedMode` + pagination.
- `GET /notifications/unread-count` → `data.unreadCount` (number).
  Live: `{"success":true,"message":"success","data":{"unreadCount":0}}`.
- `PATCH /notifications/:id/read` — mark one as read.
- `PATCH /notifications/read-all` — mark all as read.

## 2.8 Reverse-engineered data models (field reference)

| Model | Fields |
|---|---|
| User (profile-data) | `_id, name, username, email, dateOfBirth(ISO), gender, photo, cover, bookmarks[], followers[], following[], createdAt, followersCount, followingCount, bookmarksCount, id` |
| User (signup/signin) | `_id, name, username, email, photo, cover` (no dateOfBirth/gender) |
| User (suggestion) | `_id, name, username, photo, mutualFollowersCount, followersCount` |
| Post | `_id, body, image?, privacy, user(embedded), sharedPost, likes[], likesCount, commentsCount, topComment?, sharesCount, isShare, bookmarked, createdAt, id` |
| Comment | `_id, content, commentCreator(embedded), post, parentComment, likes[], likesCount, isReply, repliesCount, createdAt, id` |
| Notification | fields per Postman docs (list/unread/read endpoints) |

---

# Part III · Frontend Architecture

## 3.1 Entry, providers, and router

**`src/main.jsx`** renders (inside `StrictMode`):
`HeroUIProvider > ThemeContextProvider > AuthContextProvider > <App/>`.

**`src/App.jsx`** exports the singleton `queryClient` and builds the router with
`createBrowserRouter` (react-router-dom v7):

| Path | Element | Guard |
|---|---|---|
| `login` | `LoginPage` | `ProtectedAuthRoute` (redirect `/` if logged in) |
| `register` | `RegisterPage` | `ProtectedAuthRoute` |
| `/` (index) | `FeedPage` | `ProtactedRoute` (redirect `/login` if not logged in) |
| `post-details/:id` | `PostDetailsPage` | `ProtactedRoute` |
| `profile` | `ProfilePage` | `ProtactedRoute` |
| `edit-post/:id` | `EditPostPage` | `ProtactedRoute` |
| `user-page/:id` | `UserPage` | `ProtactedRoute` |
| `*` | `NotFoundPage` | — |

Route trees: `AuthLayout` (decorative shell for login/register) and `MainLayout`
(navbar + responsive 12-col grid with left/right sidebars when logged in, centered
`max-w-4xl` otherwise). The `Toaster` is themed from `themeColors` in `App.jsx`.

## 3.2 State & data layer

**`Contexts/AuthContext.jsx`** — `isloggedIn` (init from `Boolean(localStorage.token) &&
isValidJwt(localStorage.token)`; a garbage/non-JWT token is **cleared on startup** via
`clearStoredAuth()`, so a stale `"undefined"` can no longer open a phantom session),
`userID` (init from `localStorage.userID`), `profilePageIsOpen`, and setters. The userID is
bootstrapped by `FeedPage` on mount: if absent from localStorage, it calls
`getUserDetails()` and stores `res?.data?.data?.user?._id` (matches the new API:
`data.user._id`, same depth as ProfilePage).

**`Contexts/ThemeContext.jsx`** — `lightTheme`/`darkTheme` palettes, `themeColors`,
`isDarkMode`, `toggleDarkMode`, `updateTheme`, persistence in `localStorage.darkMode`,
and toggling the `.dark` class on `document.body`.

**React Query** — keys in use: `['posts']`, `['postDetails', id]`, `['userDetails']`,
`['userPosts']`. `utils/queryUtils.js` exports `invalidateAndRefetch`, `invalidateAll`,
`invalidatePosts`, `invalidatePostDetails` (all call `queryClient.invalidateQueries([...])`).

## 3.3 Service layer (axios — all current calls)

All four modules hard-code `BASE_URL = "https://route-posts.routemisr.com/"`. Since the
auth-hardening round, authenticated calls build their header from the shared
`Services/authHeaders.js`: `getAuthHeaders()` returns `{ Authorization: 'Bearer <token>' }`
only when `isValidJwt(token)` passes (3 base64url segments, length > 20); a malformed token is
**never sent** — `clearStoredAuth()` wipes `token`+`userID` and the call proceeds header-less.

| Module | Function | Current HTTP call | Body |
|---|---|---|---|
| AuthService | `registerUser` | `POST /users/signup` | JSON `{name, username, email, password, rePassword, dateOfBirth, gender}` |
| AuthService | `loginUser` | `POST /users/signin` | JSON `{email, password}` |
| FeedServices | `getAllPosts(page)` | `GET /posts?limit=50&page=&sort=-createdAt` | — |
| FeedServices | `postDetails(id)` | `GET /posts/:id` | — |
| FeedServices | `createPost(data)` | `POST /posts` | FormData `body`, `image` |
| FeedServices | `deletePost(id)` | `DELETE /posts/:id` | — |
| FeedServices | `updatePost(data, id)` | `PUT /posts/:id` | FormData `body`, `image` |
| CommentServices | `getPostComments(postId, page, limit)` | `GET /posts/:postId/comments` | — |
| CommentServices | `createComment(postId, data)` | `POST /posts/:postId/comments` | FormData `content` (`image` optional) |
| CommentServices | `updateComment(postId, commentId, data)` | `PUT /posts/:postId/comments/:commentId` | FormData `content` |
| CommentServices | `deleteComment(postId, commentId)` | `DELETE /posts/:postId/comments/:commentId` | — |
| UserDetailsServices | `getUserDetails()` | `GET /users/profile-data` | — |
| UserDetailsServices | `UploadUserImage(data)` | `PUT /users/upload-photo` | FormData `photo` (axios sets the `Content-Type` boundary) |
| UserDetailsServices | `getUserPosts(id)` | `GET /users/:id/posts?limit=50` | — |
| UserDetailsServices | `changeUserPassword(body)` | `PATCH /users/change-password` | JSON `{password, newPassword, confirmPassword}` |

Every call goes through plain `axios` (no instance, no interceptor). The token is read at call
time through `getAuthHeaders()`, so `localStorage` changes take effect on the next request.

## 3.4 Pages (behavior summary)

- **FeedPage** (`/`) — `useInfiniteQuery(['posts'], getAllPosts)`; `getNextPageParam` returns
  `lastPage?.data?.data?.posts || []` then `length < 50 ? undefined : allPages.length + 1`
  (`GET /posts` returns **no `meta`** — the length heuristic was confirmed by live probing);
  custom `IntersectionObserver` (rootMargin 10000px) triggers `fetchNextPage`; renders `CreatePost` +
  `Post` cards (`commentLimit={1}`, `from="feedPage"`); `getUserID()` bootstrap reads
  `res?.data?.data?.user?._id` inside a try/catch; a refetch-on-return effect fires on `'/'`.
  ⚠️ **The render unwraps `page?.data?.posts` (one level short of the envelope) — a successful
  fetch yields zero rendered posts** (residual issue, §5.8).
- **PostDetailsPage** (`/post-details/:id`) — `useQuery(['postDetails', id])`; renders
  `Post` with `getPostDetails={refetch}` and `commentLimit={data?.data.post.commentsCount ?? 0}`
  (comments themselves are fetched by `Comments` via `GET /posts/:postId/comments`, §3.5).
- **ProfilePage** (`/profile`) — `useQuery(['userDetails'], getUserDetails)`; profile card
  (photo, name, email, DOB via `dateOfBirth.slice(0,10)`, gender); modals `ProfilePictureModal`,
  `SettingsModal`, `ChangeProfilePictureModal`; `UserPosts` below; bootstraps `userID` when it
  is missing from localStorage (fixes `GET /users//posts` on direct navigation).
- **EditPostPage** (`/edit-post/:id`) — loads `postDetails` through a `useMutation`; a load
  failure now toasts "Failed to load the post" and redirects to `/` (no infinite spinner);
  submits FormData `body`+`image` via `updatePost`; "Remove Image" clears only the local preview.
- **UserPage** (`/user-page/:id`) — reuses `['postDetails', id]` + `postDetails(id)`, so
  `:id` is actually a **post** id (set by `PostHeader`), and the displayed user is
  `data?.data?.post?.user`; bio and join date are hard-coded strings.
- **LoginPage** — RHF+zod `{email, password}`; `loginUser`; onSuccess **validates the token
  with `isValidJwt` before storing** (invalid → error banner, no navigation), sets
  `isloggedIn`, navigates `/`; the banner shows the real server message (`loginErrorMessage`)
  with a static fallback.
- **RegisterPage** — RHF+zod `{name, username, email, password, rePassword, dateOfBirth, gender}`
  (`username` 3–20 chars `[a-zA-Z0-9._]`, required by the API); onSuccess toasts + navigates
  `/login`; onError toasts `error?.response?.data?.message`.
- **LoadingPage / NotFoundPage** — spinner block / 404.

## 3.5 Components (selected behaviors)

- **Post.jsx** — shared card; props `post, commentLimit, getPostDetails, getPosts, getUserPosts,
  from`. The conditional `useParams()` (Rules-of-Hooks issue) and the dead `postId` prop were
  removed in Phase-1. Delete via `deletePost` +
  `invalidateAndRefetch`; body click → details; image → `PostImageModal`.
- **PostHeader.jsx** — avatar fallback logic for `"undefined"`/missing photo, name click → `/profile`
  if owner else `/user-page/${post._id}` (post id, not user id — §4/§5.8); `DropDown` (Edit/Delete) when owner.
- **PostStatistics.jsx** — real counts `post?.likesCount ?? 0`, `post?.commentsCount ?? 0`,
  `post?.sharesCount ?? 0` (Phase-1; the `fakePost` zero-counters are gone).
- **PostBtns.jsx** — Like/Comment/Share; like & share are UI-only animations; share copies
  a URL to clipboard (no `POST /posts/:id/share` call).
- **Comments.jsx** — fetches `GET /posts/:postId/comments` itself (query keyed
  `['postComments', postId]`, `enabled: !!postId`) then renders
  `comments.slice(0, commentLimit).reverse()`; per-row `CommentHeader` + owner `DropDown`;
  inline edit via `CommentEditBox`; delete via `DeleteCommentConfirmModal`; mutations pass
  `postId` and invalidate `['postComments', postId]` / `['posts']` / `['postDetails', postId]`.
- **CreateComment.jsx** — HeroUI input; submits **FormData `content`** to
  `POST /posts/:postId/comments`.
- **CommentHeader.jsx** — avatar fallback ternary fixed (Phase-1), name, content, `createdAt.slice(0,10)`.
- **CreatePost.jsx** — composer; FormData `body`+`image` → `createPost`.
- **UserPosts.jsx** — `useQuery(['userPosts', userID], ...)` with `enabled: !!userID`; renders
  `Post` list (`commentLimit=1`, `from="userProfilePage"`, `key={post._id}`).
- **Navbar.jsx** — brand "Linkup" (`fa-link`), profile button, Login/SignUp or Logout
  (`LogoutConfirmModal`); `handleLogout` clears `token`+`userID` from localStorage.
- **Sidebar.jsx** — hard-coded fake data (no API calls).
- **SettingsModal** — dark toggle, Change Password (`ChangePasswordModal`), Notifications
  "Soon" placeholder.
- **ChangePasswordModal** — `changeUserPassword({password, newPassword, confirmPassword})`; on success clears
  localStorage + logs out after 3s (sensible, since API issues fresh token).
- **ChangeProfilePictureModal** — FormData `photo` → `UploadUserImage`; refetch
  `['userDetails']` + delayed `['userPosts']`.
- **DropDown.jsx** — HeroUI `Dropdown` Edit/Delete for post or comment.
- **ProfilePictureModal / PostImageModal** — preview; PostImageModal adds download.
- **DeletePostConfirmModal / DeleteCommentConfirmModal / LogoutConfirmModal** — confirm modals.
- **ErrorMessage / FetchingIcon / LoadingSpinner** — feedback primitives.

## 3.6 Styling & assets

`index.css`: Tailwind v4 (`@import "tailwindcss"`), `@plugin './hero.js'` (HeroUI),
`@source` for HeroUI theme, custom `dark` variant (`.dark`), input/select/dropdown classes,
scrollbar, floating-shape keyframes, dead legacy `.profile-link-focus` rules.
`App.css` is empty. `public/_redirects`: `/* /index.html 200` (Netlify SPA fallback).

---

# Part IV · Frontend ↔ API Alignment Matrix

Status legend: ✅ aligned · ⚠️ mismatch (breaks at runtime) · 🔲 missing feature (never wired).

> The "Required change" column is the as-found prescription. **Implementation status:** every ⚠️
> row above except the Phase-2-only capabilities (User page, likes/bookmarks/replies/follow, feed
> timeline, notifications, new post fields) was applied in Phase-1 + auth hardening (§5.2/§5.7);
> the one remaining ⚠️ is the feed **render** unwrap (§5.8).

| Frontend feature | Frontend call today | Current API | Difference | Required change |
|---|---|---|---|---|
| Register | `POST /signup` | `POST /users/signup` | path; `username` required; envelope | fix path; add `username` to form+schema; unwrap |
| Login | `POST /signin` | `POST /users/signin` | path; envelope | fix path; unwrap |
| Token storage | `data.data.token` | `data.token` | nesting | ✅ none — `data.data.token` already matches the envelope (root cause #3) |
| Auth header | `headers: { token }` | `Authorization: Bearer <token>` | header name | Bearer header everywhere |
| Feed | `GET /posts?limit=50&page&sort=-createdAt` | same (sort accepted) | `token` hdr; envelope; pagination in `meta` | ✅ Bearer (done); `data.data.posts` already matches; paginate by length — `GET /posts` returns **no** `meta` (§5.2) |
| Infinite scroll | `lastPage.data.posts.length < 50` | `meta.pagination` | shape | ✅ length heuristic kept — live probing showed `GET /posts` has no `meta` (§5.2); ⚠️ **render** reads one level short (§5.8) |
| Post details | `GET /posts/:id` → `data.post` | same path | header; envelope | Bearer; unwrap `data.post` |
| Create post | `POST /posts` FormData `body`+`image` | same | header | Bearer |
| Update post | `PUT /posts/:id` FormData | same | header; optional remove-image | Bearer; decide remove-image field |
| Delete post | `DELETE /posts/:id` | same | header | Bearer |
| Create comment | `POST /comments` JSON `{content, post}` | `POST /posts/:postId/comments` FormData | path + body format | nested URL; FormData |
| Update comment | `PUT /comments/:id` JSON | `PUT /posts/:postId/comments/:commentId` FormData | path + body format | nested URL; FormData; pass postId |
| Delete comment | `DELETE /comments/:id` | `DELETE /posts/:postId/comments/:commentId` | path needs postId | nested URL; pass postId |
| Comments list | `post.comments` (embedded) | `GET /posts/:postId/comments` | **not embedded** | fetch via new endpoint |
| Comment count | `post?.comments?.length` | `commentsCount` | field | use `commentsCount` |
| Upload photo | `PUT /users/upload-photo` FormData `photo` | same | header | Bearer |
| Change password | `PATCH /users/change-password` `{password,newPassword}` | same | header; fresh token issued | Bearer; frontend logs out (ok) |
| My profile | `GET /users/profile-data` → `data.user` | same | header; envelope | Bearer; unwrap `data.user` |
| My posts | `GET /users/:id/posts?limit=50` → `data.posts` | same | header; envelope | Bearer; unwrap |
| User page | `GET /posts/:id` → `post.user` (hack) | `GET /users/:userId/profile` | proper endpoint | keep for Phase 1; switch in Phase 2 |
| Like button / stats / shares | **no API call** (decorative, 0) | `PUT /posts/:id/like`, `GET /posts/:id/likes`, `POST /posts/:id/share` | new capability | Phase 2 |
| Bookmarks | none | `PUT /posts/:id/bookmark` (+ profile `bookmarks`) | new | Phase 2 |
| Replies | none | `.../comments/:commentId/replies` | new | Phase 2 |
| Follow system | none | `PUT /users/:id/follow`, `GET /users/suggestions` | new | Phase 2 |
| Feed timeline | none | `GET /posts/feed?only=` (all/me/following) | new | Phase 2 |
| Notifications | none ("Soon" placeholder) | 4 endpoints | new | Phase 2 |
| New post fields | ignored | `likesCount, isLiked?, bookmarked, sharesCount, commentsCount, isShare` | not rendered | Phase 2 rendering |

---

# Part V · Breakage Root-Cause, Fix Map, & Phase-2 Capability Map

## 5.1 Why the app is currently broken (root cause)

1. **Auth endpoints 404.** The frontend calls `POST /signup` and `POST /signin`; the live API
   only serves `POST /users/signup` and `POST /users/signin`. Verified live: the old paths return
   `{"success":false,"message":"route not found"}`. Login/registration can never succeed.
2. **Wrong auth header.** Every authenticated call sends `headers: { token }`. The API requires
   `Authorization: Bearer <token>` and returns `401 "token not provided"` otherwise (verified).
3. **Envelope reads are actually correct — no unwrap fix was needed (determined during Phase-1
   implementation).** Components read `response.data.data.token/post/posts/user`. With the
   current envelope `{success, message, data:{...}}`, `response.data` is the envelope and
   `response.data.data` is the payload, so the existing `data.data.*` reads resolve correctly
   (proven by the live integration tests). The real blockers were #1, #2, #4, #5, #6, #7. The
   `data.data.*` pattern is incidentally aligned with the new envelope — meaning the app was
   written against a *different* API shape and only the path/header/field mismatches broke it.
4. **Registration missing `username`.** The current API requires `username`; the register form
   and zod schema have no username field.
5. **Comments moved + reformatted.** Old top-level `POST/PUT/DELETE /comments...` with JSON
   bodies are gone. The API now nests them under posts (`/posts/:postId/comments/...`) and
   accepts multipart form-data (`content`, `image`).
6. **Comments are no longer embedded in posts.** `Comments.jsx` renders `post.comments`
   (always empty with the new API), and `PostDetailsPage` evaluates
   `data.data.post.comments.length` — a hard crash when `comments` is `undefined`.
7. **Statistics are hard-coded.** `PostStatistics` shows `fakePost.likes` (0) and
   `fakePost.shares` (0); real `likesCount`/`sharesCount`/`commentsCount` are never read.

## 5.2 Fix map — Phase 1 (IMPLEMENTED 2026-08-10 — verified by build, lint, and live integration tests)

Scope: make the existing features work against the current API. No new features, no redesign.

| Area | Change | Status |
|---|---|---|
| `Services/AuthService.js` | paths → `/users/signup`, `/users/signin` | ✅ done |
| `Services/CommentServices.js` | `createComment(postId, data)` → `POST /posts/:postId/comments` (FormData `content`); `updateComment(postId, commentId, data)` → `PUT /posts/:postId/comments/:commentId` (FormData); `deleteComment(postId, commentId)` → nested DELETE; added `getPostComments(postId, page, limit)` | ✅ done |
| All services | replace `headers: { token }` with `Authorization: Bearer <token>` via a shared `getAuthHeaders()`; dropped the manual `Content-Type: multipart/form-data` on `UploadUserImage` (axios sets the boundary itself) | ✅ done |
| Response unwrap | **not needed** — `response.data.data.*` already matches the current envelope (see root cause #3); read sites left untouched | ✅ n/a |
| `pages/LoginPage.jsx` | no unwrap needed; now displays the real server error message (`loginErrorMessage`) instead of static text | ✅ done |
| `pages/RegisterPage.jsx` + `schema/RegisterSchema.js` | added required `username` field (3–20 chars, `[a-zA-Z0-9._]`), sent as JSON to `/users/signup`; error toast reads `error.response.data.message` | ✅ done |
| `pages/FeedPage.jsx` | `getNextPageParam` reads `data.data.posts` and keeps the length heuristic (`< 50` → stop) — `GET /posts` returns **no** `meta`, so a meta-based page-param was rejected after live probing; refetch-on-return condition fixed to `'/'` | ✅ done |
| `pages/PostDetailsPage.jsx` | `commentLimit` from `data.data.post.commentsCount` (was `.comments.length` — a hard crash) | ✅ done |
| `pages/EditPostPage.jsx` | unwrap not needed; added load-failure handling (toast + redirect instead of infinite spinner) | ✅ done |
| `components/Comments.jsx` | fetches via `GET /posts/:postId/comments` (query keyed `['postComments', postId]`) instead of `post.comments`; create/update/delete pass `postId`; invalidates `['postComments', postId]`, `['posts']`, `['postDetails', postId]` | ✅ done |
| `components/CreateComment.jsx` | sends FormData `content` to the nested URL with `postId` | ✅ done |
| `components/PostStatistics.jsx` | uses `post.likesCount` / `post.sharesCount` / `post.commentsCount` (real counts instead of hard-coded 0) | ✅ done |
| `components/CommentHeader.jsx` | fixed inverted avatar fallback ternary | ✅ done |
| `components/UserPosts.jsx` | query key now `['userPosts', userID]` + `enabled: !!userID` (fixes direct-navigation/profile load); `key={post._id}` | ✅ done |
| `components/Post.jsx` | removed conditional `useParams()` (rules-of-hooks violation) and the dead `postId` prop | ✅ done |
| `pages/ProfilePage.jsx` | bootstraps `userID` from `GET /users/profile-data` when it is missing (fixes `GET /users//posts` 404 on direct navigation) | ✅ done |
| `ARCHITECTURE.md` | update §12–§16, §39 to the verified contract | ✅ done (this session — §12/§13/§14/§15/§16/§18/§20/§21/§22/§28/§29/§31/§32/§33/§36/§38/§39/§40/Appendix A reconciled with the post-fix tree) |

### Phase-1 verification (live, 2026-08-10)

- `npm run build` → `✓ 1927 modules transformed`, `✓ built in 5.12s`, 0 errors.
- `npm run lint` → **0 errors, 6 warnings** (all pre-existing react-refresh/exhaustive-deps advisories).
- `vite preview` smoke test → served `dist` (index.html 453 B), `#root` present, deep route `/login` → 200 (SPA fallback), bundle hash referenced matches the rebuilt output.
- Live integration test (Node, drives the **actual** `src/Services/*` modules, auth as `linkuptest0810`): **25/25 PASS** — login, profile, feed (page 1 full / page 2 distinct / deep page empty), create post, post details (counts), update post, create comment, list comments (+`commentCreator`), update comment, delete comment, user posts, delete post (+404), change-password round-trip restoring the documented password, and login after restore.
- Live registration test through `registerUser` (the exact RegisterPage body incl. `username`): signup → 201/`success:true` + token + `user.username` stored; duplicate username → 409 `{success:false, message:"username already exists."}` (the message RegisterPage now toasts).

## 5.3 Phase 2 capability map (backend features the frontend has not consumed)

1. Post likes: `PUT /posts/:id/like` + `GET /posts/:id/likes` → `PostBtns`/`PostStatistics`.
2. Home feed timeline: `GET /posts/feed?only=following|me|all` + `hasImage` + cursor mode.
3. Bookmarks: `PUT /posts/:id/bookmark` (+ `GET /users/bookmarks` per docs); profile `bookmarks`.
4. Comments replies + comment likes (`/posts/:id/comments/:commentId/replies`, `.../like`).
5. Shares: `POST /posts/:id/share` (replace clipboard-only behavior); render `sharedPost`.
6. Follow system: `PUT /users/:id/follow`, `GET /users/suggestions` (Sidebar), `isFollowing`
   (`GET /users/:userId/profile`), and switching `UserPage` from the post-details hack.
7. Notifications: `GET /notifications`, `unread-count`, `PATCH .../read`, `read-all` — replace the
   SettingsModal "Soon" placeholder, add navbar badge.
8. New post fields rendering: `likesCount`, `bookmarked`, `sharesCount`, `commentsCount`,
   `isShare`, `sharedPost`, `privacy`, `topComment`.

## 5.4 Verification evidence log (live probes, 2026-08-10)

- `POST /users/signup` → 201 `{"success":true,"message":"account created","data":{token,tokenType,expiresIn,user{...}}}`.
- `POST /users/signin` (email field **and** username `login` field) → both succeed, same envelope.
- `PATCH /users/change-password` → fresh token returned; message "password changed successfully".
- `PUT /users/upload-photo` (1x1 PNG) → `data.photo` R2 `.webp` URL + `data.postId`.
- `GET /users/profile-data` → `data.user` (full shape with counts/bookmarks).
- `GET /users/:id/profile` → `data.user` + `data.isFollowing`.
- `GET /users/:id/posts?limit=2` → `data.posts` + `meta.pagination` (default limit 40).
- `GET /users/suggestions?limit=2` → `data.suggestions`.
- `GET /posts?limit=2` and `?sort=-createdAt` → accepted, newest-first, distinct per page; `data`
  contains **only** `posts` (no `meta`) — exhaustion signal = a page shorter than `limit` (deep
  pages return `[]`). `GET /users/:id/posts` and `GET /posts/feed` do include `meta.pagination`.
- `GET /posts/feed?only=all|me` and default → `data.posts` + `meta.feedMode:"page"`.
- `GET /posts/:id` → `data.post` (populated user, `topComment`, no embedded comments).
- `POST /posts` (FormData) → `data.post` ("post created successfully").
- `PUT /posts/:id` (FormData) → updated body persisted (verified by follow-up GET).
- `PUT /posts/:id/like` → `likesCount` 0→1; `GET /posts/:id/likes` → `data.likes[]`.
- `PUT /posts/:id/bookmark` → `bookmarked:true`; profile `bookmarks`/`bookmarksCount` incremented.
- `POST/PUT/DELETE /posts/:id/comments/...` → all succeeded; `GET .../comments` → `data.comments[]`;
  `GET .../replies` → `data.replies[]`.
- `GET /notifications/unread-count` → `data.unreadCount:0`; `GET /notifications` → `data.notifications[]`.
- `DELETE /posts/:id` → "post deleted successfully".
- Negative: old `/signin` → `"route not found"`; protected routes without Bearer →
  `401 "token not provided"`.

Test fixture: account `linkuptest0810` / `linkuptest0810@gmail.com` (password now
`Test@1234567` after the change-password probe). Sample post `6a790ca88ebe92c2c01f6ba5`
(body "Updated contract probe post") remains on the feed.

## 5.5 Documentation staleness notes

- `README.md`: base URL `https://linked-posts.routemisr.com/` is stale (live host is
  `route-posts.routemisr.com`); claims 5 color themes, nested comments, real likes/shares —
  aspirational/not in the code.
- `ARCHITECTURE.md` §39 used to flag API-contract drift from early probes (only `GET /signin`
  404s and 401s). It was **reconciled with the live-verified contract in this session** (§5.8):
  §12–§16, §18, §20–§22, §28–§33, §36, §38–§40 and Appendix A now describe the post-fix tree.
- `index.html` favicon references `public/Linkuo-logo.svg` ("Linkuo", matching the asset name).

## 5.6 Assumptions & limitations

- Documentation plus Phase-1 implementation: the fix map in §5.2 was applied on 2026-08-10 and
  verified by a production build, ESLint (0 errors), a `vite preview` smoke test, and a 25-check
  live integration test driving the actual service modules (all passed). Temporary probe artifacts
  and test scripts/logs (`src-tree.txt`, `arch-tail.txt`, `tmp_*.mjs`, `*_log.txt`, `*.ps1`) are
  removed afterward.

## 5.7 Post-verification auth hardening (2026-08-10, round 2)

**Bug observed:** after login the feed failed with
`{"success":false,"message":"jwt malformed","errors":"jwt malformed"}`, then the frontend crashed
with `Cannot read properties of undefined (reading 'pages')`.

**Root cause (verified live):**
- The signin envelope is `{success, message, data:{token, tokenType, expiresIn, user}}`, so
  `LoginPage`'s `localStorage.setItem('token', data.data.token)` stores a **valid JWT** today.
  A fresh login → feed round-trip returns 200 with 50 posts (reproduced live).
- A stale/garbage value under `localStorage['token']` (e.g. the literal string `"undefined"`
  left by an earlier broken build when `data.data.token` was `undefined`) is what produces the
  error. Probes confirmed: `Authorization: Bearer undefined` → `401 "jwt malformed"` (exactly the
  reported message), while an absent header → `401 "token not provided"`.
- Two compounding flaws: (1) `AuthContext` treated *any* truthy stored string as a session, and
  (2) services forwarded it verbatim via `Authorization: Bearer ${localStorage.getItem("token")}`.
- The crash: with the feed request rejected, `useInfiniteQuery` yields `data === undefined`, and
  `FeedPage` rendered `data.pages.map(...)` → TypeError.

**Fixes:**
- New `src/Services/authHeaders.js` — single source of truth for the auth header. `isValidJwt()`
  only accepts well-formed JWTs (3 dot-separated base64url segments); `getAuthHeaders()` **never
  sends a malformed token** and removes garbage + `userID` from localStorage instead (self-heal).
- `FeedServices`, `UserDetailsServices`, `CommentServices` now import `getAuthHeaders()` from the
  shared module instead of inlining `Bearer ${localStorage.getItem("token")}`.
- `AuthContext` only counts a **valid JWT** as a session; garbage tokens are cleared on startup,
  forcing a fresh login (no more phantom sessions from `"undefined"`).
- `LoginPage` stores the token only when `isValidJwt(data.data.token)` passes; otherwise it shows
  the error banner and does not navigate.
- `FeedPage` renders `(data?.pages ?? []).map(...)` and `(page?.data?.posts ?? []).map(...)`, and
  `getUserID()` wraps the profile bootstrap in try/catch with safe unwrapping — an API failure
  can no longer crash the feed (`pages` crash fixed by construction).
- `ErrorMessage` now shows the server's message (`error.response.data.message`) instead of the
  generic axios text.

**Verification (all passed, live against `route-posts.routemisr.com`):**
- `npm run build` → 0 errors; `npm run lint` → 0 errors (6 pre-existing warnings).
- Fresh login → `getAllPosts` → 200 with 50 posts; `getUserDetails` → 200 (exact service-module
  code path the browser runs).
- Garbage-token regression: with `localStorage.token = "undefined"`, `getAuthHeaders()` returns
  `{}` (no `Authorization` header), clears the garbage, and the API answers a clean
  `401 "token not provided"` — no `jwt malformed`, no crash.
- `vite preview` smoke test: `/` → 200, `/login` → 200 (SPA deep route), fresh bundle served.

- Response shapes are verbatim from live probes; endpoints marked "documented" (share, follow,
  replies POST, comment like, notifications read) come from Postman/docs and were not exercised.
- Cursor feed mode and `hasImage` were not exercised; `sort` was verified accepted.
- The auto-created "updated profile picture" post was deleted during probing; the test post and
  account remain as live fixtures.

## 5.8 Documentation reconciliation — residual findings (2026-08-10, round 3)

While reconciling `ARCHITECTURE.md` §12–§16/§39 with the live-verified contract, every
frontend file was re-read against the post-fix tree. **No code was changed in this round.**

1. **✅ Feed renders an empty list on success — FIXED (2026-08-10).** `FeedPage.jsx:107`
   unwrapped `page?.data?.posts` (i.e. `response.data.posts`), but the live envelope puts the
   posts array at `response.data.data.posts` — the pagination code already reads the correct
   depth (`FeedPage.jsx:32`). The render path is now `page?.data?.data?.posts`. The same
   one-level-short unwrap was also present — and fixed — in `ProfilePage` (`data.data.data.user`,
   previously a hard crash on `dateOfBirth`/`photo`), `UserPosts` (`data.data.data.posts`), and
   `PostDetailsPage`/`UserPage`/`EditPostPage` (`data.data.data.post`). Verified live in a
   headless-browser run: feed renders 50 posts, profile renders name/email/DOB/gender/photo,
   user posts and post-details/edit pages render, zero uncaught exceptions, zero console errors.
2. **Change-password body.** `changeUserPassword` sends
   `{ password, newPassword, confirmPassword }` (ChangePasswordModal), matching the API.
3. **Login redirect.** `LoginPage` persists the token only after `isValidJwt`, sets
   `isloggedIn`, then navigates — no race with the guards under React 19 automatic batching.
4. **The auth round-trip works live.** Fresh login → feed/profile-data/comment calls all
   return 200 with the documented shapes (§5.7). The app's remaining functional blocker is
   finding #1 above.

**Cleanup:** temporary probe scripts/logs from the interrupted session
(`tmp_login_*.mjs/.jsx`, `*_log.txt`) were removed, and the extraneous `jsdom` dev-only
installation was pruned from `node_modules`; `package.json` is unchanged.

