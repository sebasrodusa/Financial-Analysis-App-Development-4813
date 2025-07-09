# ProsperTrack™ Financial Analysis Platform

ProsperTrack™ is a comprehensive financial analysis platform designed for financial professionals to manage clients, create financial analyses, generate reports, and provide financial planning tools.

## Features

- **Client Management**: Create and manage client profiles with detailed information
- **Financial Analysis**: Perform comprehensive financial analyses for clients
- **Report Generation**: Generate professional PDF reports
- **Financial Tools**: Use calculators for life insurance needs and debt stacking strategies
- **User Management**: Admin panel for managing users and permissions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion
- **Database**: Neon PostgreSQL
- **PDF Generation**: React-PDF
- **Charts**: ECharts
- **Authentication**: Custom authentication via Express backend

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/prospertrack.git
cd prospertrack
```

2. Install dependencies:
```bash
npm install
```
   Run this command before executing `npm run lint` so that development
   dependencies like `@eslint/js` are available.

3. Create a `.env` file in the root directory based on `.env.example` and add your credentials:
```
VITE_API_URL=http://localhost:3000

VITE_QUEST_APIKEY=your-quest-api-key
VITE_QUEST_ENTITYID=your-quest-entity-id
VITE_QUEST_API_TYPE=PRODUCTION
VITE_QUEST_ONBOARDING_QUESTID=your-onboarding-quest-id
VITE_GET_STARTED_QUESTID=your-get-started-quest-id
VITE_QUEST_USER_ID=your-quest-user-id
VITE_QUEST_TOKEN=your-quest-token
```

Replace the Clerk placeholders with your actual keys. Provide the real
credentials through environment variables or your deployment settings.

For database access, you can either set the individual `PGHOST`, `PGPORT`,
`PGUSER`, `PGPASSWORD` and `PGDATABASE` variables or provide a single
`NETLIFY_DATABASE_URL` (or `DATABASE_URL`) connection string.

## Database Setup

1. Provision a Neon PostgreSQL database.

2. Run the migration scripts located in the `migrations` directory using `psql` or your preferred tool:
   - `psql $DATABASE_URL -f migrations/initial.sql`

These scripts create the required tables and seed demo users used by the app.

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` folder, which can be deployed to any static hosting service.

## Linting

Before running the linter, make sure all dependencies are installed:
```bash
npm install
```
This installs dev dependencies such as `@eslint/js`. Then execute:
```bash
npm run lint
```

## Demo Credentials

For testing purposes, you can use these demo accounts:

- **Admin**: sebasrodus+admin@gmail.com / admin1234
- **Advisor**: advisor@prospertrack.com / advisor123

## Project Structure

```
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
├── database-setup.sql    # Database setup script
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## Security Notes

- This application uses bcryptjs for password hashing
- Environment variables are used for sensitive configuration
- Row-level security is implemented in the database

## License

This project is proprietary software. All rights reserved.