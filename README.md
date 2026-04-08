# 🎓 CampusIQ — Campus Resource Optimizer

A production-ready web application for managing campus resources (labs, rooms, equipment) with real-time availability tracking, smart booking, and usage analytics.

**Built by Team TryCatch** 🚀

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Auth & DB | Firebase (Auth + Firestore) |
| Styling | TailwindCSS v4 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v7 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- A **Firebase project** with:
  - Authentication → Google sign-in & Email/Password enabled
  - Cloud Firestore database created

### 1. Clone the repository

```bash
git clone https://github.com/JustAsh123/CampusIQ-Team-TryCatch.git
cd CampusIQ-Team-TryCatch
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Copy the environment template and fill in your Firebase config:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase project credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> 💡 Find these values in your Firebase Console → Project Settings → General → Your apps → Web app → Config

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Generate demo data

After signing in, click the **"Generate Demo Data"** button on the Dashboard to populate Firestore with:
- 25 realistic campus resources (labs, rooms, equipment)
- ~70 booking records spanning the past 30 days and next 14 days

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI primitives
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   └── Loader.jsx
│   ├── layout/
│   │   ├── Navbar.jsx         # Responsive nav with mobile drawer
│   │   └── PageWrapper.jsx    # Layout wrapper with page transitions
│   ├── BookingModal.jsx       # Resource booking with slot picker
│   ├── ResourceCard.jsx       # Animated resource card
│   ├── ResourceFilters.jsx    # Type/status filter bar
│   ├── StatsCard.jsx          # Stats display card
│   └── ThemeToggle.jsx        # Dark/light mode toggle
├── pages/
│   ├── Landing.jsx            # Hero + features + CTA
│   ├── Login.jsx              # Google + email/password login
│   ├── Register.jsx           # Account registration
│   ├── Dashboard.jsx          # Overview + seed data + quick insights
│   ├── Resources.jsx          # Browse + search + filter + book
│   ├── Bookings.jsx           # User's bookings + cancel
│   └── Analytics.jsx          # Charts + usage insights
├── hooks/
│   ├── useResources.js        # Firestore resource queries
│   ├── useBookings.js         # Firestore booking queries
│   └── useAnalytics.js        # Computed analytics from data
├── services/
│   ├── firebase.js            # Firebase initialization
│   ├── authService.js         # Auth operations
│   ├── resourceService.js     # Resource CRUD
│   ├── bookingService.js      # Booking CRUD + conflict detection
│   └── seedService.js         # Demo data generator
├── context/
│   ├── AuthContext.jsx        # Auth state provider
│   └── ThemeContext.jsx       # Theme state provider
├── utils/
│   ├── constants.js           # App constants
│   └── helpers.js             # Utility functions
├── App.jsx                    # Root with routing + lazy loading
├── main.jsx                   # Entry point
└── index.css                  # Global styles + custom theme
```

---

## 🎨 Features

### 🏠 Landing Page
- Gradient hero section with animated stats
- Feature highlights with hover effects
- Professional SaaS-style design

### 🔐 Authentication
- Google Sign-In (popup)
- Email/Password registration & login
- Protected routes (auto-redirect to login)
- User avatar in navbar

### 📊 Dashboard
- Summary stats (total resources, available, active bookings, peak hour)
- Quick insights panel
- Recent bookings feed
- Available resources quick-access grid
- **Generate Demo Data** button for Firestore seeding

### 🏗️ Resource Browser
- Search by name, description, or location
- Filter by type (Lab/Room/Equipment) and status
- Animated resource cards with hover effects
- Click to book

### 📅 Booking System
- Visual time slot picker (8 AM – 8 PM)
- Date selection with future-only dates
- **Double-booking prevention** via Firestore query
- Booked slots greyed out
- Success confirmation animation
- Cancel confirmed bookings

### 📈 Analytics
- **Peak Usage Hours** — Bar chart
- **Most Popular Resources** — Horizontal bar chart
- **Weekly Availability Trends** — Line chart
- **Resource Type Distribution** — Donut chart
- Summary insight cards

### 🌙 Dark/Light Mode
- System preference detection
- Smooth CSS transitions
- LocalStorage persistence
- Animated toggle icon

---

## 🏗️ Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder, ready for Firebase Hosting or any static host.

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # Select 'dist' as public directory, configure as SPA
firebase deploy
```

---

## 🔒 Firestore Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /resources/{resourceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 📝 License

MIT © Team TryCatch
