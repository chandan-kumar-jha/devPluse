import { useState } from "react";
import { format} from "date-fns";
import { Plus } from "lucide-react";
// ── Types mapping to the provided Mongoose Schema ─────────────
type Session = {
  id: string; // Maps to mongoose _id
  title: string;
  duration: number; // minutes, 1 to 1440
  date: string; // ISO Date string
  notes?: string;
  tags: string[]; // max 10
  goalId?: string | null;
  skillId?: string | null;
  createdAt?: string;
};


function Header() {
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [tagInput, setTagInput] = useState("");
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [formError, setFormError] = useState("");
    const [timerSeconds, setTimerSeconds] = useState(0);
      const [formData, setFormData] = useState({
        title: "",
        duration: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: "",
        tags: [] as string[],
        goalId: "",
        skillId: ""
      });

  const openLogModal = (session?: Session) => {
    setFormError("");
    setTagInput("");
    if (session) {
      setEditingSessionId(session.id);
      setFormData({
        title: session.title,
        duration: session.duration,
        date: session.date.split('T')[0],
        notes: session.notes || "",
        tags: session.tags || [],
        goalId: session.goalId || "",
        skillId: session.skillId || ""
      });
    } else {
      setEditingSessionId(null);
      setFormData({
        title: "",
        duration: Math.max(1, Math.floor(timerSeconds / 60)), // Pre-fill with timer or minimum 1
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: "",
        tags: [],
        goalId: "",
        skillId: ""
      });
    }
    setIsLogModalOpen(true);
  };



  return (
    <div>
       <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-10 shrink-0">
          <h1 className="text-lg font-semibold text-slate-800">Session Timeline</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => openLogModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> Log Session
            </button>
          </div>
        </header>
    </div>
  )
}

export default Header
