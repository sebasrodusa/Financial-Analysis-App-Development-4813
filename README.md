# ProsperTrack Financial Analysis Platform

ProsperTrack is a financial planning tool built with a React frontend, an Express backend using Clerk for authentication, and a Neon Postgres database.

## Backend

The API defined in `server.js` uses Express and `@clerk/clerk-sdk-node` for user authentication. It connects to Postgres via `pg` and exposes endpoints for user, client and analysis management.

### Available Endpoints

- `POST /auth/signup` – register a new user
- `POST /auth/login` – log in with email and password
- `GET /users` – list all users (auth required)
- `POST /users` – create a user (auth required)
- `PUT /users/:id` – update a user
- `DELETE /users/:id` – delete a user
- `GET /clients` – list the current user's clients
- `POST /clients` – create a client
- `PUT /clients/:id` – update a client
- `DELETE /clients/:id` – remove a client
- `GET /analyses` – list analyses for the current user
- `POST /analyses` – create an analysis
- `PUT /analyses/:id` – update an analysis
- `DELETE /analyses/:id` – delete an analysis

## Frontend

The frontend is built with React and Vite and styled with Tailwind CSS. Development uses the Vite dev server and the app is bundled using `vite build`.

## Database

All persistent data lives in a Neon Postgres instance. Schema and seed data are defined in `migrations/initial.sql`.

## Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone <repo-url>
   cd prospertrack
   npm install
   ```
2. Create a `.env` file based on `.env.example` and configure the variables:
   ```bash
   VITE_API_URL=http://localhost:3000
   VITE_QUEST_APIKEY=your-quest-api-key
   VITE_QUEST_ENTITYID=your-quest-entity-id
   VITE_QUEST_API_TYPE=PRODUCTION
   VITE_QUEST_ONBOARDING_QUESTID=your-onboarding-quest-id
   VITE_GET_STARTED_QUESTID=your-get-started-quest-id
   VITE_QUEST_USER_ID=your-quest-user-id
   VITE_QUEST_TOKEN=your-quest-token
   NETLIFY_DATABASE_URL=
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=password
   PGDATABASE=prospertrack
   CLERK_PUBLISHABLE_KEY=pk_test_aW1tb3J0YWwtc3RhZy00MC5jbGVyay5hY2NvdW50cy5kZXYk
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_aW1tb3J0YWwtc3RhZy00MC5jbGVyay5hY2NvdW50cy5kZXYk
   CLERK_SECRET_KEY=sk_test_UeVliIA2wI0NcdX8f7XqODUGopXhOQFUyfPjeQ73un
   ```
3. Provision a Neon Postgres database and run the migration script:
   ```bash
   psql $DATABASE_URL -f migrations/initial.sql
   ```

## Development

Start the API server:
```bash
npm run server
```
In a separate terminal start the frontend:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

To create a production build run:
```bash
npm run build
```
The optimized output is written to the `dist` directory.

## Project Structure

```
/               project root
├── server.js            Express API
├── migrations/          SQL migration scripts
├── public/              Static assets
├── src/                 React source code
│   ├── components/
│   ├── common/
│   ├── context/
│   ├── lib/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```
