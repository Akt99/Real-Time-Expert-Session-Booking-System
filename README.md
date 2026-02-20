# Real-Time Expert Session Booking System

A MERN-style app with:
- Expert listing (search, filter, pagination)
- Expert detail with real-time slot updates
- Booking form with validation
- My bookings by email
- Race-condition-safe slot booking

## Tech Stack
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.io
- Frontend: React (Vite), React Router, Socket.io client

## Project Structure

```text
/backend
  /src
    /config
    /controllers
    /middleware
    /models
    /routes
    /utils
/frontend
  /src
    /api
    /components
    /pages
    /styles
```

## Backend APIs
- `GET /experts?page=&limit=&search=&category=`
- `GET /experts/:id`
- `POST /bookings`
- `PATCH /bookings/:id/status`
- `GET /bookings?email=`

## Critical Behavior
- Double booking prevention: unique compound index on `(expertId, date, timeSlot)`.
- Real-time update: Socket.io event `slot_booked` emitted after successful booking.
- Error handling: validation + meaningful JSON errors.

### How Double Booking Is Prevented (Race Condition Safe)
- Added a unique compound index on booking slots:
  - `bookingSchema.index({ expertId: 1, date: 1, timeSlot: 1 }, { unique: true });`
- Why this solves race conditions:
  - Even if 2 requests hit at the same time, MongoDB allows only one insert for the same `(expertId, date, timeSlot)`.
  - The loser gets duplicate key error `11000`.
- Controller behavior:
  - In `bookingController.js`, `createBooking` catches `error.code === 11000` and returns:
  - HTTP `409 Conflict`
  - message: `"This slot is already booked. Please choose another slot."`

## Setup MongoDB

### Option A: Local MongoDB (macOS with Homebrew)
1. Install MongoDB Community Edition:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community@7.0
   ```
2. Start MongoDB service:
   ```bash
   brew services start mongodb-community@7.0
   ```
3. Verify MongoDB is running:
   ```bash
   mongosh --eval "db.runCommand({ ping: 1 })"
   ```
4. Use this backend env value:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/expert_booking
   ```

### Option B: MongoDB Atlas (Cloud)
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create DB user and password.
3. In Network Access, allow your IP (or `0.0.0.0/0` for testing only).
4. Copy connection string and set in backend `.env`:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/expert_booking?retryWrites=true&w=majority
   ```

## Run the App

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

### 2) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Notes
- Seed data includes sample experts and slots.
- Booking statuses: `Pending`, `Confirmed`, `Completed`.
- If two users submit the same slot at the same time, one succeeds and one gets `409 Conflict`.
