# Ferrata Tracker

A React and TypeScript app for exploring via ferratas and keeping a personal climbing journal. Built to practise routing, forms, Firebase authentication and working with asynchronous data.

## Features

- Browse routes, filter by difficulty and sort by name or grade.
- View route details and source links.
- Create an account and log in with email and password.
- Save, edit, or remove a completion with a date and optional note.
- View completed routes with country and difficulty totals.
- Responsive layout, labelled controls, keyboard focus styles and loading/error states.

## Tech stack

React · TypeScript · React Router · Vite · CSS with Tailwind utilities · Firebase Authentication · Cloud Firestore

Tests use Node's built-in test runner. ESLint and TypeScript check the code.

## Run locally

Use Node.js 22.18 or newer and npm.

```bash
npm ci
cp .env.example .env.local
```

Keep your existing `.env.local` if you already have one. Fill in the variables from `.env.example` using your Firebase web app configuration.

In your Firebase project:

1. Register a web app.
2. Enable Email/Password authentication.
3. Create a Cloud Firestore database and configure the included `firestore.rules` for that project.
4. Add route documents to the `ferratas` collection; the app does not populate it automatically.

Example route document:

```json
{
  "name": "Example route",
  "country": "Austria",
  "region": "Tyrol",
  "difficulty": "B/C",
  "difficultyRank": 2.5,
  "lengthM": 350,
  "description": "A description of the route.",
  "sourceUrl": "https://example.com/route"
}
```

Lengths are in metres. `difficultyRank` determines difficulty sorting. Elevation gain and coordinates are optional.

```bash
npm run dev
```

Open the URL printed by Vite, normally http://localhost:5173. Restart the server after changing environment variables.

## Commands

| Command           | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the development server              |
| `npm test`        | Test validation and progress calculations |
| `npm run lint`    | Run ESLint                                |
| `npm run build`   | Type-check and build into `dist/`         |
| `npm run preview` | Preview the production build locally      |

## Implementation notes

- Firebase calls live in small service modules.
- Authentication is shared through Context; filters and form values use local state.
- Database records are validated at runtime before the UI uses them.
- Completions are stored per user, with one record per route. Firestore rules restrict access to the owner.

## Limitations

- Repeated ascents, password reset, email verification and account deletion are not implemented.
- If a route leaves the catalogue, its journal entry remains visible but cannot currently be edited or removed through the UI.
- Automated tests cover validation and summary logic; live Firebase behaviour and security rules need separate verification.

For deployment, provide the Firebase environment variables at build time and configure your static host to serve `index.html` for application routes. An optional Firebase Hosting configuration is included in `firebase.json`.
