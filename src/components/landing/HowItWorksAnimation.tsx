'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function HowItWorksAnimation({ locale }: { locale: string }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: locale === 'ar' ? '1. تسجيل حساب' : '1. Register Account',
      desc: locale === 'ar' ? 'قم بإنشاء حسابك وتوثيقه بسهولة وأمان' : 'Create and verify your account easily and securely.',
      icon: '👤'
    },
    {
      title: locale === 'ar' ? '2. تصفح الفرص' : '2. Browse Opportunities',
      desc: locale === 'ar' ? 'اختر من بين القضايا التجارية المتاحة للتمويل' : 'Choose from available commercial cases for funding.',
      icon: '🔍'
    },
    {
      title: locale === 'ar' ? '3. استثمر واربح' : '3. Invest & Earn',
      desc: locale === 'ar' ? 'استثمر واحصل على عوائد مجزية عند نجاح القضية' : 'Invest and get rewarding returns upon case success.',
      icon: '📈'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[9/16] bg-white rounded-[3rem] shadow-2xl border-[8px] border-surface p-6 flex flex-col items-center justify-center overflow-hidden ring-1 ring-border/50">
      {/* Phone Notch */}
      <div className="absolute top-0 w-32 h-6 bg-surface rounded-b-xl z-10"></div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex flex-col items-center text-center w-full z-0"
        >
          <div className="w-24 h-24 bg-primary/5 text-primary rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm">
            {steps[currentStep].icon}
          </div>
          <h3 className="text-2xl font-bold mb-3">{steps[currentStep].title}</h3>
          <p className="text-muted-foreground leading-relaxed text-sm px-2">{steps[currentStep].desc}</p>
        </motion.div>
      </AnimatePresence>

      {/* Progress Dots */}
      <div className="absolute bottom-8 flex gap-2">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-primary' : 'bg-border'}`}
          />
        ))}
      </div>
    </div>
  );
}
