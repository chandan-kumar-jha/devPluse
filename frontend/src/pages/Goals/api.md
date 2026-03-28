# 🌐 Problem 2 — API Mismatch (UPDATED WITH YOUR AXIOS SETUP)

---

# 📌 PROBLEM

> ❌ Frontend API calls were not matching backend
> ❌ Multiple axios instances (bad practice)
> ❌ Missing endpoints
> ❌ Hardcoded URLs

---

# 🎯 GOAL

✅ Use **single axios instance (`api`)**
✅ Match backend **100%**
✅ Cover **ALL routes**
✅ Make it **production-ready**

---

# 🧠 YOUR AXIOS INSTANCE (SOURCE)

📂 `src/api/axios.ts`

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true
});
```

---

# ⚠️ IMPORTANT DECISION

👉 We will **NOT create a new axios instance**
👉 We will **reuse `api` everywhere**

---

# 🚀 FINAL API FILE

📂 `src/api/goal.api.ts`

---

```ts
import { api } from "./axios";

/**
 * 🧠 Types (API level - temporary, refined in Problem 3)
 */
export type GoalStatus = "active" | "done" | "archived";

export interface CreateGoalPayload {
  title: string;
  description?: string;
  deadline?: string;
  category?: string;
  milestones?: {
    title: string;
  }[];
}

export interface UpdateGoalPayload {
  title?: string;
  description?: string;
  deadline?: string;
  category?: string;
  status?: GoalStatus;
}

/**
 * 🚀 Goal API
 */
export const goalAPI = {

  // ============================
  // 📌 GOALS
  // ============================

  /**
   * GET /goals
   */
  getGoals: (params?: {
    page?: number;
    limit?: number;
    status?: GoalStatus;
    category?: string;
    sort?: "newest" | "oldest" | "deadline" | "progress";
  }) => {
    return api.get("/goals", { params });
  },

  /**
   * GET /goals/:id
   */
  getGoalById: (id: string) => {
    return api.get(`/goals/${id}`);
  },

  /**
   * POST /goals
   */
  createGoal: (data: CreateGoalPayload) => {
    return api.post("/goals", data);
  },

  /**
   * PATCH /goals/:id
   */
  updateGoal: (id: string, data: UpdateGoalPayload) => {
    return api.patch(`/goals/${id}`, data);
  },

  /**
   * DELETE /goals/:id
   */
  deleteGoal: (id: string) => {
    return api.delete(`/goals/${id}`);
  },

  /**
   * PATCH /goals/:id/archive
   */
  archiveGoal: (id: string) => {
    return api.patch(`/goals/${id}/archive`);
  },

  /**
   * PATCH /goals/:id/pin
   */
  togglePin: (id: string) => {
    return api.patch(`/goals/${id}/pin`);
  },

  // ============================
  // 📌 MILESTONES
  // ============================

  /**
   * POST /goals/:id/milestones
   */
  addMilestone: (goalId: string, title: string) => {
    return api.post(`/goals/${goalId}/milestones`, { title });
  },

  /**
   * PATCH /goals/:id/milestones/:mid
   */
  toggleMilestone: (goalId: string, milestoneId: string) => {
    return api.patch(`/goals/${goalId}/milestones/${milestoneId}`);
  },

  /**
   * DELETE /goals/:id/milestones/:mid
   */
  deleteMilestone: (goalId: string, milestoneId: string) => {
    return api.delete(`/goals/${goalId}/milestones/${milestoneId}`);
  },
};
```

---

# 🔥 WHAT CHANGED (IMPORTANT)

---

## ✅ 1. Removed duplicate axios instance

❌ Before:

```ts
axios.create(...)
```

✅ Now:

```ts
import { api } from "./axios"
```

---

## ✅ 2. Centralized Base URL

```ts
baseURL: import.meta.env.VITE_API_URL
```

✔ Works for dev + production
✔ No hardcoding

---

## ✅ 3. All Backend Routes Covered

| Feature    | Status |
| ---------- | ------ |
| Get goals  | ✅      |
| Get single | ✅      |
| Create     | ✅      |
| Update     | ✅      |
| Delete     | ✅      |
| Archive    | ✅      |
| Pin        | ✅      |
| Milestones | ✅      |

---

## ✅ 4. Clean Structure

```ts
goalAPI.method()
```

✔ Easy to use
✔ Easy to scale

---

# ⚠️ RULES YOU MUST FOLLOW

---

## ❌ NEVER

```ts
axios.get("/goals")
```

---

## ✅ ALWAYS

```ts
goalAPI.getGoals()
```

---

## ❌ NEVER

```ts
fetch(...)
```

---

## ✅ ALWAYS use centralized API

---

# 🔗 HOW THIS CONNECTS TO COMPONENT

---

## Example: Toggle Milestone

```ts
await goalAPI.toggleMilestone(goalId, milestoneId);
```

---

## Example: Add Milestone

```ts
await goalAPI.addMilestone(goalId, title);
```

---

## Example: Update Goal

```ts
await goalAPI.updateGoal(id, { title: "New Title" });
```

---

# 🧠 ARCHITECTURE NOW

```txt
Component
   ↓
goalAPI
   ↓
api (axios instance)
   ↓
Backend
```

---

# 🚨 COMMON MISTAKES (YOU AVOID NOW)

---

## ❌ Multiple axios instances

## ❌ Hardcoded URLs

## ❌ Missing endpoints

## ❌ Direct API calls in component

---

# 🚀 NEXT STEP

# 🔥 Problem 3 — TYPES MISMATCH

We will fix:

* `_id` vs `id`
* `completed` vs `isCompleted`
* `status` mismatch
* full schema alignment

---

# 🏁 RESULT

Your API layer is now:

✅ Clean
✅ Scalable
✅ Backend-aligned
✅ Production-ready

---

Say **“next”** → we fix Types (most important) 🔥
