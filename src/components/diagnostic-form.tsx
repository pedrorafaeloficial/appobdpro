'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { runAnalysis } from '@/app/actions';
import type { DiagnosticDataOutput, DiagnosticDataInput } from '@/ai/flows/analyze-diagnostic-data';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  operationalData: z.string().min(10, { message: 'Por favor, forneça alguns detalhes sobre suas operações.' }),
  gestaoData: z.string().min(10, { message: 'Por favor, forneça alguns detalhes sobre sua gestão.' }),
  financeiroData: z.string().min(10, { message: 'Por favor, forneça alguns detalhes sobre suas finanças.' }),
  marketingData: z.string().min(10, { message: 'Por favor, forneça alguns detalhes sobre seu marketing.' }),
});

type FormData = z.infer<typeof formSchema>;

interface DiagnosticFormProps {
  onAnalysisComplete: (result: DiagnosticDataOutput, input: DiagnosticDataInput) => void;
}

const formTabs = [
  { value: 'operational', label: 'Operacional', field: 'operationalData', description: 'Descreva seus processos de produção, logística, controle de qualidade e operações do dia-a-dia.' },
  { value: 'gestao', label: 'Gestão', field: 'gestaoData', description: 'Descreva a estrutura da sua equipe, estilo de gestão, comunicação interna e processos de RH.' },
  { value: 'financeiro', label: 'Financeiro', field: 'financeiroData', description: 'Descreva seu fluxo de caixa, precificação, lucratividade e controles financeiros.' },
  { value: 'marketing', label: 'Marketing', field: 'marketingData', description: 'Descreva suas estratégias de vendas, aquisição de clientes, branding e presença online.' },
] as const;


export default function DiagnosticForm({ onAnalysisComplete }: DiagnosticFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operationalData: '',
      gestaoData: '',
      financeiroData: '',
      marketingData: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    const result = await runAnalysis(values);
    setIsLoading(false);

    if (result.success && result.data) {
      onAnalysisComplete(result.data, values);
    } else {
      toast({
        variant: 'destructive',
        title: 'Falha na Análise',
        description: result.error || 'Ocorreu um erro desconhecido.',
      });
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-center mb-2">Diagnóstico Empresarial</h2>
      <p className="text-muted-foreground text-center mb-8">Preencha os detalhes para cada área do seu negócio.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="operational" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              {formTabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>
            {formTabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value}>
                  <div className="p-6 bg-card rounded-lg border">
                    <FormField
                      control={form.control}
                      name={tab.field}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">{tab.label}</FormLabel>
                          <FormDescription>
                            {tab.description}
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder={`Ex: "Nossa linha de produção tem gargalos frequentes..."`}
                              className="min-h-[200px] text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
            ))}
          </Tabs>
          <div className="flex justify-end mt-8">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analisar Dados
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
