## Before we get started, I have something to confess: I use ChatGPT for the backend. My primary stack is Frontend Development, and I’m familiar with two frameworks: ReactJS and Angular. So, I do know a little bit about backend development. I understand this may need to be validated according to your guidelines, but I hope your company will understand my situation.
Best regards,
ntnthao15102002@gmail.com

# Backend - Task Management App

Node.js + Express backend for a task management app with boards, cards, member invitations, and Firebase integration.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Available Scripts](#available-scripts)
- [Usage](#usage)

---

## Tech Stack

- **Node.js** with **Express**
- **Firebase Admin SDK** (Firestore & Authentication)
- **UUID** for unique IDs
- **CORS** for cross-origin requests

---

## Folder Structure

```
backend/
│
├─ controllers/       # Route handlers
├─ routes/            # Express route definitions
├─ services/          # Business logic / DB access
├─ config/            # Firebase setup, constants
├─ middlewares/       # Auth / error handling
├─ package.json
└─ server.ts          # Entry point
```

---

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Setup Firebase service account**
   Download your Firebase Admin SDK JSON file and store it securely (or set env variables).

3. **Setup environment variables** in `.env`:

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"
PORT=5000
```

> Make sure to wrap the private key in quotes and escape newlines (`\n`) properly.

4. **Start the server in development:**

```bash
npm run dev
```

---

## Environment Variables

| Key                   | Description                    |
| --------------------- | ------------------------------ |
| FIREBASE_PROJECT_ID   | Firebase project ID            |
| FIREBASE_CLIENT_EMAIL | Firebase service account email |
| FIREBASE_PRIVATE_KEY  | Firebase private key           |
| PORT                  | Backend server port            |

---

## API Endpoints

| Method | Route                     | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/cards/:cardId`          | Get card details         |
| POST   | `/cards`                  | Create a new card        |
| PUT    | `/cards/:cardId`          | Update a card            |
| DELETE | `/cards/:cardId`          | Delete a card            |
| POST   | `/boards/:boardId/invite` | Invite a user to a board |

> All endpoints require authentication via Firebase token (Bearer token in headers).

---

## Available Scripts

- `npm run dev` → Start server with nodemon (development)
- `npm start` → Start server (production)

---

## Usage

- Handles all CRUD operations for boards, cards, and members
- Invites users to boards by email, using Firebase UID or mock mapping
- Stores data in Firestore with timestamps and status flags

---

This backend README matches the frontend one, giving a **complete, professional guide for developers** to run your project.
