<img width="1260" height="284" alt="image" src="https://github.com/user-attachments/assets/550062bf-3f1e-40a6-b5c1-9356ddf9c97b" /># CampusIQ

CampusIQ is a real-time resource management and booking system designed to improve how shared campus infrastructure is utilized.

---

## Features

### Resource Management

* View live availability of labs, rooms, and equipment
* Real-time status updates (available / occupied)

<img width="1919" height="761" alt="image" src="https://github.com/user-attachments/assets/b4b26139-a1d5-42ee-ae12-29a3d313d57d" />
 <!-- replace with actual image -->

---

### Booking System

* Book resources using time slots
* Prevents double booking
* Updates instantly across users

<img width="453" height="533" alt="image" src="https://github.com/user-attachments/assets/93c9d7a8-b06c-4e91-a0a6-8252dce464de" />
<img width="1260" height="284" alt="image" src="https://github.com/user-attachments/assets/fe93d66c-ff8e-45ec-8689-03b1a2bf6336" />

<!-- replace with actual image -->

---

### Analytics

* No-show detection
* Resource utilization tracking
* Peak hour analysis
* Overbooking detection

<img width="1920" height="1821" alt="image" src="https://github.com/user-attachments/assets/faea1348-9899-4e84-8634-0751d66ecf71" />

 <!-- replace with actual image -->

---

### UI

* Dark / Light mode
* Smooth transitions and animations
* Responsive layout <!-- replace with actual image -->

---

## Tech Stack

* React
* Firebase (Auth + Firestore)
* TailwindCSS
* Framer Motion

## AI Tools

* Claude Opus 4.6
* GPT 5.4

---

## Setup

```bash
git clone <your-repo-url>
cd campusiq
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

---

## Build

```bash
npm run build
```

---

## Notes

* Uses Firestore for real-time data
* Resources are seeded once and stored permanently
* Analytics are computed from live booking data

---

## Author

Ashmit Kumar (23BCE10453)
Om Prasad (23BCG10091)
