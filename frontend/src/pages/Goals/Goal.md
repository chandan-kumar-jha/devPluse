# 🧠 Full System Documentation — Goal & Milestone Tracker (Production-Level)

---

# 📌 OVERVIEW

This document explains **end-to-end architecture**:

```
Frontend (React Component)
   ↓
Zustand Store (State Management)
   ↓
API Layer (Axios)
   ↓
Backend Routes
   ↓
Controllers (Business Logic)
   ↓
Database (MongoDB via Mongoose)
```

---

# 🧩 BACKEND

---

## 📂 1. Controller (`goal.controller.ts`)

### 🔹 `createGoal`

```ts
POST /goals
```

### Flow:

1. Extract input (`CreateGoalInput`)
2. Get `userId` from `req.user`
3. Sanitize:

   * title
   * description
   * category
4. Transform milestones:

```ts
const milestones = (body.milestones || []).map((m, index) => ({
  title: sanitizeString(m.title),
  completed: false,
  order: m.order ?? index,
}))
```

5. Create goal:

```ts
await Goal.create({...})
```

6. Response:

```json
{
  success: true,
  message: "Goal created successfully.",
  data: { goal }
}
```

---

### 🔹 `listGoals`

```ts
GET /goals
```

### Features:

* Pagination
* Filtering (`status`, `category`)
* Sorting:

```ts
newest | oldest | deadline | progress
```

### Response:

```json
{
  goals,
  counts: { active, done, archived },
  pagination: { total, page, limit, totalPages }
}
```

---

### 🔹 `getGoal`

```ts
GET /goals/:id
```

* Validates ownership
* Returns single goal

---

### 🔹 `updateGoal`

```ts
PATCH /goals/:id
```

### Logic:

* Partial updates
* Sanitization
* Uses:

```ts
findByIdAndUpdate({ new: true })
```

---

### 🔹 `deleteGoal`

```ts
DELETE /goals/:id
```

### Important:

* Unlinks sessions:

```ts
Session.updateMany({ goalId }, { goalId: null })
```

---

### 🔹 `archiveGoal`

```ts
PATCH /goals/:id/archive
```

* Prevent double archive
* Unpins if pinned

---

### 🔹 `togglePin`

```ts
PATCH /goals/:id/pin
```

### Rules:

* Max 3 pinned goals
* Cannot pin archived

---

### 🔹 `addMilestone`

```ts
POST /goals/:id/milestones
```

* Adds milestone
* Recalculates progress

---

### 🔹 `toggleMilestone`

```ts
PATCH /goals/:id/milestones/:mid
```

### Logic:

* Toggle `completed`
* Recalculate progress
* Auto status:

```ts
100% → done
<100% → active
```

---

### 🔹 `deleteMilestone`

```ts
DELETE /goals/:id/milestones/:mid
```

* Removes milestone
* Updates progress

---

## 📂 2. Routes (`goal.routes.ts`)

### 🔐 Middleware Stack:

```
authenticate → validate → controller → asyncHandler
```

---

### Routes Mapping:

| Route                        | Method | Middleware           |
| ---------------------------- | ------ | -------------------- |
| `/goals`                     | GET    | auth                 |
| `/goals`                     | POST   | rateLimit + validate |
| `/goals/:id`                 | GET    | auth                 |
| `/goals/:id`                 | PATCH  | validate             |
| `/goals/:id`                 | DELETE | auth                 |
| `/goals/:id/archive`         | PATCH  | auth                 |
| `/goals/:id/pin`             | PATCH  | auth                 |
| `/goals/:id/milestones`      | POST   | validate             |
| `/goals/:id/milestones/:mid` | PATCH  | auth                 |
| `/goals/:id/milestones/:mid` | DELETE | auth                 |

---

### 🚫 Rate Limiter

```ts
max: 20 requests/hour (goal creation)
```

---

# 🎨 FRONTEND

---

## 📂 3. Types (`goal.type.ts`)

```ts
export interface Milestone {
  _id: string;
  title: string;
  completed: boolean;
  order?: number;
}

export interface Goal {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'active' | 'done' | 'archived';
  category: string;
  progress: number;
  milestones: Milestone[];
  pinned: boolean;
}
```

---

## 📂 4. API Layer (`goal.api.ts`)

### Purpose:

* Centralized HTTP logic
* Avoid duplication
* Maintain consistency

---

### Implementation:

```ts
const API_URL = import.meta.env.VITE_API_URL;

export const goalAPI = {
  getGoals: () =>
    axios.get(`${API_URL}/goals`, { withCredentials: true }),

  createGoal: (data) =>
    axios.post(`${API_URL}/goals`, data, { withCredentials: true }),

  updateGoal: (id, data) =>
    axios.patch(`${API_URL}/goals/${id}`, data, { withCredentials: true }),

  deleteGoal: (id) =>
    axios.delete(`${API_URL}/goals/${id}`, { withCredentials: true }),

  addMilestone: (goalId, title) =>
    axios.post(`${API_URL}/goals/${goalId}/milestones`, { title }, { withCredentials: true }),

  toggleMilestone: (goalId, mid) =>
    axios.patch(`${API_URL}/goals/${goalId}/milestones/${mid}`, {}, { withCredentials: true }),

  deleteMilestone: (goalId, mid) =>
    axios.delete(`${API_URL}/goals/${goalId}/milestones/${mid}`, { withCredentials: true }),
};
```

---

## 📂 5. Zustand Store (`useGoalStore.ts`)

---

### State:

```ts
goals: Goal[]
loading: boolean
error: string | null
```

---

### 🔹 `fetchGoals`

```ts
const res = await goalAPI.getGoals();
set({ goals: res.data.data.goals })
```

---

### 🔹 `addGoal`

```ts
const newGoal = res.data.data.goal;
set(state => ({ goals: [newGoal, ...state.goals] }))
```

---

### 🔹 `updateGoal`

```ts
map(g => g._id === id ? { ...g, ...updates } : g)
```

---

### 🔹 `deleteGoal`

```ts
filter(g => g._id !== id)
```

---

### 🔹 `toggleGoalStatus`

```ts
status: active ↔ done
```

---

### 🔹 `addMilestone`

```ts
const updatedGoal = res.data.data.goal;

set(state => ({
  goals: state.goals.map(g =>
    g._id === goalId ? updatedGoal : g
  )
}))
```

---

### 🔹 `toggleMilestone`

```ts
same pattern → replace full goal
```

---

### 🔹 `deleteMilestone`

```ts
same pattern → replace full goal
```

---

## ⚠️ Important Principle

👉 ALWAYS trust backend:

```
Never manually update progress or status in frontend
```

---

## 📂 6. Component (`Goals.tsx`)

---

## 🔴 BEFORE (Problem)

* Local state:

```ts
useState(initialGoals)
```

* No API
* No persistence

---

## 🟢 AFTER (Correct)

### Replace:

```ts
const { goals, fetchGoals, addMilestone, toggleMilestone } = useGoalStore();
```

---

### Fetch on mount:

```ts
useEffect(() => {
  fetchGoals();
}, []);
```

---

## 🔹 Goal Actions

### Create Goal:

```ts
await addGoal(data)
```

---

### Delete Goal:

```ts
await deleteGoal(id)
```

---

### Toggle Status:

```ts
await toggleGoalStatus(id)
```

---

## 🔹 Milestone Actions

### Add:

```ts
await addMilestone(goalId, title)
```

---

### Toggle:

```ts
await toggleMilestone(goalId, mid)
```

---

### Delete:

```ts
await deleteMilestone(goalId, mid)
```

---

## 🎯 UI Logic

---

### Progress Calculation:

```ts
progress = completed / total * 100
```

---

### Filtering:

```ts
goal.title.includes(searchQuery)
```

---

### Selection:

```ts
selectedGoalId
```

---

# 🔥 DATA FLOW (CRITICAL)

```
User Action (UI)
   ↓
Zustand Action
   ↓
API Call
   ↓
Backend Controller
   ↓
DB Update
   ↓
Response (updatedGoal)
   ↓
Zustand updates state
   ↓
UI re-renders
```

---

# ⚠️ COMMON PITFALLS (YOU AVOID NOW)

---

## ❌ Wrong route

```
/toggle ❌
```

## ✅ Correct

```
/milestones/:mid
```

---

## ❌ Manual state mutation

## ✅ Always use backend response

---

## ❌ Inconsistent API URL

## ✅ Centralized API layer

---

## ❌ Missing auth

## ✅ withCredentials: true

---

## ❌ Naming mismatch

| Frontend    | Backend   |
| ----------- | --------- |
| id          | _id       |
| isCompleted | completed |
| Active      | active    |

---

# 🚀 FINAL RESULT

You now have:

✅ Scalable architecture
✅ Clean separation of concerns
✅ Real backend integration
✅ Production-ready state management
✅ Correct API usage
✅ Strong typing

---

# 🧠 INTERVIEW LEVEL UNDERSTANDING

If asked:

👉 “How does your frontend sync with backend?”

Answer:

* Zustand manages state
* API layer abstracts HTTP
* Backend returns full updated resource
* Store replaces state immutably
* UI reacts to state changes

---

# 🏁 CONCLUSION

You moved from:

❌ Local mock app
➡️
✅ Full-stack production system

---

If you want next upgrade:

* 🔥 Optimistic UI
* 🔥 React Query migration
* 🔥 WebSocket real-time updates

Just tell me 🚀
