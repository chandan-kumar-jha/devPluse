Here's a clean GitHub README for DevPulse:

---

```markdown
# DevPulse

A full-stack developer progress tracker. Log sessions, set goals, track skills, and visualize your growth over time.

![Dashboard](https://github.com/user-attachments/assets/7667b219-c81e-4131-bc3e-799cc042f780)

## Features

- **Session logging** — Record what you worked on, how long, your mood, and skill tags
- **Goal tracking** — Set goals with milestones, track progress, mark complete or abandoned
- **Skill levels** — Track skill levels by category with progress bars and level-up system
- **Dashboard** — Bar chart of weekly hours, skill breakdown donut chart, recent sessions, active goals
- **JWT auth** — Secure login with httpOnly cookies, register/login/logout

## Tech Stack

**Frontend**
- React 19 + Vite + TypeScript
- Tailwind CSS v4
- Redux Toolkit (client state)
- TanStack Query v5 (server state)
- React Hook Form + Zod (form validation)
- Chart.js + react-chartjs-2

**Backend**
- Node.js + Express 5 + TypeScript
- MongoDB Atlas + Mongoose
- Zod v4 (schema validation)
- JWT (httpOnly cookies)
- bcryptjs, helmet, cors, morgan

## Screenshots

### Sessions
![Sessions](https://github.com/user-attachments/assets/44c7f2e0-900f-4262-b636-d53da2ea3d49)

### Goals
![Goals](https://github.com/user-attachments/assets/9f8369b8-6e32-46ab-b441-0194ab3015ac)

## Project Structure

```
devPlues/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── db/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── schemas/
│       └── server.ts
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       └── store/
└── package.json
```

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Setup

**1. Clone the repo**
```bash
git clone https://github.com/yourusername/devPluse.git
cd devPluse
```

**2. Backend env** — create `backend/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**3. Frontend env** — create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

**4. Install and run backend**
```bash
cd backend
npm install
npm run dev
```

**5. Install and run frontend**
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:5000`.

## Deployment

Deployed on **Render** as a single web service. The Express backend serves the built React frontend in production.

### Environment Variables (Render)

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Your secret key |

### Build & Start Commands

| | Command |
|--|---------|
| Build | `npm run build` |
| Start | `npm run start` |

## Live Demo

[https://devpluse.onrender.com](https://devpluse.onrender.com)

## License

MIT
```
