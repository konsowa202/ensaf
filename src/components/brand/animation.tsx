'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { FileText, Coins, ArrowRight, ShieldCheck, TrendingUp, Briefcase, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BrandAnimation({ name, className = '' }: { name: string; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  
  if (name === 'hero-money-flow') {
    return (
      <div className={cn("relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-deep/5 via-primary/5 to-gold/10 border border-primary/10 flex items-center justify-center p-8", className)}>
        <motion.div 
          animate={shouldReduceMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"
        />
        
        <div className="relative z-10 w-full max-w-sm h-64 bg-card/50 backdrop-blur-md rounded-2xl shadow-xl border border-border p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-primary-deep p-3 rounded-xl shadow-lg"
            >
              <FileText className="text-white w-8 h-8" />
            </motion.div>
            
            <motion.div
              animate={shouldReduceMotion ? { x: 0 } : { x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center text-gold"
            >
              <div className="h-1 w-16 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
              <ArrowRight className="w-6 h-6 ml-2" />
            </motion.div>
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="bg-gold p-3 rounded-xl shadow-lg"
            >
              <Coins className="text-white w-8 h-8" />
            </motion.div>
          </div>
          
          <div className="mt-8 space-y-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.8, duration: 1 }}
              className="h-2 bg-primary/20 rounded-full overflow-hidden"
            >
              <motion.div 
                animate={shouldReduceMotion ? { x: "0%" } : { x: ["-100%", "0%"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-full bg-gradient-to-r from-primary to-gold w-full rounded-full"
              />
            </motion.div>
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>تمويل القضية</span>
              <span className="text-primary">100%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (name.startsWith('step-')) {
    const stepIcons = {
      'step-1-loop': <FileText className="w-12 h-12 text-primary" />,
      'step-2-loop': <Scale className="w-12 h-12 text-gold" />,
      'step-3-loop': <Coins className="w-12 h-12 text-primary-deep" />,
      'step-4-loop': <TrendingUp className="w-12 h-12 text-coral" />,
    } as Record<string, React.ReactNode>;

    return (
      <div className={cn("relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-surface to-white border border-border shadow-sm", className)}>
        <motion.div 
          animate={shouldReduceMotion ? { y: 0 } : { y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="p-4 bg-white rounded-full shadow-lg border border-primary/10"
        >
          {stepIcons[name]}
        </motion.div>
      </div>
    );
  }

  if (name === 'case-funding-loop') {
    return (
      <div className={cn("relative rounded-3xl overflow-hidden bg-card shadow-2xl border border-border p-8 flex flex-col justify-center", className)}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="h-4 w-32 bg-surface rounded mb-2" />
            <div className="h-3 w-24 bg-surface rounded" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-muted-foreground">حجم التمويل المكتمل</span>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-gold"
            >
              85%
            </motion.span>
          </div>
          <div className="h-4 w-full bg-surface rounded-full overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "85%" }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-gold rounded-full relative overflow-hidden"
            >
              <motion.div 
                animate={shouldReduceMotion ? { x: "0%" } : { x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-white/30 skew-x-12 w-1/4"
              />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (name === 'returns-chart-loop') {
    return (
      <div className={cn("relative rounded-3xl overflow-hidden bg-card shadow-xl border border-border p-8 flex items-end justify-center gap-4", className)}>
        {[40, 65, 45, 90].map((height, i) => (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: i * 0.2, duration: 1, type: "spring" }}
            className={cn(
              "w-12 md:w-16 rounded-t-lg relative", 
              i === 3 ? "bg-gold" : "bg-primary/20"
            )}
          >
            {i === 3 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
              >
                +25%
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  if (name === 'security-shield-loop') {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <motion.div 
          animate={shouldReduceMotion ? { scale: 1, opacity: 0.5 } : { scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-primary/20 rounded-full"
        />
        <motion.div 
          animate={shouldReduceMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
          className="absolute inset-4 bg-primary/30 rounded-full"
        />
        <div className="relative z-10 w-full h-full bg-card rounded-full shadow-lg border border-border flex items-center justify-center text-primary">
          <ShieldCheck className="w-10 h-10" />
        </div>
      </div>
    );
  }

  // Fallback for missing animation name
  return (
    <div className={cn("flex items-center justify-center bg-surface border border-border border-dashed rounded-2xl", className)}>
      <span className="text-muted-foreground font-medium text-sm">
        [Animation: {name}]
      </span>
    </div>
  );
}
