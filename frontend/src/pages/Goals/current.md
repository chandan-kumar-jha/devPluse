# 🧠 Component Refactor — Goals Module (Problem 1 Solved)

---

# 📌 PROBLEM 1

> ❌ Component is too big (monolithic)
> ✅ Requirement: Break into modular structure WITHOUT changing UI

---

# 🎯 FINAL STRUCTURE

```bash
src/
 └── pages/
      └── goal/
           ├── index.tsx          # 🔴 ENTRY POINT (container / orchestration)
           ├── GoalSidebar.tsx
           ├── GoalHeader.tsx
           ├── MilestoneRoadmap.tsx
           ├── CircularProgress.tsx
           └── components.md      # 📄 THIS DOCUMENT
```

---

# ⚠️ IMPORTANT RULE (FOLLOWED)

* ✅ UI unchanged
* ✅ Tailwind classes untouched
* ✅ Logic preserved
* ❌ No redesign
* ❌ No behavior change

---

# 🧩 COMPONENT BREAKDOWN (WHY THIS SPLIT)

---

## 1️⃣ `index.tsx` (ENTRY POINT)

### Role:

* Acts as **container**
* Manages:

  * selected goal
  * search
  * editing state
  * milestone input
* Passes data via props

---

### Example Structure:

```tsx
import { useState } from "react";
import { GoalSidebar } from "./GoalSidebar";
import { GoalHeader } from "./GoalHeader";
import { MilestoneRoadmap } from "./MilestoneRoadmap";
import type { Goal } from "../../types/goal.type";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  const selectedGoal = goals.find(g => g.id === selectedGoalId);

  // Placeholder handlers (will connect to Zustand later)
  const handleUpdate = (updates: Partial<Goal>) => {};
  const handleDelete = (id: string) => {};
  const handleToggleStatus = (id: string) => {};
  const handleToggleMilestone = (gId: string, mId: string) => {};
  const handleDeleteMilestone = (gId: string, mId: string) => {};
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex h-full">
      <GoalSidebar
        goals={goals}
        selectedGoalId={selectedGoalId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelect={setSelectedGoalId}
        onCreate={() => {}}
      />

      {selectedGoal && (
        <div className="flex-1 flex flex-col">
          <GoalHeader
            selectedGoal={selectedGoal}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />

          <MilestoneRoadmap
            selectedGoal={selectedGoal}
            newMilestoneTitle={newMilestoneTitle}
            setNewMilestoneTitle={setNewMilestoneTitle}
            onToggle={handleToggleMilestone}
            onDelete={handleDeleteMilestone}
            onAdd={handleAddMilestone}
          />
        </div>
      )}
    </div>
  );
}
```

---

# 🧱 COMPONENT DETAILS (LINE-BY-LINE INTENT)

---

## 2️⃣ `GoalSidebar.tsx`

### Responsibility:

* Display list of goals
* Search filtering
* Goal selection

---

### 🔥 Key Logic

```ts
const compCount = goal.milestones.filter(m => m.isCompleted).length;
```

👉 Counts completed milestones

```ts
const progress = total === 0 ? 0 : (compCount / total) * 100;
```

👉 Derived progress (⚠️ later replaced by backend)

---

### ⚠️ ISSUE FOUND

| Frontend      | Backend (Expected) |
| ------------- | ------------------ |
| `isCompleted` | `completed`        |
| `id`          | `_id`              |

📌 Will fix in **Problem 3 (Types)**

---

## 3️⃣ `GoalHeader.tsx`

### Responsibility:

* Display goal info
* Edit goal
* Delete / toggle status

---

### 🔥 Editing Mode

```tsx
<input value={selectedGoal.title} onChange={(e) => onUpdate({ title: e.target.value })} />
```

👉 Controlled input → updates parent

---

### 🔥 Status Toggle

```ts
onClick={() => onToggleStatus(selectedGoal.id)}
```

⚠️ Backend expects:

```bash
PATCH /goals/:id
```

---

### ⚠️ ISSUE FOUND

```ts
selectedGoal.status === 'Done'
```

❌ Backend:

```ts
'active' | 'done' | 'archived'
```

---

## 4️⃣ `MilestoneRoadmap.tsx`

### Responsibility:

* Show milestone timeline
* Add / delete / toggle

---

### 🔥 Toggle Logic

```ts
onClick={() => onToggle(selectedGoal.id, milestone.id)}
```

👉 Will map to:

```bash
PATCH /goals/:id/milestones/:mid
```

---

### ⚠️ ISSUE FOUND

| Frontend       | Backend     |
| -------------- | ----------- |
| `milestone.id` | `_id`       |
| `isCompleted`  | `completed` |

---

## 5️⃣ `CircularProgress.tsx`

### Responsibility:

* Visual progress indicator

---

### 🔥 Core Math

```ts
const circumference = 2 * Math.PI * radius;
const offset = circumference - (progress / 100) * circumference;
```

👉 SVG stroke animation

---

### Animation

```tsx
<motion.circle animate={{ strokeDashoffset: offset }} />
```

---

# 🚨 GLOBAL ISSUES FOUND (IMPORTANT)

---

## ❌ 1. ID Mismatch

| Current | Correct |
| ------- | ------- |
| `id`    | `_id`   |

---

## ❌ 2. Milestone Field Mismatch

| Current       | Correct     |
| ------------- | ----------- |
| `isCompleted` | `completed` |

---

## ❌ 3. Status Mismatch

| Current  | Correct  |
| -------- | -------- |
| `Done`   | `done`   |
| `Active` | `active` |

---

## ❌ 4. Progress Calculation (Frontend)

```ts
(completed / total) * 100
```

❌ Should NOT exist in frontend

✅ Backend already provides:

```ts
goal.progress
```

---

# 🧠 WHAT WE ACHIEVED

---

## BEFORE ❌

* One giant component
* Hard to maintain
* Mixed concerns

---

## AFTER ✅

* Clean separation:

  * Sidebar
  * Header
  * Roadmap
  * Progress
* Reusable components
* Easy to connect Zustand later

---

# 🔜 NEXT STEP

We move to:

# 🚀 Problem 2: API mismatch

We will:

* map ALL backend routes
* fix wrong endpoints
* create production API layer

---

# 🧩 NOTE FOR YOU

👉 DO NOT change component code yet
👉 Just understand structure

Next step will align:

* API
* Store
* Types

---

Ready for Problem 2 🚀
