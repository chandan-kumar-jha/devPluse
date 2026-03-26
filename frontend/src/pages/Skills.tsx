import { motion, AnimatePresence, type Variants } from "motion/react";
import { 
  Terminal, LayoutDashboard,  Code2, 
  Bell, Settings, LogOut, Plus,  
  Search,  Star,  Trophy, X,  
  TrendingUp,
  Clock,
  Target,
  User,
  SettingsIcon,  } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";
import { useState } from "react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip as RechartsTooltip
} from "recharts";

// --- MOCK DATA ---
const radarData = [
  { subject: 'Frontend', A: 85, fullMark: 100 },
  { subject: 'Backend', A: 65, fullMark: 100 },
  { subject: 'DevOps', A: 40, fullMark: 100 },
  { subject: 'Database', A: 60, fullMark: 100 },
  { subject: 'Design', A: 45, fullMark: 100 },
  { subject: 'Architecture', A: 55, fullMark: 100 },
];

type Skill = {
  id: string;
  name: string;
  category: string;
  level: number;
  tier: string;
  xp: number;
  nextXp: number;
  endorsements: number;
  lastUsed: string;
};

const mockSkills: Skill[] = [
  { id: '1', name: "React", category: "Frontend", level: 15, tier: "Expert", xp: 3450, nextXp: 4000, endorsements: 12, lastUsed: "Today" },
  { id: '2', name: "Node.js", category: "Backend", level: 8, tier: "Intermediate", xp: 1200, nextXp: 1500, endorsements: 5, lastUsed: "Yesterday" },
  { id: '3', name: "TypeScript", category: "Frontend", level: 12, tier: "Advanced", xp: 2800, nextXp: 3000, endorsements: 8, lastUsed: "2 days ago" },
  { id: '4', name: "Docker", category: "DevOps", level: 4, tier: "Novice", xp: 450, nextXp: 800, endorsements: 1, lastUsed: "1 week ago" },
  { id: '5', name: "PostgreSQL", category: "Database", level: 7, tier: "Intermediate", xp: 1050, nextXp: 1200, endorsements: 3, lastUsed: "3 days ago" },
  { id: '6', name: "Figma", category: "Design", level: 5, tier: "Novice", xp: 600, nextXp: 1000, endorsements: 2, lastUsed: "1 month ago" },
];

const SKILL_CATEGORIES = ["All", "Frontend", "Backend", "DevOps", "Database", "Design", "Architecture"];
const SKILL_TIERS = ["All", "Novice", "Intermediate", "Advanced", "Expert", "Master"];

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }
};

// --- HELPERS ---
const getTierColor = (tier: string) => {
  switch(tier) {
    case 'Novice': return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'Intermediate': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Advanced': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Expert': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Master': return 'bg-amber-50 text-amber-700 border-amber-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const getCategoryColor = (category: string) => {
  switch(category) {
    case 'Frontend': return 'bg-pink-500';
    case 'Backend': return 'bg-emerald-500';
    case 'DevOps': return 'bg-orange-500';
    case 'Database': return 'bg-blue-500';
    case 'Design': return 'bg-purple-500';
    case 'Architecture': return 'bg-indigo-500';
    default: return 'bg-slate-500';
  }
};

export const Skills = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleLogout = () => navigate("/");

  const filteredSkills = mockSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;
    const matchesTier = selectedTier === "All" || skill.tier === selectedTier;
    return matchesSearch && matchesCategory && matchesTier;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans overflow-hidden">
      {/* Shimmer Effect Styles */}
      <style>{`
        @keyframes shimmer {
          100% { mask-position: 200% 0; }
        }
        .shimmer-mask {
          mask-image: linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.8) 50%, transparent 75%);
          mask-size: 250% 250%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white hidden md:flex flex-col z-20 relative">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Terminal className="text-white h-5 w-5" />
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">DevTrack</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Overview</p>
          
          <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${location.pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>

          <Link to="/sessions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <Clock className="h-5 w-5" /> Sessions
          </Link>
          <Link to="/goals" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <Target className="h-5 w-5" /> Goals
          </Link>
          <Link to="/skills" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <Code2 className="h-5 w-5" /> Skills
          </Link>

          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8">Account</p>
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <User className="h-5 w-5" /> Profile
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium transition-colors">
            <SettingsIcon className="h-5 w-5 text-indigo-600" /> Settings
          </Link>
          

          {/* <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8">Account</p>
          <Link to="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <Settings className="h-5 w-5" />
            Settings
          </Link> */}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative h-screen">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 z-10 shrink-0">
          <h1 className="text-lg font-semibold text-slate-800">Skill Tree</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 shadow-sm" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Top Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center min-h-75">
                <h3 className="font-semibold text-slate-800 self-start mb-2">Skill Radar</h3>
                <div className="w-full flex-1 min-h-62.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Skills" dataKey="A" stroke="#6366f1" fill="#818cf8" fillOpacity={0.5} />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-linear-to-br from-indigo-500 to-indigo-600 border border-indigo-400 rounded-xl p-6 text-white relative overflow-hidden">
                    <Trophy className="h-8 w-8 text-indigo-200 mb-4" />
                    <h2 className="text-3xl font-bold">9,600 XP</h2>
                    <p className="text-indigo-100 text-sm mb-6">Level 42 Full-Stack Dev</p>
                    <div className="w-full bg-indigo-900/30 rounded-full h-2">
                      <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="bg-white h-2 rounded-full" />
                    </div>
                 </div>

                 <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <h3 className="font-semibold text-slate-800 mb-4">Top Skills</h3>
                    <div className="space-y-3">
                      {mockSkills.slice(0, 2).map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between">
                          <span className="font-medium text-slate-700 text-sm">{skill.name}</span>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Lvl {skill.level}</span>
                        </div>
                      ))}
                    </div>
                    <button className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg font-medium transition-colors hover:bg-slate-800">
                      <Plus className="h-4 w-4" /> Add New Skill
                    </button>
                 </div>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 sticky top-0 z-10">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" placeholder="Search skills..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500">
                  {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500">
                  {SKILL_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Skill Grid */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map(skill => (
                <motion.div 
                  key={skill.id} variants={itemVariants}
                  onClick={() => setSelectedSkill(skill)}
                  whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm cursor-pointer relative overflow-hidden group"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${getCategoryColor(skill.category)}`}></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600">{skill.name}</h4>
                      <span className="text-xs text-slate-500 font-medium">{skill.category}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getTierColor(skill.tier)}`}>{skill.tier}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-bold text-slate-700">Lvl {skill.level}</span>
                      <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs font-bold">{skill.endorsements}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${(skill.xp / skill.nextXp) * 100}%` }}
                        className={`h-full shimmer-mask ${getCategoryColor(skill.category)}`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {selectedSkill && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSkill(null)} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl p-6">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedSkill.name}</h2>
                  <p className="text-slate-500">Expertise in {selectedSkill.category}</p>
                </div>
                <button onClick={() => setSelectedSkill(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">Progress to Next Level</span>
                  <span className="text-sm font-bold text-indigo-600">{selectedSkill.xp}/{selectedSkill.nextXp} XP</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(selectedSkill.xp / selectedSkill.nextXp) * 100}%` }} className={`h-full rounded-full ${getCategoryColor(selectedSkill.category)}`} />
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
                <TrendingUp className="h-5 w-5" /> Log Daily Session
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};