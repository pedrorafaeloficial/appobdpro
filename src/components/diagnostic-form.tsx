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
  operationalData: z.string().min(10, { message: 'Please provide some details about your operations.' }),
  gestaoData: z.string().min(10, { message: 'Please provide some details about your management.' }),
  financeiroData: z.string().min(10, { message: 'Please provide some details about your financials.' }),
  marketingData: z.string().min(10, { message: 'Please provide some details about your marketing.' }),
});

type FormData = z.infer<typeof formSchema>;

interface DiagnosticFormProps {
  onAnalysisComplete: (result: DiagnosticDataOutput, input: DiagnosticDataInput) => void;
}

const formTabs = [
  { value: 'operational', label: 'Operational', field: 'operationalData', description: 'Describe your production processes, logistics, quality control, and day-to-day operations.' },
  { value: 'gestao', label: 'Gestão', field: 'gestaoData', description: 'Describe your team structure, management style, internal communication, and HR processes.' },
  { value: 'financeiro', label: 'Financeiro', field: 'financeiroData', description: 'Describe your cash flow, pricing, profitability, and financial controls.' },
  { value: 'marketing', label: 'Marketing', field: 'marketingData', description: 'Describe your sales strategies, customer acquisition, branding, and online presence.' },
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
        title: 'Analysis Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-center mb-2">Business Diagnostic</h2>
      <p className="text-muted-foreground text-center mb-8">Fill in the details for each area of your business.</p>
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
                              placeholder={`e.g., "Our production line has frequent bottlenecks..."`}
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
              Analyze Data
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
