'use client';

import { Button } from '@/components/ui/button';
import { CarFront } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-8 animate-fade-in">
      <div className="relative">
        <CarFront className="h-24 w-24 text-primary flicker" />
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
      </div>
      <div className="max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
          AI-Powered Business Diagnostics
        </h2>
        <p className="text-lg text-muted-foreground">
          Identify issues, get actionable insights, and drive your business forward. Like a diagnostic scanner for your company.
        </p>
      </div>
      <Button onClick={onStart} size="lg" className="text-lg font-bold tracking-wider">
        Start Diagnostic
      </Button>
    </div>
  );
}
