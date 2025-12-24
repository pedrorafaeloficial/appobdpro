'use client';

import { useState } from 'react';
import type { DiagnosticDataOutput, DiagnosticDataInput } from '@/ai/flows/analyze-diagnostic-data';
import LandingPage from '@/components/landing-page';
import DiagnosticForm from '@/components/diagnostic-form';
import ResultsDashboard from '@/components/results-dashboard';
import Logo from '@/components/logo';

type Step = 'landing' | 'form' | 'results';

// Combine analysis result with the input that generated it
export type AnalysisResultWithInput = DiagnosticDataOutput & {
  input: DiagnosticDataInput;
};

export default function Home() {
  const [step, setStep] = useState<Step>('landing');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultWithInput | null>(null);

  const handleStart = () => {
    setStep('form');
  };

  const handleAnalysisComplete = (result: DiagnosticDataOutput, input: DiagnosticDataInput) => {
    setAnalysisResult({ ...result, input });
    setStep('results');
  };

  const handleStartOver = () => {
    setAnalysisResult(null);
    setStep('landing');
  };

  const renderStep = () => {
    switch (step) {
      case 'form':
        return <DiagnosticForm onAnalysisComplete={handleAnalysisComplete} />;
      case 'results':
        return analysisResult && <ResultsDashboard analysisResult={analysisResult} onStartOver={handleStartOver} />;
      case 'landing':
      default:
        return <LandingPage onStart={handleStart} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8">
      <div className="scanline-effect fixed inset-0 pointer-events-none z-0" />
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
        <Logo />
      </div>
      <div className="relative z-10 w-full flex items-center justify-center">
        {renderStep()}
      </div>
    </div>
  );
}
