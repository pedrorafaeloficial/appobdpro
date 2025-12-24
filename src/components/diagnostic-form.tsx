'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { runAnalysis } from '@/app/actions';
import type { DiagnosticDataOutput, DiagnosticDataInput } from '@/ai/flows/analyze-diagnostic-data';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const questions = [
  { id: 'q1', text: 'Como você descreveria o processo de agendamento de serviços na sua oficina?', options: ['Totalmente manual (telefone/whatsapp)', 'Parcialmente digital (planilhas/agenda online)', 'Totalmente digital com sistema próprio', 'Não tenho um processo definido'] },
  { id: 'q2', text: 'Qual é o nível de organização do seu estoque de peças?', options: ['Muito organizado, com controle de inventário', 'Organizado, mas sem sistema formal', 'Pouco organizado, costumo comprar quando preciso', 'Totalmente desorganizado'] },
  { id: 'q3', text: 'Com que frequência você realiza a manutenção preventiva dos equipamentos da oficina?', options: ['Regularmente, sigo um cronograma', 'Ocasionalmente, quando lembro', 'Raramente', 'Apenas quando um equipamento quebra'] },
  { id: 'q4', text: 'Como você gerencia o fluxo de trabalho e a distribuição de tarefas entre os mecânicos?', options: ['Uso um sistema ou quadro para distribuir e acompanhar', 'Distribuição verbal, no dia a dia', 'Cada um pega o próximo serviço da fila', 'Não há um gerenciamento claro'] },
  { id: 'q5', text: 'Sua oficina possui um processo padronizado para o diagnóstico inicial dos veículos?', options: ['Sim, seguimos um checklist detalhado', 'Temos um processo, mas não é formalizado', 'Depende da experiência do mecânico', 'Não, cada caso é analisado de forma diferente'] },
  { id: 'q6', text: 'Como é feito o controle de qualidade dos serviços antes da entrega ao cliente?', options: ['Temos um checklist de verificação final', 'Um supervisor ou o próprio mecânico faz uma revisão', 'Confio na qualidade do trabalho do mecânico', 'Não há um processo formal de verificação'] },
  { id: 'q7', text: 'Qual a sua maior dificuldade na gestão do tempo e cumprimento de prazos?', options: ['Diagnósticos complexos e demorados', 'Falta de peças no estoque', 'Interrupções e gerenciamento de múltiplas tarefas', 'Sobrecarga de trabalho da equipe'] },
  { id: 'q8', text: 'O espaço físico da sua oficina é bem aproveitado?', options: ['Sim, é otimizado para o fluxo de trabalho', 'Poderia ser melhor, há alguma desorganização', 'Não, falta espaço e organização', 'É um dos meus maiores problemas'] },
  { id: 'q9', text: 'Você utiliza alguma ferramenta digital para gerenciar as ordens de serviço (O.S.)?', options: ['Sim, um software de gestão de oficinas', 'Uso planilhas ou documentos de texto', 'Ainda uso O.S. em papel/bloco', 'Não utilizo ordens de serviço formais'] },
  { id: 'q10', text: 'Como você lida com o descarte de resíduos, como óleo e peças velhas?', options: ['Sigo todas as normas ambientais com empresa especializada', 'Tenho um método próprio que considero correto', 'Descarto junto com o lixo comum', 'Não tenho um procedimento definido'] },
];

const formSchema = z.object({
  q1: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  q2: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  q3: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  q4: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  q5: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  q6: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  q7: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  q8: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  q9: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  q10: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  additionalInfo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DiagnosticFormProps {
  onAnalysisComplete: (result: DiagnosticDataOutput, input: DiagnosticDataInput) => void;
}

export default function DiagnosticForm({ onAnalysisComplete }: DiagnosticFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);

    const operationalData = questions.map((q, index) => 
      `Pergunta: ${q.text}\nResposta: ${values[`q${index + 1}` as keyof FormData]}`
    ).join('\n\n');
    
    const finalOperationalData = `${operationalData}\n\nInformações Adicionais: ${values.additionalInfo || 'Nenhuma'}`;

    const analysisInput: DiagnosticDataInput = {
        operationalData: finalOperationalData,
        gestaoData: 'N/A',
        financeiroData: 'N/A',
        marketingData: 'N/A'
    }

    const result = await runAnalysis(analysisInput);
    setIsLoading(false);

    if (result.success && result.data) {
      onAnalysisComplete(result.data, analysisInput);
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
      <h2 className="text-3xl font-bold text-center mb-2">Começar o Diagnóstico</h2>
      <p className="text-muted-foreground text-center mb-8">Vamos começar pelo Operacional. Responda às perguntas abaixo.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {questions.map((q, index) => (
              <FormField
                key={q.id}
                control={form.control}
                name={`q${index + 1}` as keyof FormData}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                     <Card>
                        <CardHeader>
                            <FormLabel className="text-base font-semibold">{index + 1}. {q.text}</FormLabel>
                        </CardHeader>
                        <CardContent>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2"
                                >
                                {q.options.map(option => (
                                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value={option} />
                                        </FormControl>
                                        <FormLabel className="font-normal text-sm">{option}</FormLabel>
                                    </FormItem>
                                ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </CardContent>
                     </Card>
                  </FormItem>
                )}
              />
            ))}

            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <Card>
                    <CardHeader>
                        <FormLabel className="text-base font-semibold">Algo mais sobre sua operação?</FormLabel>
                        <p className="text-sm text-muted-foreground">
                            Se houver mais algum detalhe sobre a área operacional que você queira compartilhar, escreva abaixo.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <FormControl>
                            <Textarea
                            placeholder="Descreva aqui qualquer outro ponto relevante sobre seus processos, equipe, ferramentas, etc."
                            className="min-h-[150px]"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </CardContent>
                  </Card>
                </FormItem>
              )}
            />
          
          <div className="flex justify-end mt-8">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analisar Dados Operacionais
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
