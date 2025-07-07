# ProsperTrack™ - Financial Analysis Platform

## Database Setup Instructions

### 1. Create Supabase Tables

**IMPORTANT**: You need to run the SQL commands in your Supabase dashboard to create the required tables.

1. Go to your Supabase project dashboard
2. Navigate to the "SQL Editor" 
3. Copy and paste the contents of `database-setup.sql` 
4. Click "Run" to execute the SQL

### 2. Required Tables

The application requires these tables in Supabase:

- **users_pt2024**: User authentication and profile data
- **clients_pt2024**: Client information and details  
- **analyses_pt2024**: Financial analysis data

### 3. Features

- ✅ User authentication with Supabase
- ✅ Client management with full CRUD operations
- ✅ Financial analysis with data persistence
- ✅ Real-time data synchronization
- ✅ Role-based access control (Admin/Financial Professional)
- ✅ Responsive design with Tailwind CSS
- ✅ PDF report generation
- ✅ Life insurance calculator
- ✅ Debt stacking calculator

### 4. Demo Credentials

**Admin Account:**
- Email: sebasrodus+admin@gmail.com  
- Password: admin1234

**Financial Advisor Account:**
- Email: advisor@prospertrack.com
- Password: advisor123

### 5. Data Persistence

The application now properly saves data to Supabase:

- **Users**: Stored in `users_pt2024` table
- **Clients**: Stored in `clients_pt2024` table  
- **Financial Analyses**: Stored in `analyses_pt2024` table

Data is also backed up to localStorage as a fallback mechanism.

### 6. Development

```bash
npm install
npm run dev
```

### 7. Build

```bash
npm run build
```

The application will build successfully and deploy with full database functionality.