# MediReminder - Technical Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                     (React Application)                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Login/     │  │  Dashboard   │  │ Medications  │        │
│  │   Signup     │  │              │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │   Calendar   │  │ Add Med Form │                          │
│  │              │  │              │                          │
│  └──────────────┘  └──────────────┘                          │
│                                                                 │
│                    ↓  ↓  ↓  ↓  ↓                              │
│                                                                 │
│              ┌─────────────────────────┐                       │
│              │    Apollo Client        │                       │
│              │  (State Management)     │                       │
│              │  • InMemory Cache       │                       │
│              │  • GraphQL Operations   │                       │
│              │  • Auth Token Handler   │                       │
│              └─────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                             ↓
                    HTTP/GraphQL Requests
                    (with JWT in headers)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                             │
│                   (Node.js + Express)                           │
│                                                                 │
│              ┌─────────────────────────┐                       │
│              │  Express.js Server      │                       │
│              │  • CORS Middleware      │                       │
│              │  • JSON Parser          │                       │
│              │  • Health Check Route   │                       │
│              └─────────────────────────┘                       │
│                             ↓                                   │
│              ┌─────────────────────────┐                       │
│              │  Apollo GraphQL Server  │                       │
│              │  • Type Definitions     │                       │
│              │  • Resolvers            │                       │
│              │  • Error Formatting     │                       │
│              └─────────────────────────┘                       │
│                             ↓                                   │
│              ┌─────────────────────────┐                       │
│              │  Auth Middleware        │                       │
│              │  • JWT Verification     │                       │
│              │  • User Context         │                       │
│              └─────────────────────────┘                       │
│                             ↓                                   │
│              ┌─────────────────────────┐                       │
│              │  GraphQL Resolvers      │                       │
│              │  • Query Handlers       │                       │
│              │  • Mutation Handlers    │                       │
│              │  • Business Logic       │                       │
│              └─────────────────────────┘                       │
│                             ↓                                   │
│              ┌─────────────────────────┐                       │
│              │  Services Layer         │                       │
│              │  • scheduleService      │                       │
│              │  • notificationService  │                       │
│              └─────────────────────────┘                       │
│                             ↓                                   │
│              ┌─────────────────────────┐                       │
│              │  Sequelize ORM          │                       │
│              │  • Model Definitions    │                       │
│              │  • Relationships        │                       │
│              │  • Validations          │                       │
│              │  • Hooks (bcrypt)       │                       │
│              └─────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                             ↓
                        SQL Queries
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                            │
│                      (PostgreSQL)                               │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │    users     │  │ medications  │  │dose_schedules│        │
│  │              │  │              │  │              │        │
│  │ • id (PK)    │  │ • id (PK)    │  │ • id (PK)    │        │
│  │ • email      │  │ • user_id FK │  │ • med_id FK  │        │
│  │ • password   │  │ • drug_name  │  │ • date       │        │
│  │ • firstName  │  │ • dosage     │  │ • time       │        │
│  │ • lastName   │  │ • frequency  │  │ • status     │        │
│  │ • phone      │  │ • start_date │  │ • taken_at   │        │
│  │ • role       │  │ • end_date   │  │ • notes      │        │
│  │ • prefs      │  │ • stock      │  └──────────────┘        │
│  └──────────────┘  │ • color      │                          │
│                    │ • is_active  │  ┌──────────────┐        │
│                    └──────────────┘  │reminder_logs │        │
│                                      │              │        │
│                                      │ • id (PK)    │        │
│                                      │ • user_id FK │        │
│                                      │ • dose_id FK │        │
│                                      │ • type       │        │
│                                      │ • method     │        │
│                                      │ • status     │        │
│                                      │ • sent_at    │        │
│                                      └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌─────────┐                                            ┌─────────┐
│ Browser │                                            │  Server │
└────┬────┘                                            └────┬────┘
     │                                                      │
     │  POST /graphql                                      │
     │  mutation { signup(...) }                           │
     ├────────────────────────────────────────────────────>│
     │                                                      │
     │                              Validate Input ────────┤
     │                              Hash Password (bcrypt) │
     │                              Create User in DB      │
     │                              Generate JWT Token     │
     │                                                      │
     │  { token, user }                                    │
     │<────────────────────────────────────────────────────┤
     │                                                      │
     │  Store token in localStorage                        │
     │  Redirect to /dashboard                             │
     │                                                      │
     │  Subsequent Requests:                               │
     │  Authorization: Bearer <token>                      │
     ├────────────────────────────────────────────────────>│
     │                                                      │
     │                              Verify JWT Token ──────┤
     │                              Load User Context      │
     │                              Execute Resolver       │
     │                                                      │
     │  { data }                                           │
     │<────────────────────────────────────────────────────┤
     │                                                      │
```

### 2. Add Medication Flow

```
┌─────────┐                                            ┌─────────┐
│   User  │                                            │  System │
└────┬────┘                                            └────┬────┘
     │                                                      │
     │  Navigate to /medications/add                       │
     ├──────────────────────────────────────────────────> │
     │                                                      │
     │                                    Render Step 1 ───┤
     │  Fill in drug name, dosage, frequency               │
     │                                                      │
     │  Click "Next" ──────────────────────────────────>   │
     │                                                      │
     │                              Validate Step 1 ───────┤
     │                                    Render Step 2 ───┤
     │  Fill in dates, stock quantity                      │
     │                                                      │
     │  Click "Next" ──────────────────────────────────>   │
     │                                                      │
     │                              Validate Step 2 ───────┤
     │                                    Render Step 3 ───┤
     │  Add instructions, select color                     │
     │                                                      │
     │  Click "Add Medication" ─────────────────────────>  │
     │                                                      │
     │                              mutation addMedication │
     │                              ↓                      │
     │                              Create Medication ─────┤
     │                              ↓                      │
     │                              Generate Schedules ────┤
     │                              (scheduleService)      │
     │                              ↓                      │
     │                              Calculate dates based  │
     │                              on frequency           │
     │                              ↓                      │
     │                              Bulk insert doses ─────┤
     │                              into dose_schedules    │
     │                              ↓                      │
     │  Success! Redirect to /medications                  │
     │<─────────────────────────────────────────────────── │
     │                                                      │
```

### 3. Mark Dose as Taken Flow

```
┌─────────┐                                            ┌─────────┐
│   User  │                                            │  System │
└────┬────┘                                            └────┬────┘
     │                                                      │
     │  View Calendar or Dashboard                         │
     │                                                      │
     │  Click "Mark Taken" on a dose ──────────────────>   │
     │                                                      │
     │                              mutation markDoseAsTaken
     │                              ↓                      │
     │                              Find DoseSchedule ─────┤
     │                              ↓                      │
     │                              Verify ownership ──────┤
     │                              (user matches)         │
     │                              ↓                      │
     │                              Update status = taken ─┤
     │                              Set taken_at = now     │
     │                              ↓                      │
     │                              Decrement stock ───────┤
     │                              quantity              │
     │                              ↓                      │
     │                              Check if stock low ────┤
     │                              ↓                      │
     │                              (If low) Trigger ──────┤
     │                              refill reminder        │
     │                              ↓                      │
     │  UI updates with ✓ icon and timestamp              │
     │<─────────────────────────────────────────────────── │
     │                                                      │
     │  Dashboard stats auto-refresh                       │
     │  (via Apollo Client cache update)                   │
     │                                                      │
```

### 4. Adherence Statistics Calculation

```
┌─────────┐                                            ┌─────────┐
│Dashboard│                                            │  Server │
└────┬────┘                                            └────┬────┘
     │                                                      │
     │  query adherenceStats(startDate, endDate)           │
     ├────────────────────────────────────────────────────>│
     │                                                      │
     │                              Verify auth ───────────┤
     │                              ↓                      │
     │                              Query all doses ───────┤
     │                              for user in date range │
     │                              ↓                      │
     │                              Calculate: ────────────┤
     │                              • totalDoses = count   │
     │                              • takenDoses = where   │
     │                                status = 'taken'     │
     │                              • missedDoses = where  │
     │                                status = 'missed'    │
     │                              • adherenceRate =      │
     │                                (taken/total) * 100  │
     │                              ↓                      │
     │                              Calculate streaks: ────┤
     │                              • Sort by date         │
     │                              • Count consecutive    │
     │                                days with all taken  │
     │                              • Track current &      │
     │                                longest streak       │
     │                              ↓                      │
     │  { totalDoses, takenDoses, adherenceRate, ... }    │
     │<────────────────────────────────────────────────────┤
     │                                                      │
     │  Render stats with visual progress bars             │
     │                                                      │
```

## Component Interaction Map

### Frontend Component Hierarchy

```
App
├── ApolloProvider
    ├── BrowserRouter
        ├── Routes
            ├── Login (public)
            ├── Signup (public)
            ├── ProtectedRoute
                ├── Navigation
                │   ├── Logo
                │   ├── NavLinks
                │   └── LogoutButton
                │
                ├── Dashboard
                │   ├── StatsGrid
                │   │   ├── StatCard (Today's Doses)
                │   │   ├── StatCard (30-Day Adherence)
                │   │   └── StatCard (Current Streak)
                │   ├── AlertCard (Low Stock)
                │   └── DoseList (Today's Schedule)
                │
                ├── Medications
                │   ├── FilterTabs
                │   └── MedicationGrid
                │       └── MedicationCard[]
                │           ├── ColorBar
                │           ├── MedInfo
                │           └── Actions
                │
                ├── AddMedication
                │   ├── ProgressIndicator
                │   └── MultiStepForm
                │       ├── Step1 (Basic Info)
                │       ├── Step2 (Schedule)
                │       └── Step3 (Details)
                │
                └── Calendar
                    ├── WeekNavigator
                    ├── WeekCalendar
                    │   └── CalendarDay[]
                    └── DoseList
                        └── DoseCard[]
                            ├── MedInfo
                            ├── StatusIndicator
                            └── ActionButtons
```

### Backend Module Dependencies

```
index.js
├── database.js (config)
│   └── Sequelize instance
│
├── models/
│   ├── User.js
│   ├── Medication.js
│   ├── DoseSchedule.js
│   └── ReminderLog.js
│
├── middleware/
│   └── auth.js
│       ├── authMiddleware()
│       ├── requireAuth()
│       └── generateToken()
│
├── graphql/
│   ├── schema.js (typeDefs)
│   └── resolvers.js
│       ├── Query resolvers
│       ├── Mutation resolvers
│       └── Uses: models, auth, services
│
└── services/
    ├── scheduleService.js
    │   └── generateDoseSchedules()
    └── notificationService.js
        ├── sendDoseReminder()
        ├── sendRefillReminder()
        └── logReminder()
```

## Technology Stack Details

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 16+ | JavaScript runtime |
| Express.js | 4.18+ | Web framework |
| Apollo Server Express | 3.12+ | GraphQL server |
| GraphQL | 16.8+ | API query language |
| PostgreSQL | 13+ | Relational database |
| Sequelize | 6.35+ | ORM for database |
| bcryptjs | 2.4+ | Password hashing |
| jsonwebtoken | 9.0+ | JWT authentication |
| date-fns | 3.0+ | Date manipulation |
| dotenv | 16.3+ | Environment variables |
| cors | 2.8+ | Cross-origin requests |
| validator | 13.11+ | Input validation |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI framework |
| React Router DOM | 6.20+ | Client routing |
| Apollo Client | 3.8+ | GraphQL client |
| date-fns | 3.0+ | Date manipulation |
| CSS | 3 | Styling |

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Transport Layer                                     │
│     • HTTPS (production)                               │
│     • Secure cookies                                    │
│     • CORS configuration                               │
│                                                         │
│  2. Authentication Layer                               │
│     • JWT tokens (7-day expiry)                        │
│     • Password hashing (bcrypt, 10 rounds)             │
│     • Token verification on each request               │
│                                                         │
│  3. Authorization Layer                                │
│     • User context from JWT                            │
│     • Resource ownership checks                        │
│     • Role-based access (patient/caregiver)            │
│                                                         │
│  4. Input Validation                                   │
│     • Client-side validation (React)                   │
│     • Server-side validation (Sequelize)               │
│     • GraphQL schema validation                        │
│     • SQL injection prevention (ORM)                   │
│                                                         │
│  5. Data Protection                                    │
│     • User data isolation                              │
│     • No sensitive data in logs                        │
│     • Secure password comparison                       │
│     • XSS prevention (React escaping)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Recommended Production Setup

```
                       ┌──────────────┐
                       │   Cloudflare │
                       │   (CDN/SSL)  │
                       └──────┬───────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
         ┌──────▼──────┐           ┌───────▼────────┐
         │   Vercel    │           │    Heroku      │
         │  (Frontend) │           │   (Backend)    │
         │             │           │                │
         │  • React    │           │  • Node.js     │
         │  • Static   │           │  • Express     │
         │  • CDN      │           │  • Apollo      │
         └─────────────┘           └────────┬───────┘
                                            │
                                   ┌────────▼───────┐
                                   │   PostgreSQL   │
                                   │   (Heroku)     │
                                   │                │
                                   │  • Automated   │
                                   │    Backups     │
                                   │  • SSL         │
                                   └────────────────┘
```

## Performance Metrics

### Expected Response Times

| Operation | Target | Typical |
|-----------|--------|---------|
| Page Load | < 2s | ~1.5s |
| GraphQL Query | < 200ms | ~100ms |
| Database Query | < 100ms | ~50ms |
| UI Interaction | < 100ms | ~16ms |
| Authentication | < 500ms | ~300ms |

### Scalability Considerations

```
Current Capacity:
├── Users: 10,000+
├── Medications: 100,000+
├── Dose Schedules: 1,000,000+
└── Concurrent Users: 1,000+

Optimization Strategies:
├── Database Indexing (userId, dates)
├── Apollo Client Caching
├── Connection Pooling
├── Lazy Loading Components
└── Optimistic UI Updates

Future Enhancements:
├── Redis Caching
├── Read Replicas
├── CDN for Assets
├── Load Balancing
└── Horizontal Scaling
```

---

**Architecture Version**: 1.0  
**Last Updated**: December 2025  
**Status**: Production Ready
