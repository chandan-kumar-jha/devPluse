import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-24 sm:py-32 border-t border-zinc-900">
      <div className="absolute inset-0 bg-indigo-500/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to reclaim your focus?
          </h2>
          <p className="mt-6 text-lg leading-8 text-zinc-400">
            Join thousands of developers who are already tracking their deep work, hitting milestones faster, and leveling up their tech stack.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#"
              className="rounded-md bg-indigo-500 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 flex items-center gap-2 transition-colors"
            >
              Get started for free
              <ArrowRight className="h-4 w-4" />
            </motion.a>
            <a href="#" className="text-sm font-semibold leading-6 text-white hover:text-indigo-400 transition-colors">
              Read the docs <span aria-hidden="true">→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
