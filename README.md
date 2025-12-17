# MediReminder - Healthcare Medication Management System

A production-quality healthcare web application that helps patients manage medications, receive reminders, and track adherence.

## Tech Stack

**Backend:**
- Node.js + Express.js
- Apollo Server (GraphQL)
- PostgreSQL + Sequelize ORM
- JWT Authentication

**Frontend:**
- React
- Apollo Client
- Responsive & Accessible UI

## Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v13+)

### Installation

1. Clone and navigate to project:
```bash
cd medireminder
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Create PostgreSQL database:
```bash
createdb medireminder
```

5. Start development servers:
```bash
npm run dev:full
```

The backend runs on http://localhost:4000
The frontend runs on http://localhost:3000

## Project Structure

```
medireminder/
├── server/
│   ├── config/         # Database and app configuration
│   ├── models/         # Sequelize data models
│   ├── graphql/        # GraphQL schemas and resolvers
│   ├── middleware/     # Authentication and validation
│   ├── services/       # Business logic and notifications
│   └── index.js        # Server entry point
├── client/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Main application pages
│   │   ├── graphql/    # GraphQL queries and mutations
│   │   ├── utils/      # Helper functions
│   │   └── App.js      # Main React component
│   └── package.json
└── package.json
```

## Core Features

- ✅ Secure user authentication (JWT)
- ✅ Medication management with validation
- ✅ Auto-generated dose schedules
- ✅ Daily adherence tracking
- ✅ Dashboard with statistics
- ✅ Refill reminders
- ✅ Accessible, mobile-friendly UI

## License

MIT
