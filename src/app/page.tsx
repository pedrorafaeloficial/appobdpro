'use client';

import { useState } from 'react';
import type { DiagnosticDataOutput, DiagnosticDataInput } from '@/ai/flows/analyze-diagnostic-data';
import DiagnosticForm from '@/components/diagnostic-form';
import ResultsDashboard from '@/components/results-dashboard';
import Logo from '@/components/logo';
import LoginForm from '@/components/login-form';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

type Step = 'form' | 'results';

// Combine analysis result with the input that generated it
export type AnalysisResultWithInput = DiagnosticDataOutput & {
  input: DiagnosticDataInput;
};

export default function Home() {
  const [step, setStep] = useState<Step>('form');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultWithInput | null>(null);
  const { user, isUserLoading } = useUser();

  const handleAnalysisComplete = (result: DiagnosticDataOutput, input: DiagnosticDataInput) => {
    setAnalysisResult({ ...result, input });
    setStep('results');
  };

  const handleStartOver = () => {
    setAnalysisResult(null);
    setStep('form');
  };

  const renderContent = () => {
    if (isUserLoading) {
      return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
    }

    if (!user) {
      return <LoginForm />;
    }

    switch (step) {
      case 'results':
        return analysisResult && <ResultsDashboard analysisResult={analysisResult} onStartOver={handleStartOver} />;
      case 'form':
      default:
        return <DiagnosticForm onAnalysisComplete={handleAnalysisComplete} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start py-24 px-4 md:px-8">
       <Image
        src="/src/obd-pro.png"
        alt="Automotive scanner background"
        fill
        quality={80}
        className="object-contain -z-10 opacity-20"
        data-ai-hint="automotive scanner"
        unoptimized
      />
      <div className="scanline-effect fixed inset-0 pointer-events-none z-0" />
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
        <Logo />
      </div>
      <div className="relative z-10 w-full flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
}
