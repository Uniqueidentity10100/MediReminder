# MediReminder - Feature Documentation

## Table of Contents
1. [Authentication System](#authentication-system)
2. [Medication Management](#medication-management)
3. [Dose Scheduling](#dose-scheduling)
4. [Adherence Tracking](#adherence-tracking)
5. [Dashboard Analytics](#dashboard-analytics)
6. [Notification System](#notification-system)
7. [User Interface Components](#user-interface-components)

---

## Authentication System

### Overview
Secure JWT-based authentication system that protects user health data and enables personalized medication management.

### Backend Implementation

**Location**: `server/middleware/auth.js`, `server/graphql/resolvers.js`

**Key Features**:
- Password hashing with bcrypt (10 salt rounds)
- JWT token generation with 7-day expiration
- Token-based authentication middleware
- Secure password comparison

**GraphQL Mutations**:

```graphql
mutation Signup {
  signup(
    email: "patient@example.com"
    password: "securepass123"
    firstName: "John"
    lastName: "Doe"
    phoneNumber: "+1234567890"
  ) {
    token
    user {
      id
      email
      firstName
      lastName
    }
  }
}

mutation Login {
  login(
    email: "patient@example.com"
    password: "securepass123"
  ) {
    token
    user {
      id
      email
      firstName
    }
  }
}
```

**Security Features**:
- Passwords never stored in plain text
- Email validation
- Password minimum length requirement (6 characters)
- Automatic token expiration
- Protected routes with authentication checks

### Frontend Implementation

**Location**: `client/src/pages/Login/`, `client/src/pages/Signup/`

**User Experience**:
- Clean, accessible login/signup forms
- Real-time validation with helpful error messages
- Friendly micro-copy ("Welcome back", "Start managing your medications")
- Responsive design for mobile and desktop
- Auto-redirect after successful authentication

**Local Storage**:
- JWT token stored securely in localStorage
- Token automatically sent with all GraphQL requests
- Logout clears token and redirects to login

---

## Medication Management

### Overview
Comprehensive medication tracking with validation, customization, and safety features.

### Database Model

**Location**: `server/models/Medication.js`

**Fields**:
- `drugName`: Medication name (required, 2-100 characters)
- `dosageValue`: Numeric dosage amount (decimal precision)
- `dosageUnit`: Unit type (mg, tablet, ml, etc.)
- `frequency`: How often medication is taken
- `startDate`: When to begin taking medication
- `endDate`: Optional end date for treatment
- `instructions`: Special instructions (e.g., "Take with food")
- `prescribedBy`: Doctor's name (optional)
- `stockQuantity`: Current medication supply
- `refillThreshold`: Alert when stock falls below this number
- `isActive`: Whether medication is currently active
- `color`: Visual identifier for UI

### Adding Medications

**Location**: `client/src/pages/AddMedication/`

**Multi-Step Form**:

**Step 1: Basic Information**
- Medication name
- Dosage amount and unit
- Frequency selection

**Step 2: Schedule & Duration**
- Start date
- End date (optional)
- Current stock quantity
- Refill alert threshold

**Step 3: Additional Details**
- Prescribing doctor
- Special instructions
- Color selection for visual identification

**Validation**:
- Required fields clearly marked
- Real-time error messages
- Prevents invalid dosages (must be > 0)
- Ensures end date is after start date
- User-friendly error messages

### Viewing Medications

**Location**: `client/src/pages/Medications/`

**Features**:
- Filter by Active/Inactive/All
- Color-coded medication cards
- Stock level warnings (⚠️ when low)
- Quick actions: Deactivate/Activate, Delete
- Detailed information display

**GraphQL Query**:

```graphql
query GetMedications($isActive: Boolean) {
  medications(isActive: $isActive) {
    id
    drugName
    dosageValue
    dosageUnit
    frequency
    startDate
    endDate
    instructions
    stockQuantity
    refillThreshold
    isActive
    color
  }
}
```

---

## Dose Scheduling

### Overview
Automatic generation of dose schedules based on medication frequency with intelligent time slot assignment.

### Schedule Generation Service

**Location**: `server/services/scheduleService.js`

**How It Works**:

1. When medication is added, system generates all scheduled doses
2. Frequency determines number of daily doses and timing:
   - `once_daily`: 8:00 AM
   - `twice_daily`: 8:00 AM, 8:00 PM
   - `three_times_daily`: 8:00 AM, 2:00 PM, 8:00 PM
   - `four_times_daily`: 8:00 AM, 12:00 PM, 4:00 PM, 8:00 PM
   - `every_6_hours`: 6:00 AM, 12:00 PM, 6:00 PM, 12:00 AM
   - `weekly`: Once per week at 8:00 AM
   - `monthly`: Once per month at 8:00 AM

3. Schedules created from start date to end date (or 90 days if no end date)
4. Each schedule entry tracks: date, time, status, notes

**Database Model**:

**Location**: `server/models/DoseSchedule.js`

**Status Types**:
- `pending`: Not yet taken
- `taken`: Successfully taken
- `missed`: User marked as missed
- `skipped`: User chose to skip this dose

**Methods**:
- `markAsTaken()`: Updates status, records timestamp, decrements stock
- `markAsMissed()`: Updates status, preserves notes
- Status changes trigger adherence recalculation

---

## Adherence Tracking

### Overview
Comprehensive tracking and analytics to help patients understand and improve medication adherence.

### Backend Calculation

**Location**: `server/graphql/resolvers.js`

**Metrics Calculated**:

1. **Adherence Rate**: (Taken doses / Total doses) × 100
2. **Current Streak**: Consecutive days with all doses taken
3. **Longest Streak**: Best consecutive days record
4. **Daily Breakdown**: Per-day statistics for any date range

**GraphQL Query**:

```graphql
query GetAdherenceStats($startDate: Date!, $endDate: Date!) {
  adherenceStats(startDate: $startDate, endDate: $endDate) {
    totalDoses
    takenDoses
    missedDoses
    adherenceRate
    currentStreak
    longestStreak
  }
}

query GetDailyAdherence($startDate: Date!, $endDate: Date!) {
  dailyAdherence(startDate: $startDate, endDate: $endDate) {
    date
    totalDoses
    takenDoses
    missedDoses
    adherenceRate
  }
}
```

### Calendar View

**Location**: `client/src/pages/Calendar/`

**Features**:
- Weekly calendar view with navigation
- Visual progress indicators for each day
- Color-coded dose status:
  - ✓ Green: Taken
  - ✗ Red: Missed
  - ⊘ Orange: Skipped
  - ○ Gray: Pending
- Quick actions to mark doses
- Detailed dose information
- Time tracking for when doses were taken

**User Actions**:
- Mark as Taken (with timestamp)
- Mark as Missed
- Skip dose
- Add notes to any dose

---

## Dashboard Analytics

### Overview
At-a-glance view of medication adherence, upcoming doses, and important alerts.

### Dashboard Components

**Location**: `client/src/pages/Dashboard/`

**Key Sections**:

1. **Today's Progress**
   - Visual progress bar
   - Count: X of Y doses taken
   - Percentage completion

2. **30-Day Statistics**
   - Overall adherence rate
   - Total doses taken vs. scheduled
   - Clear, easy-to-read format

3. **Current Streak**
   - Days of consecutive adherence
   - Best streak achievement
   - Gamification element for motivation

4. **Low Stock Alerts**
   - ⚠️ Highlighted medications
   - Shows remaining doses
   - Proactive refill reminders

5. **Today's Schedule**
   - All scheduled doses for current day
   - Sortable by time
   - Quick status view
   - One-tap access to calendar

**Data Refresh**:
- Real-time updates using Apollo Client
- Cache-and-network fetch policy
- Automatic refetch after mutations

---

## Notification System

### Overview
Multi-channel notification system for dose reminders and refill alerts (currently stubbed for mock implementation).

### Service Implementation

**Location**: `server/services/notificationService.js`

**Notification Types**:

1. **Dose Reminders**
   - Sent at scheduled dose time
   - Contains medication name and dosage
   - Respects user preferences

2. **Refill Alerts**
   - Triggered when stock ≤ refill threshold
   - Sent once per medication
   - Includes current stock level

3. **Adherence Reports**
   - Weekly summary (future feature)
   - Motivational messages

**Delivery Methods**:
- Email (via SendGrid in production)
- SMS (via Twilio in production)
- Push notifications (future feature)

**User Preferences**:

**Location**: `server/models/User.js`

```javascript
notificationPreferences: {
  email: true,
  sms: false,
  push: true
}
```

**Mock Implementation**:
- Console logs instead of actual delivery
- Records all notifications in database
- Full structure ready for production integration

### Reminder Logging

**Location**: `server/models/ReminderLog.js`

**Purpose**:
- Audit trail of all notifications
- Debugging delivery issues
- User notification history
- Compliance and reporting

---

## User Interface Components

### Overview
Reusable, accessible UI components following healthcare design best practices.

### Component Library

**Location**: `client/src/components/`

**1. Button Component**
- Variants: primary, secondary, danger, outline
- Sizes: small, medium, large
- Minimum 44px tap target (accessibility)
- Clear hover and focus states
- Disabled state support

**2. Input Component**
- Built-in label and error message display
- Required field indicator (*)
- ARIA attributes for screen readers
- Validation feedback
- Auto-focus support

**3. Select Component**
- Accessible dropdown
- Custom styling
- Placeholder support
- Keyboard navigation
- Required field validation

**4. Card Component**
- Consistent shadow and border radius
- Clickable variant with hover effects
- Flexible content container
- Used throughout application

**5. Loading Component**
- Animated spinner
- Customizable message
- ARIA live region for screen readers
- Prevents interaction during loading

**6. Navigation Component**
- Sticky header
- Active page indicator
- Responsive mobile menu
- Logout functionality
- Icon + text labels

### Design System

**Location**: `client/src/index.css`

**CSS Variables**:
```css
--primary-color: #4A90E2 (Blue)
--secondary-color: #50C878 (Green)
--danger-color: #E74C3C (Red)
--warning-color: #F39C12 (Orange)
--background: #F5F7FA
--surface: #FFFFFF
--text-primary: #2C3E50
--text-secondary: #7F8C8D
```

**Accessibility Features**:
- High contrast mode support
- Reduced motion support
- Clear focus indicators (3px outline)
- Minimum color contrast ratios (WCAG AA)
- Large tap targets (44px minimum)
- Semantic HTML
- ARIA labels and roles

**Responsive Design**:
- Mobile-first approach
- Breakpoints at 768px
- Flexible grid layouts
- Touch-friendly controls
- Readable fonts at all sizes

### Form Patterns

**Multi-Step Forms**:
- Progress indicator
- Back navigation
- Step validation
- Smooth transitions
- Clear error messaging

**Validation Strategy**:
- Real-time validation (as user types)
- Submit validation (before sending)
- Server-side validation (GraphQL layer)
- User-friendly error messages
- No technical jargon

---

## API Documentation

### GraphQL Endpoint

**URL**: `http://localhost:4000/graphql`

**Authentication**: 
- Include JWT token in Authorization header
- Format: `Bearer <token>`

### Available Operations

**Queries**:
- `me`: Get current user information
- `medications(isActive)`: List medications
- `medication(id)`: Get single medication
- `doseSchedules(startDate, endDate)`: Get schedules for date range
- `doseSchedulesForToday`: Today's doses
- `adherenceStats(startDate, endDate)`: Adherence statistics
- `dailyAdherence(startDate, endDate)`: Daily breakdown
- `reminderLogs(limit)`: Notification history

**Mutations**:
- `signup`: Create new user account
- `login`: Authenticate user
- `addMedication`: Add new medication
- `updateMedication`: Modify medication
- `deleteMedication`: Remove medication
- `markDoseAsTaken`: Record dose taken
- `markDoseAsMissed`: Mark dose missed
- `markDoseAsSkipped`: Skip dose

---

## Security Best Practices

### Implemented Security Measures

1. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Minimum length requirement
   - Never exposed in API responses

2. **Token Management**
   - JWT with expiration
   - Secure token generation
   - Token validation on every request

3. **Input Validation**
   - Client-side validation
   - Server-side validation
   - SQL injection prevention (Sequelize ORM)
   - XSS prevention (React auto-escaping)

4. **Data Protection**
   - User data isolation (queries filtered by userId)
   - No sensitive data in error messages
   - Secure password comparison timing

5. **API Security**
   - CORS enabled with restrictions
   - Rate limiting ready (production recommendation)
   - GraphQL depth limiting (production recommendation)

---

## Deployment Guide

### Prerequisites
- Node.js 16+
- PostgreSQL 13+
- npm or yarn

### Environment Variables

**Backend** (`.env`):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medireminder
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
PORT=4000
NODE_ENV=production
```

**Frontend** (`client/.env`):
```
REACT_APP_GRAPHQL_URI=https://your-api.com/graphql
```

### Installation Steps

1. Clone repository
2. Install dependencies: `npm run install:all`
3. Create PostgreSQL database
4. Configure environment variables
5. Start backend: `npm run dev`
6. Start frontend: `npm run client`
7. Access at http://localhost:3000

### Production Deployment

**Backend**:
- Deploy to Heroku, AWS, or DigitalOcean
- Use managed PostgreSQL (AWS RDS, Heroku Postgres)
- Enable SSL for database connection
- Set NODE_ENV=production
- Implement rate limiting
- Add monitoring (Sentry, DataDog)

**Frontend**:
- Build: `npm run build`
- Deploy to Vercel, Netlify, or S3
- Configure CDN
- Enable HTTPS
- Update CORS settings

---

## Future Enhancements

### Planned Features

1. **Real Notification Integration**
   - SendGrid email integration
   - Twilio SMS integration
   - Web push notifications

2. **Caregiver Access**
   - Share medication lists
   - Read-only access for family
   - Multi-user support

3. **Advanced Analytics**
   - Charts and graphs (recharts)
   - Medication interaction warnings
   - Prescription history

4. **Mobile App**
   - React Native version
   - Offline support
   - Camera for prescription scanning

5. **Doctor Portal**
   - Prescribe medications remotely
   - View patient adherence
   - Adjust dosages

---

## Testing

### Recommended Test Coverage

1. **Unit Tests**
   - Model validation
   - Utility functions
   - Component rendering

2. **Integration Tests**
   - GraphQL resolvers
   - Authentication flow
   - Medication CRUD operations

3. **End-to-End Tests**
   - User registration and login
   - Add and manage medications
   - Mark doses as taken
   - View adherence statistics

### Testing Tools
- Jest for unit tests
- React Testing Library for components
- Apollo Client Mock Provider for GraphQL
- Supertest for API testing

---

## Support and Maintenance

### Monitoring
- Log all errors to console (production: use service like Sentry)
- Track GraphQL errors
- Monitor database performance
- User feedback collection

### Backup Strategy
- Daily database backups
- Keep 30 days of backups
- Test restore procedures
- Export user data on request

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Application Version**: 1.0.0
