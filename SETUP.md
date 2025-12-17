# 🏥 MediReminder - Quick Setup Guide

## What You've Got

A complete, production-ready healthcare medication management system with:

✅ **Backend**: Node.js + Express + Apollo GraphQL + PostgreSQL  
✅ **Frontend**: React + Apollo Client + Responsive UI  
✅ **Security**: JWT authentication + bcrypt password hashing  
✅ **Features**: Medication tracking, adherence analytics, calendar view, reminders

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install PostgreSQL

**macOS (using Homebrew)**:
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Or download**: https://www.postgresql.org/download/

### Step 2: Create Database

```bash
# Open PostgreSQL terminal
psql postgres

# Create database
CREATE DATABASE medireminder;

# Exit
\q
```

### Step 3: Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your PostgreSQL password
# nano .env  (or use any text editor)
```

### Step 4: Install Dependencies

```bash
# Install both backend and frontend dependencies
npm run install:all
```

This will take 2-3 minutes. Get a coffee! ☕

### Step 5: Start the Application

**Option A - Start Everything at Once**:
```bash
npm run dev:full
```

**Option B - Start Separately** (in two terminals):

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run client
```

### Step 6: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **GraphQL Playground**: http://localhost:4000/graphql

---

## 📝 First Time Setup

1. Go to http://localhost:3000
2. Click "Sign up"
3. Create your account
4. Add your first medication
5. Start tracking!

---

## 🎯 Key Features to Test

### 1. Add a Medication
- Navigate to "Medications" → "Add Medication"
- Follow the 3-step wizard
- Try different frequencies and dosages

### 2. View Dashboard
- See today's doses
- Check 30-day adherence stats
- Monitor your streak

### 3. Use Calendar
- Navigate to "Calendar"
- Mark doses as taken/missed/skipped
- Browse different days

### 4. Track Adherence
- Dashboard shows real-time stats
- Visual progress bars
- Streak tracking for motivation

---

## 🛠 Troubleshooting

### Database Connection Error?
```bash
# Check PostgreSQL is running
brew services list

# Restart if needed
brew services restart postgresql@14
```

### Port Already in Use?
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Error?
```bash
# Clean install
rm -rf node_modules client/node_modules
npm run install:all
```

---

## 📚 Project Structure

```
medireminder/
├── server/                 # Backend (Node.js + Express + Apollo)
│   ├── config/            # Database configuration
│   ├── models/            # Sequelize models (User, Medication, etc.)
│   ├── graphql/           # GraphQL schema & resolvers
│   ├── middleware/        # Authentication middleware
│   ├── services/          # Business logic (schedules, notifications)
│   └── index.js           # Server entry point
│
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── apollo/        # Apollo Client setup
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── graphql/       # GraphQL queries & mutations
│   │   ├── utils/         # Helper functions
│   │   └── App.js         # Main React component
│   └── public/
│
├── .env                   # Environment variables (create from .env.example)
├── package.json           # Root dependencies & scripts
└── FEATURES.md            # Detailed feature documentation
```

---

## 🔐 Default Configuration

**Backend Port**: 4000  
**Frontend Port**: 3000  
**Database**: medireminder  
**JWT Expiration**: 7 days  

---

## 📖 Documentation

For detailed feature documentation, see: [FEATURES.md](./FEATURES.md)

---

## 🎨 Technology Stack

### Backend
- **Framework**: Express.js
- **GraphQL**: Apollo Server
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT + bcrypt
- **Date Handling**: date-fns

### Frontend
- **Framework**: React 18
- **State Management**: Apollo Client
- **Routing**: React Router v6
- **Styling**: Custom CSS with CSS Variables
- **Date Handling**: date-fns

### Key Features
- Clean Architecture
- Accessibility-First UI (WCAG AA)
- Responsive Design (Mobile + Desktop)
- Real-time Data Updates
- Secure Authentication
- Input Validation (Client + Server)

---

## 🚢 Production Deployment

### Backend Options
- Heroku
- AWS (EC2 + RDS)
- DigitalOcean
- Railway

### Frontend Options
- Vercel (Recommended)
- Netlify
- AWS S3 + CloudFront

### Database
- Heroku Postgres
- AWS RDS
- DigitalOcean Managed Database

---

## 🔮 Future Enhancements

Ready to integrate:
- SendGrid for email notifications
- Twilio for SMS reminders
- Firebase for push notifications
- Recharts for advanced analytics
- Image upload for medication photos

---

## 💡 Tips for Development

1. **GraphQL Playground**: Use http://localhost:4000/graphql to test queries
2. **React DevTools**: Install browser extension for debugging
3. **Apollo DevTools**: Monitor GraphQL cache and queries
4. **Database GUI**: Use TablePlus or pgAdmin to view data

---

## ✅ Checklist

Before considering it "done":
- [ ] Can create account and login
- [ ] Can add a medication
- [ ] Can view medications list
- [ ] Can mark doses as taken
- [ ] Can view calendar
- [ ] Dashboard shows statistics
- [ ] Low stock alerts appear
- [ ] Can delete medication

---

## 🤝 Need Help?

1. Check [FEATURES.md](./FEATURES.md) for detailed documentation
2. Review the code comments (they're extensive!)
3. Test GraphQL queries in the playground
4. Check the browser console for errors

---

## 🎉 You're All Set!

The application is production-ready and follows healthcare best practices:
- ✅ Clean, maintainable code
- ✅ Secure authentication
- ✅ Accessible UI (screen reader friendly)
- ✅ Input validation
- ✅ Responsive design
- ✅ Real-time updates
- ✅ Comprehensive documentation

**Happy coding!** 🚀
