'use client';

import { useState } from 'react';
import { getFullReport } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList } from 'recharts';
import { AlertTriangle, FileText, Loader2, Printer, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import type { AnalysisResultWithInput } from '@/app/page';

interface ResultsDashboardProps {
  analysisResult: AnalysisResultWithInput;
  onStartOver: () => void;
}

interface FullReport {
  report: string;
}

export default function ResultsDashboard({ analysisResult, onStartOver }: ResultsDashboardProps) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const { toast } = useToast();

  const chartData = [
    { name: 'Operacional', issues: analysisResult.operationalDTCs.split('\n').filter(line => line.trim() !== '').length },
    { name: 'Gestão', issues: analysisResult.gestaoDTCs.split('\n').filter(line => line.trim() !== '').length },
    { name: 'Financeiro', issues: analysisResult.financeiroDTCs.split('\n').filter(line => line.trim() !== '').length },
    { name: 'Marketing', issues: analysisResult.marketingDTCs.split('\n').filter(line => line.trim() !== '').length },
  ].filter(d => d.issues > 0);
  
  const diagnosticSections = [
    { title: 'DTCs Operacionais', content: analysisResult.operationalDTCs },
    { title: 'DTCs de Gestão', content: analysisResult.gestaoDTCs },
    { title: 'DTCs Financeiros', content: analysisResult.financeiroDTCs },
    { title: 'DTCs de Marketing', content: analysisResult.marketingDTCs },
  ];

  const handleGenerateReport = async () => {
    if (fullReport) return;
    setIsGeneratingReport(true);
    const identifiedDTCs = diagnosticSections.map(s => `${s.title}:\n${s.content}`).join('\n\n');
    
    const inputForReport = { ...analysisResult.input, identifiedDTCs };
    
    const result = await getFullReport(inputForReport);
    setIsGeneratingReport(false);

    if (result.success && result.data) {
      setFullReport(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Falha na Geração do Relatório',
        description: result.error || 'Ocorreu um erro desconhecido.',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in printable-area">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8 non-printable">
        <h2 className="text-3xl font-bold">Resultados do Diagnóstico</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onStartOver}>
            <RotateCcw className="mr-2 h-4 w-4" /> Começar de Novo
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir Relatório
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {diagnosticSections.map(section => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-primary" /> {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-body text-sm bg-background p-4 rounded-md">{section.content || 'Nenhum problema detectado.'}</pre>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral dos Problemas</CardTitle>
              <CardDescription>Número de problemas potenciais identificados por área.</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="issues" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="issues" position="top" style={{ fill: 'hsl(var(--foreground))' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-10">Nenhum problema para exibir.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recomendações Iniciais</CardTitle>
            </CardHeader>
            <CardContent>
               <ScrollArea className="h-48">
                <pre className="whitespace-pre-wrap font-body text-sm p-1">{analysisResult.recommendations}</pre>
               </ScrollArea>
            </CardContent>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full" onClick={handleGenerateReport} disabled={isGeneratingReport}>
                {isGeneratingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                {isGeneratingReport ? 'Gerando...' : (fullReport ? 'Ver Relatório Completo' : 'Gerar Relatório Completo')}
              </Button>
            </DialogTrigger>
            {fullReport && (
              <DialogContent className="max-w-4xl h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Relatório de Diagnóstico Completo</DialogTitle>
                  <DialogDescription>
                    Aqui está seu relatório detalhado com recomendações personalizadas.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-full w-full rounded-md border p-4 mt-4">
                  <pre className="whitespace-pre-wrap font-body text-sm">{fullReport.report}</pre>
                </ScrollArea>
              </DialogContent>
            )}
          </Dialog>

        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .non-printable {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .printable-area {
            color: black;
          }
          .printable-area .bg-card, .printable-area .bg-background {
             background-color: white !important;
             border: 1px solid #ddd !important;
             box-shadow: none !important;
          }
          .printable-area pre, .printable-area .text-muted-foreground, .printable-area p {
            color: #333 !important;
          }
          .printable-area .text-primary {
            color: #cc0000 !important;
          }
           .printable-area h1, .printable-area h2, .printable-area h3, .printable-area h4, .printable-area .card-title {
            color: black !important;
          }
           .printable-area .recharts-wrapper {
             -webkit-print-color-adjust: exact !important;
             print-color-adjust: exact !important;
           }
           .printable-area [fill="var(--color-chart-1)"] {
             fill: #e53e3e !important;
           }
        }
      `}</style>
    </div>
  );
}
