import { motion } from "motion/react";
import { Terminal, Code2, Layers, LineChart, Shield } from "lucide-react";

export function BentoGrid({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ${className}`}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className = "",
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-zinc-900 dark:border-zinc-800 bg-white border border-transparent justify-between flex flex-col space-y-4 ${className}`}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {icon}
        <div className="font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
          {title}
        </div>
        <div className="font-normal text-neutral-600 dark:text-neutral-400 text-sm">
          {description}
        </div>
      </div>
    </motion.div>
  );
}

const Skeleton = ({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`flex flex-1 w-full h-full min-h-[6rem] rounded-xl 
    dark:bg-dot-white/[0.2] bg-dot-black/[0.2] 
    [mask-image:radial-gradient(ellipse_at_center,white,transparent)] 
    border border-transparent dark:border-white/[0.2] 
    bg-neutral-100 dark:bg-zinc-950 
    flex-col items-center justify-center relative overflow-hidden ${className}`}
  >
    {children}
  </div>
);

export const FeaturesBento = () => {
  return (
    <BentoGrid className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          className={i === 0 || i === 3 ? "md:col-span-2" : ""}
        />
      ))}
    </BentoGrid>
  );
};

const SessionVisual = () => (
  <Skeleton className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:border-indigo-500/20">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col gap-2 items-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-16 w-16 rounded-full border-2 border-indigo-500 flex items-center justify-center bg-indigo-500/10"
        >
          <Terminal className="text-indigo-400 w-6 h-6" />
        </motion.div>
        <span className="text-indigo-400/80 font-mono text-xs">
          Active Session: 02:45:12
        </span>
      </div>
    </div>
  </Skeleton>
);

const GoalVisual = () => (
  <Skeleton className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:border-emerald-500/20">
    <div className="w-full px-6 flex flex-col gap-3">
      {[100, 60, 30].map((width, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="h-2 w-full bg-emerald-950 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${width}%` }}
              transition={{ duration: 1, delay: i * 0.2 }}
              className="h-full bg-emerald-500"
            />
          </div>
          <span className="text-emerald-500/50 text-[10px] font-mono uppercase tracking-wider">
            Milestone {i + 1}
          </span>
        </div>
      ))}
    </div>
  </Skeleton>
);

const SkillVisual = () => (
  <Skeleton className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:border-amber-500/20">
    <div className="flex items-end justify-center gap-2 h-24">
      {[40, 70, 50, 90, 60].map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${height}%` }}
          transition={{ duration: 0.5, delay: i * 0.1, type: "spring" }}
          className="w-8 bg-amber-500/80 rounded-t-sm"
        />
      ))}
    </div>
  </Skeleton>
);

const DataVisual = () => (
  <Skeleton className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:border-blue-500/20">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    <div className="relative z-10 flex flex-col items-center">
      <Shield className="w-10 h-10 text-blue-400 mb-2" />
      <p className="text-blue-200 font-mono text-sm">
        Full Data Export Ready
      </p>
    </div>
  </Skeleton>
);

const items = [
  {
    title: "Deep Work Sessions",
    description:
      "Start, pause, and log dedicated coding sessions. Track your flow state and minimize context switching.",
    header: <SessionVisual />,
    icon: <Terminal className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Break Down Goals",
    description:
      "Split complex epics into manageable milestones. Pin active targets and archive completed ones.",
    header: <GoalVisual />,
    icon: <Layers className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Skill Progression",
    description:
      "Quantify your learning. Track the tech stack you're mastering across different projects.",
    header: <SkillVisual />,
    icon: <Code2 className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Developer Analytics & Privacy",
    description:
      "Your personal command center. Comprehensive dashboard with 100% data export capabilities and strict privacy settings.",
    header: <DataVisual />,
    icon: <LineChart className="h-4 w-4 text-neutral-500" />,
  },
];