# DevPulse Progress

## Last Updated
March 24, 2026

## Project Overview
Full-stack developer productivity tracker.
- **Live URL:** https://devpluse.onrender.com
- **GitHub:** https://github.com/corno25kumar-creator/devPluse
- **Status:** Backend complete — starting frontend

---

## Tech Stack

### Backend
- Node.js + Express 5 + TypeScript
- MongoDB Atlas + Mongoose
- Zod v4 (validation)
- bcryptjs (password + OTP + refresh token hashing)
- jsonwebtoken (JWT — access 15min + refresh 7d)
- httpOnly cookies (sameSite: lax)
- Nodemailer + Gmail SMTP (email)
- Cloudinary (avatar storage)
- multer + sharp (file upload + processing)
- express-rate-limit (rate limiting)
- sanitize-html (XSS prevention)
- Helmet (security headers)

### Frontend (not started)
- React 19 + Vite 8 + TypeScript
- Tailwind v4
- Redux Toolkit (authSlice, uiSlice, filterSlice)
- TanStack Query v5
- React Hook Form + Zod
- Chart.js + react-chartjs-2
- Axios (withCredentials + interceptor)

### Deployment
- Render (monorepo)
- MongoDB Atlas M0 (free)
- Cloudinary (free)

---

## Folder Structure

### Backend
```
backend/
  src/
    config/
      env.ts                  ✅ Zod env validation on startup
    db/
      dbConnection.ts         ✅ MongoDB connection + retry + DNS fix
    models/
      user.model.ts           ✅
      refreshToken.model.ts   ✅ TTL index auto-delete
      session.model.ts        ✅ text index for search
      goal.model.ts           ✅ embedded milestones
      skill.model.ts          ✅ XP thresholds + tier calc
      notification.model.ts   ✅ TTL 30 days
    schemas/
      auth.schema.ts          ✅
      profile.schema.ts       ✅
      session.schema.ts       ✅
      goal.schema.ts          ✅
      skill.schema.ts         ✅
    middleware/
      authenticate.ts         ✅ JWT cookie verification
      validate.ts             ✅ Zod middleware wrapper
      rateLimiter.ts          ✅ per-route limiters
      errorHandler.ts         ✅ AppError + central handler
      requestId.ts            ✅ UUID per request
    utils/
      generateTokens.ts       ✅ access + refresh JWT
      cookies.ts              ✅ setAuthCookies + clearAuthCookies
      otp.ts                  ✅ crypto.randomInt + bcrypt hash
      email.ts                ✅ Nodemailer + Gmail SMTP
      sanitize.ts             ✅ sanitize-html wrapper
      asyncHandler.ts         ✅ async error wrapper
      streak.ts               ✅ streak calc on create + delete
      xp.ts                   ✅ XP + level-up + notification
    controllers/
      auth.controller.ts      ✅
      profile.controller.ts   ✅
      session.controller.ts   ✅
      goal.controller.ts      ✅
      skill.controller.ts     ✅
      dashboard.controller.ts ✅
      notification.controller.ts ✅
      settings.controller.ts  ✅
    routes/
      auth.routes.ts          ✅
      profile.routes.ts       ✅
      session.routes.ts       ✅
      goal.routes.ts          ✅
      skill.routes.ts         ✅
      dashboard.routes.ts     ✅
      notification.routes.ts  ✅
      settings.routes.ts      ✅
    types/
      express.d.ts            ✅ req.user typed
    server.ts                 ✅
```

---

## API Endpoints — All Complete ✅

### Auth (11)
| Method | Route | Auth |
|--------|-------|------|
| POST | /auth/register | public |
| POST | /auth/verify-otp | public |
| POST | /auth/resend-otp | public |
| POST | /auth/login | public |
| POST | /auth/refresh | cookie |
| GET | /auth/me | private |
| DELETE | /auth/logout | private |
| DELETE | /auth/logout-all | private |
| POST | /auth/forgot-password | public |
| POST | /auth/reset-password | public |
| PATCH | /auth/change-password | private |

### Profile (6)
| Method | Route | Auth |
|--------|-------|------|
| GET | /profile/me | private |
| PATCH | /profile/me | private |
| POST | /profile/avatar | private |
| DELETE | /profile/avatar | private |
| DELETE | /profile/me | private |
| GET | /profile/:username | public |

### Sessions (5)
| Method | Route | Auth |
|--------|-------|------|
| GET | /sessions | private |
| POST | /sessions | private |
| GET | /sessions/:id | private |
| PATCH | /sessions/:id | private |
| DELETE | /sessions/:id | private |

### Goals (10)
| Method | Route | Auth |
|--------|-------|------|
| GET | /goals | private |
| POST | /goals | private |
| GET | /goals/:id | private |
| PATCH | /goals/:id | private |
| DELETE | /goals/:id | private |
| PATCH | /goals/:id/archive | private |
| PATCH | /goals/:id/pin | private |
| POST | /goals/:id/milestones | private |
| PATCH | /goals/:id/milestones/:mid | private |
| DELETE | /goals/:id/milestones/:mid | private |

### Skills (5)
| Method | Route | Auth |
|--------|-------|------|
| GET | /skills | private |
| POST | /skills | private |
| GET | /skills/:id | private |
| PATCH | /skills/:id | private |
| DELETE | /skills/:id | private |

### Dashboard (1)
| Method | Route | Auth |
|--------|-------|------|
| GET | /dashboard | private |

### Notifications (6)
| Method | Route | Auth |
|--------|-------|------|
| GET | /notifications | private |
| PATCH | /notifications/read-all | private |
| GET | /notifications/preferences | private |
| PATCH | /notifications/preferences | private |
| PATCH | /notifications/:id/read | private |
| DELETE | /notifications/:id | private |

### Settings (3)
| Method | Route | Auth |
|--------|-------|------|
| GET | /settings/privacy | private |
| PATCH | /settings/privacy | private |
| GET | /settings/export | private |

### Health (1)
| Method | Route | Auth |
|--------|-------|------|
| GET | /health | public |

**Total: 48 endpoints**

---

## Key Decisions

### Windows DNS Fix
```typescript
import { setServers } from 'node:dns/promises'
import dns from 'node:dns'
setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')
// + family: 4 in mongoose.connect options
```

### Auth Security
- Access token: JWT 15min — stateless verification
- Refresh token: JWT 7d — stored HASHED in DB (bcrypt rounds 10)
- httpOnly cookies — JS cannot read
- Token rotation on every refresh
- Stolen token detection — wipes all tokens + security email
- Account lockout — 5 failed attempts → 15min lock
- OTP — crypto.randomInt + bcrypt hashed in DB
- Generic error messages — no user enumeration

### Email
- Nodemailer + Gmail SMTP
- Gmail App Password in EMAIL_PASS env var
- Works for any email address
- Templates: OTP verify, password reset, security alert

### Zod v4 Breaking Changes
- `required_error` → `error`
- `.issues` not `.errors`

### Express 5
- Async errors auto-caught — no try/catch needed
- asyncHandler wrapper still used for explicit catching
- Wildcard syntax: `/{*path}` not `*`

### Tailwind v4
- No config file — just `@import "tailwindcss"`
- Requires `--legacy-peer-deps`
- `@tailwindcss/vite` in vite.config.ts

### Mongoose
- `timestamps: true` on all schemas
- `toJSON` transform strips sensitive fields on User model
- TTL index on RefreshToken (expiresAt) + Notification (30 days)
- Text index on Session (title + notes) for search
- Milestone embedded in Goal — not separate collection

---

## Environment Variables Required

### Backend (.env)
```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://...../devpulse?appName=Cluster0
ACCESS_TOKEN_SECRET=64_char_hex
REFRESH_TOKEN_SECRET=different_64_char_hex
EMAIL_USER=your@gmail.com
EMAIL_PASS=16_digit_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Current Status

### Backend ✅ Complete
All 48 endpoints built, tested in Postman, working.

### Frontend ⏳ Not Started
Build order:
1. Vite + React + TypeScript setup
2. Tailwind v4 + folder structure
3. Redux store — authSlice, uiSlice, filterSlice
4. Axios instance + interceptor (token refresh)
5. Auth pages — Landing, Login, Register, OTP verify
6. Dashboard page
7. Sessions page
8. Goals page
9. Skills page
10. Profile + Settings pages

---

## Notes
- Render free tier cold starts — UptimeRobot ping /health every 5min
- Cloudinary free — 10GB storage, plenty for avatars
- Gmail SMTP — works for any email, no domain needed
- At deployment: set all env vars in Render dashboard
- refreshToken cookie path: '/auth/refresh' — scoped for security
- Frontend VITE_API_URL empty in .env.production for same-origin requests