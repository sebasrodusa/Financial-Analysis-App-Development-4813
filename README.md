# ProsperTrack Financial Analysis Platform

ProsperTrack is a financial planning tool built with a React frontend, an Express backend using Clerk for authentication, and a Neon Postgres database.

Email-based code verification has been removed; all sign-in flows now rely on Clerk's standard authentication.

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

codex/update-.env.example-with-placeholders
Replace the Clerk placeholders with your actual keys. Provide the real
credentials through environment variables or your deployment settings.

For database access, you can either set the individual `PGHOST`, `PGPORT`,
`PGUSER`, `PGPASSWORD` and `PGDATABASE` variables or provide a single
`NETLIFY_DATABASE_URL` (or `DATABASE_URL`) connection string.

All persistent data lives in a Neon Postgres instance. Schema and seed data are defined in `migrations/initial.sql`.
main

codex/keep-initial.sql-as-authoritative-migration
## Database Setup

1. Provision a Neon PostgreSQL database.

2. All tables, policies and demo data are defined in `migrations/initial.sql`. Run this migration using `psql` or your preferred tool:
   - `psql $DATABASE_URL -f migrations/initial.sql`

This script creates the required tables and seed demo users used by the app.

## Running the Application

## Installation
main

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
codex/keep-initial.sql-as-authoritative-migration
prospertrack/
├── public/               # Public assets
├── src/
│   ├── common/           # Common components and utilities
│   ├── components/       # React components
│   ├── context/          # Context providers
│   ├── lib/              # Library integrations
│   ├── config/           # Configuration files
│   ├── App.jsx           # Main App component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── .env.example          # Example environment variables
├── migrations/
│   └── initial.sql       # Database migration script
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## Security Notes

- This application uses bcryptjs for password hashing
- Environment variables are used for sensitive configuration
- Row-level security is implemented in the database

## License
This project is proprietary software. All rights reserved.

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
main
