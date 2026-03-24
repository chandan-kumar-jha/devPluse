import React from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { FeaturesBento } from '../components/FeaturesBento';
import { CTASection } from '../components/CTASection';
import { Footer } from '../components/Footer';

export const Home = () => {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50 selection:bg-indigo-500/30">
      <Navbar />
      
      <main>
        <HeroSection />
        
        <div id="features" className="bg-zinc-950 relative border-t border-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Everything you need. Nothing you don't.
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              A streamlined toolkit mirroring your workflow. Sessions, Goals, Skills, and Insights directly integrated into a single dashboard.
            </p>
          </div>
          <FeaturesBento />
        </div>
        
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};
