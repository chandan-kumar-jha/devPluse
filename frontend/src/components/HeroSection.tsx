import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Code2, Terminal, Database, Layers } from "lucide-react";
import { Link } from "react-router";
import createGlobe from "cobe";

const Globe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    let width = 0;
    let globe: any;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    if (!canvasRef.current || width === 0) return;

    // Use a short delay to ensure the DOM and WebGL context are synchronized
    const initId = requestAnimationFrame(() => {
      if (!canvasRef.current) return;

      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.15,
        dark: 1,
        diffuse: 2.5,
        mapSamples: 25000,
        mapBrightness: 8,
        baseColor: [0.05, 0.2, 0.6],
        markerColor: [0.2, 0.8, 0.3],
        glowColor: [1, 0.85, 0.5],
        markers: [
          { location: [37.7595, -122.4367], size: 0.03 },
          { location: [40.7128, -74.0060], size: 0.1 },
          { location: [51.5074, -0.1278], size: 0.05 },
          { location: [-33.8688, 151.2093], size: 0.07 },
          { location: [35.6895, 139.6917], size: 0.09 },
        ],
        onRender: (state) => {
          // Additional safety: if width was lost, skip drawing this frame
          if (!width) return; 
          
          state.phi = phi;
          phi += 0.003;
          state.width = width * 2;
          state.height = width * 2;
        },
      });
    });

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1";
    });

    return () => {
      cancelAnimationFrame(initId); // Cancel init if unmounted immediately
      if (globe) globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[800px]">
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-0 transition-opacity duration-[2000ms] ease-in-out"
        style={{ contain: "layout paint size", cursor: 'auto' }}
      />
    </div>
  );
};

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion values for mouse tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for fluid animation
  const mouseX = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 100, damping: 20 });
  
  // Reverse springs for parallax effects
  const mouseXReverse = useSpring(x, { stiffness: 100, damping: 20, bounce: 0 });
  const mouseYReverse = useSpring(y, { stiffness: 100, damping: 20, bounce: 0 });

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set((event.clientX - centerX) / 40);
    y.set((event.clientY - centerY) / 40);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0c] pb-[120px] pt-[160px]"
      style={{ perspective: "1000px" }}
    >
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#5e43f315_0%,transparent_60%)]" />

      {/* Rotating Globe in the background */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-60 mix-blend-screen">
        <motion.div
          style={{
            x: useTransform(mouseXReverse, (val) => -val * 2),
            y: useTransform(mouseYReverse, (val) => -val * 2),
          }}
          className="h-full w-full"
        >
          <Globe />
        </motion.div>
      </div>

      {/* Floating Elements (Icons) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          style={{ x: useTransform(mouseX, (v) => v * 3), y: useTransform(mouseY, (v) => v * 3) }}
          className="absolute left-1/4 top-1/4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md"
        >
          <Code2 className="h-6 w-6 text-[#5e43f3]" />
        </motion.div>
        
        <motion.div 
          style={{ x: useTransform(mouseX, (v) => -v * 2), y: useTransform(mouseY, (v) => -v * 2) }}
          className="absolute right-1/4 top-1/3 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#5e43f3]/20 bg-[#5e43f3]/10 backdrop-blur-md"
        >
          <Terminal className="h-8 w-8 text-white" />
        </motion.div>

        <motion.div 
          style={{ x: useTransform(mouseX, (v) => v * 4), y: useTransform(mouseY, (v) => -v * 4) }}
          className="absolute bottom-1/4 left-1/3 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-md"
        >
          <Database className="h-5 w-5 text-emerald-400" />
        </motion.div>
        
        <motion.div 
          style={{ x: useTransform(mouseX, (v) => -v * 5), y: useTransform(mouseY, (v) => v * 5) }}
          className="absolute bottom-1/3 right-1/3 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md"
        >
          <Layers className="h-7 w-7 text-amber-400" />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div 
        style={{
          rotateX: useTransform(mouseY, (v) => -v * 0.5),
          rotateY: useTransform(mouseX, (v) => v * 0.5),
          transformStyle: "preserve-3d"
        }}
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8"
      >
        <div className="relative mb-6 overflow-visible" style={{ perspective: "1000px" }}>
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl text-6xl font-extrabold tracking-tighter text-white sm:text-8xl leading-tight"
          >
            Master your flow. <br />
            <span className="bg-gradient-to-r from-[#5e43f3] to-[#8c78f5] bg-clip-text text-transparent">Own your work.</span>
          </motion.h1>
        </div>

        <div className="relative overflow-visible" style={{ perspective: "1000px" }}>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-2xl text-xl text-zinc-300"
          >
            A high-performance productivity suite exclusively for developers. Log sessions, break down goals, and measure your skills in a distraction-free environment.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col sm:flex-row gap-4 relative"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/register"
              className="group inline-flex h-14 items-center justify-center rounded-xl bg-[#5e43f3] px-8 text-base font-semibold text-white shadow-[0_0_40px_-10px_#5e43f3] transition-all hover:bg-[#4d35ce]"
            >
              Start Tracking Now
              <motion.div
                className="ml-2 inline-flex"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Decorative gradient blur background */}
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl" aria-hidden="true">
        <div 
          className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-[#5e43f3] to-[#2b1e70] opacity-10" 
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>
    </div>
  );
};