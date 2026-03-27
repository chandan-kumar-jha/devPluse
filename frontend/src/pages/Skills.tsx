import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, LayoutDashboard, Target, Code2, 
  Bell, Settings, LogOut, Plus, ChevronDown, 
  Search, Filter, Star, Clock, Trophy, X, Edit2, Trash2,
  TrendingUp, Award
} from "lucide-react";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Prevent multiple radars rendering with identical auto-generated IDs inside Recharts
  const radarChartId = "skill-radar-chart";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans overflow-hidden">
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
            <LayoutDashboard className={`h-5 w-5 ${location.pathname === '/dashboard' ? 'text-indigo-600' : ''}`} />
            Dashboard
          </Link>
          <Link to="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <Clock className="h-5 w-5" />
            Sessions
          </Link>
          <Link to="/goals" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <Target className="h-5 w-5" />
            Goals
          </Link>
          <Link to="/skills" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${location.pathname === '/skills' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Code2 className={`h-5 w-5 ${location.pathname === '/skills' ? 'text-indigo-600' : ''}`} />
            Skills
          </Link>

          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8">Account</p>
          <Link to="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 z-10 flex-shrink-0">
          <div className="flex items-center md:hidden">
             <Terminal className="text-indigo-600 h-6 w-6" />
          </div>
          
          <div className="hidden md:flex items-center gap-3">
             <h1 className="text-lg font-semibold text-slate-800">Skill Tree</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 cursor-pointer group">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-sm" />
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Top Section: Radar Chart & High Level Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Radar Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-1 flex flex-col items-center justify-center min-h-[300px]"
              >
                <h3 className="font-semibold text-slate-800 self-start w-full mb-2">Skill Radar</h3>
                <div className="w-full flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData} id={radarChartId}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Skills" dataKey="A" stroke="#6366f1" fill="#818cf8" fillOpacity={0.5} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Stats & Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                 <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 border border-indigo-400 rounded-xl p-6 shadow-sm flex flex-col justify-between text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Trophy className="h-8 w-8 text-indigo-200" />
                        <span className="bg-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-indigo-400/50">Level 42 Developer</span>
                      </div>
                      <h2 className="text-3xl font-bold mb-1">9,600 XP</h2>
                      <p className="text-indigo-100 text-sm">Total Experience Earned</p>
                    </div>
                    <div className="mt-6">
                      <div className="flex justify-between text-xs mb-1.5 font-medium text-indigo-100">
                        <span>Current Level Progress</span>
                        <span>400 XP to Lvl 43</span>
                      </div>
                      <div className="w-full bg-indigo-900/30 rounded-full h-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1, delay: 0.5 }} className="bg-white h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                      </div>
                    </div>
                 </div>

                 <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-4">Top Skills</h3>
                      <div className="space-y-3">
                        {[mockSkills[0], mockSkills[2]].map((skill, i) => (
                           <div key={i} className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${getCategoryColor(skill.category)}`}></div>
                               <span className="font-medium text-slate-700 text-sm">{skill.name}</span>
                             </div>
                             <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Lvl {skill.level}</span>
                           </div>
                        ))}
                      </div>
                    </div>
                    <button className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                      <Plus className="h-4 w-4" />
                      Add New Skill
                    </button>
                 </div>
              </motion.div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search skills..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium text-slate-600"
                  >
                    {SKILL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative flex-1 sm:flex-none">
                  <select 
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full sm:w-auto pl-4 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium text-slate-600"
                  >
                    {SKILL_TIERS.map(tier => <option key={tier} value={tier}>{tier === 'All' ? 'All Tiers' : tier}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Skill Grid */}
            <motion.div 
              variants={containerVariants} initial="hidden" animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
            >
              {filteredSkills.map(skill => {
                const progress = (skill.xp / skill.nextXp) * 100;
                return (
                  <motion.div 
                    key={skill.id} variants={itemVariants}
                    onClick={() => setSelectedSkill(skill)}
                    whileHover={{ y: -4, shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm cursor-pointer transition-all group relative overflow-hidden"
                  >
                     <div className={`absolute top-0 left-0 w-1 h-full ${getCategoryColor(skill.category)}`}></div>
                     
                     <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{skill.name}</h4>
                          <span className="text-xs text-slate-500 font-medium">{skill.category}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getTierColor(skill.tier)}`}>
                          {skill.tier}
                        </span>
                     </div>

                     <div className="space-y-3">
                       <div className="flex justify-between items-end">
                         <div className="flex flex-col">
                           <span className="text-xs text-slate-400 font-medium">Level</span>
                           <span className="text-2xl font-bold text-slate-700">{skill.level}</span>
                         </div>
                         <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                           <Star className="h-3 w-3 fill-current" />
                           <span className="text-xs font-bold">{skill.endorsements}</span>
                         </div>
                       </div>

                       <div>
                         <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                           <span>{skill.xp} XP</span>
                           <span>{skill.nextXp} XP</span>
                         </div>
                         <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <motion.div 
                               initial={{ width: 0 }} whileInView={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.2 }}
                               viewport={{ once: true }}
                               className={`h-full rounded-full ${getCategoryColor(skill.category)} relative`}
                            >
                               <div className="absolute inset-0 bg-white/20 w-full h-full [mask-image:linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.8)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]"></div>
                            </motion.div>
                         </div>
                       </div>
                     </div>
                  </motion.div>
                )
              })}
              {filteredSkills.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center">
                   <Code2 className="h-12 w-12 text-slate-300 mb-4" />
                   <p className="text-lg font-medium text-slate-600">No skills found</p>
                   <p className="text-sm">Try adjusting your search or filters.</p>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </main>

      {/* Slide-out Detail Panel */}
      <AnimatePresence>
        {selectedSkill && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedSkill(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: "100%", boxShadow: "-10px 0 25px -5px rgba(0, 0, 0, 0)" }} 
              animate={{ x: 0, boxShadow: "-10px 0 25px -5px rgba(0, 0, 0, 0.1)" }} 
              exit={{ x: "100%", boxShadow: "-10px 0 25px -5px rgba(0, 0, 0, 0)" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex flex-col">
                   <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 w-max px-2 py-0.5 rounded-md border ${getTierColor(selectedSkill.tier)}`}>
                     {selectedSkill.tier}
                   </span>
                   <h2 className="text-2xl font-bold text-slate-800">{selectedSkill.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <button onClick={() => setSelectedSkill(null)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 {/* Skill Main Stats */}
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${getCategoryColor(selectedSkill.category)}`}>
                           <Code2 className="h-6 w-6" />
                         </div>
                         <div>
                            <p className="text-sm font-medium text-slate-500">{selectedSkill.category}</p>
                            <p className="text-lg font-bold text-slate-800">Level {selectedSkill.level}</p>
                         </div>
                      </div>
                      <div className="text-center bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
                        <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                           <Star className="h-4 w-4 fill-current" />
                           <span className="font-bold">{selectedSkill.endorsements}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Endorsed</span>
                      </div>
                    </div>

                    <div>
                       <div className="flex justify-between text-sm font-medium mb-2">
                         <span className="text-slate-600">Progress to Level {selectedSkill.level + 1}</span>
                         <span className="text-indigo-600">{Math.round((selectedSkill.xp / selectedSkill.nextXp) * 100)}%</span>
                       </div>
                       <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <motion.div 
                             initial={{ width: 0 }} animate={{ width: `${(selectedSkill.xp / selectedSkill.nextXp) * 100}%` }} transition={{ duration: 1 }}
                             className={`h-full rounded-full ${getCategoryColor(selectedSkill.category)}`}
                          />
                       </div>
                       <p className="text-right text-xs text-slate-500 mt-2 font-medium">
                         {selectedSkill.xp} / {selectedSkill.nextXp} XP
                       </p>
                    </div>
                 </div>

                 {/* Action Bar */}
                 <button className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-3 rounded-xl font-semibold transition-colors border border-indigo-100">
                    <TrendingUp className="h-5 w-5" />
                    Log Session to Earn XP
                 </button>

                 {/* History / Linked Sessions */}
                 <div>
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                       <Clock className="h-4 w-4 text-slate-400" />
                       Recent History
                    </h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                       {/* Mock History Items */}
                       <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-indigo-50 text-slate-500 group-[.is-active]:text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Terminal className="h-4 w-4" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                             <div className="flex items-center justify-between mb-1">
                               <span className="font-semibold text-sm text-slate-800">Auth Implementation</span>
                               <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">+450 XP</span>
                             </div>
                             <p className="text-xs text-slate-500 mb-2">2 hours focused session</p>
                             <time className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{selectedSkill.lastUsed}</time>
                          </div>
                       </div>
                       
                       <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Award className="h-4 w-4" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                             <div className="flex items-center justify-between mb-1">
                               <span className="font-semibold text-sm text-slate-800">Milestone Reached</span>
                               <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">Level Up</span>
                             </div>
                             <p className="text-xs text-slate-500 mb-2">Reached Level {selectedSkill.level}</p>
                             <time className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">1 week ago</time>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Add this to your global CSS or inside a style tag if needed for the shimmer effect on progress bars
const shimmerKeyframes = `
@keyframes shimmer {
  100% {
    mask-position: 200% 0;
  }
}
`;
