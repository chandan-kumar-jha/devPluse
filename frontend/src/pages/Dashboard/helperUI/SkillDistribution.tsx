import { motion,type Variants } from "motion/react";

// 1. Define the Skill interface
interface Skill {
  name: string;
  level: number; // percentage (0-100)
  tier: string;
}

// 2. Define Props with strict types
interface SkillDistributionProps {
  skills: Skill[];
  variants: Variants;
}
// SkillDistribution.tsx updated logic
export const SkillDistribution = ({ skills, variants }: SkillDistributionProps) => (
  <motion.div variants={variants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
    <h3 className="font-semibold text-slate-800 mb-6">Skill Tier Distribution</h3>
    <div className="space-y-5">
      {/* Agar skills array khali hai toh fallback message */}
      {skills.length === 0 && <p className="text-slate-400 text-sm">No skills added yet.</p>}
      
      {skills.map((skill) => (
        <div key={skill.name} className="group">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-slate-700 capitalize">
              {skill.name}
            </span>
            <span className="text-slate-500 text-xs">{skill.tier}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${skill.level}%` }}
              className="bg-indigo-500 h-2 rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);