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
import { Card, CardContent, CardHeader } from './ui/card';
import { Progress } from './ui/progress';

const operationalQuestions = [
  { id: 'oq1', text: 'Como você descreveria o processo de agendamento de serviços na sua oficina?', options: ['Totalmente manual (telefone/whatsapp)', 'Parcialmente digital (planilhas/agenda online)', 'Totalmente digital com sistema próprio', 'Não tenho um processo definido'] },
  { id: 'oq2', text: 'Qual é o nível de organização do seu estoque de peças?', options: ['Muito organizado, com controle de inventário', 'Organizado, mas sem sistema formal', 'Pouco organizado, costumo comprar quando preciso', 'Totalmente desorganizado'] },
  { id: 'oq3', text: 'Com que frequência você realiza a manutenção preventiva dos equipamentos da oficina?', options: ['Regularmente, sigo um cronograma', 'Ocasionalmente, quando lembro', 'Raramente', 'Apenas quando um equipamento quebra'] },
  { id: 'oq4', text: 'Como você gerencia o fluxo de trabalho e a distribuição de tarefas entre os mecânicos?', options: ['Uso um sistema ou quadro para distribuir e acompanhar', 'Distribuição verbal, no dia a dia', 'Cada um pega o próximo serviço da fila', 'Não há um gerenciamento claro'] },
  { id: 'oq5', text: 'Sua oficina possui um processo padronizado para o diagnóstico inicial dos veículos?', options: ['Sim, seguimos um checklist detalhado', 'Temos um processo, mas não é formalizado', 'Depende da experiência do mecânico', 'Não, cada caso é analisado de forma diferente'] },
  { id: 'oq6', text: 'Como é feito o controle de qualidade dos serviços antes da entrega ao cliente?', options: ['Temos um checklist de verificação final', 'Um supervisor ou o próprio mecânico faz uma revisão', 'Confio na qualidade do trabalho do mecânico', 'Não há um processo formal de verificação'] },
  { id: 'oq7', text: 'Qual a sua maior dificuldade na gestão do tempo e cumprimento de prazos?', options: ['Diagnósticos complexos e demorados', 'Falta de peças no estoque', 'Interrupções e gerenciamento de múltiplas tarefas', 'Sobrecarga de trabalho da equipe'] },
  { id: 'oq8', text: 'O espaço físico da sua oficina é bem aproveitado?', options: ['Sim, é otimizado para o fluxo de trabalho', 'Poderia ser melhor, há alguma desorganização', 'Não, falta espaço e organização', 'É um dos meus maiores problemas'] },
  { id: 'oq9', text: 'Você utiliza alguma ferramenta digital para gerenciar as ordens de serviço (O.S.)?', options: ['Sim, um software de gestão de oficinas', 'Uso planilhas ou documentos de texto', 'Ainda uso O.S. em papel/bloco', 'Não utilizo ordens de serviço formais'] },
  { id: 'oq10', text: 'Como você lida com o descarte de resíduos, como óleo e peças velhas?', options: ['Sigo todas as normas ambientais com empresa especializada', 'Tenho um método próprio que considero correto', 'Descarto junto com o lixo comum', 'Não tenho um procedimento definido'] },
];

const financialQuestions = [
    { id: 'fq1', text: 'Como você controla o fluxo de caixa da sua oficina?', options: ['Uso um software de gestão financeira', 'Planilhas eletrônicas (Excel, Google Sheets)', 'Caderno ou anotações manuais', 'Não faço um controle formal'] },
    { id: 'fq2', text: 'Você sabe qual é a margem de lucro em cada serviço ou peça vendida?', options: ['Sim, calculo precisamente para cada item', 'Tenho uma ideia geral, mas não calculo sempre', 'Calculo apenas o lucro total no fim do mês', 'Não sei qual é a minha margem de lucro'] },
    { id: 'fq3', text: 'Como é definido o preço dos seus serviços?', options: ['Baseado na concorrência', 'Com base no custo da peça + uma margem fixa', 'Calculo com base no tempo, custo e margem de lucro desejada', 'Defino um preço que acho justo'] },
    { id: 'fq4', text: 'Você faz um controle de contas a pagar e a receber?', options: ['Sim, de forma rigorosa com um sistema', 'Sim, anoto em planilhas ou caderno', 'Controlo apenas as contas mais importantes', 'Não tenho um controle formal'] },
    { id: 'fq5', text: 'Com que frequência você analisa os resultados financeiros da oficina (faturamento, lucro, despesas)?', options: ['Diariamente ou semanalmente', 'Mensalmente', 'Apenas quando sobra tempo', 'Raramente ou nunca'] },
    { id: 'fq6', text: 'Sua oficina possui uma reserva de emergência para cobrir despesas inesperadas?', options: ['Sim, para pelo menos 3 meses', 'Sim, mas para menos de 3 meses', 'Estou começando a montar uma', 'Não, não tenho reserva'] },
    { id: 'fq7', text: 'Como você lida com clientes inadimplentes?', options: ['Tenho um processo de cobrança estruturado', 'Cobro de forma informal, por telefone/mensagem', 'Espero o cliente vir pagar', 'Tenho muita dificuldade em cobrar'] },
    { id: 'fq8', text: 'Você separa as finanças pessoais das finanças da empresa?', options: ['Sim, totalmente separado com contas diferentes', 'Na maior parte do tempo, mas às vezes misturo', 'Não, uso a mesma conta para tudo', 'Tenho dificuldade em fazer essa separação'] },
    { id: 'fq9', text: 'Você faz algum tipo de planejamento ou projeção financeira para os próximos meses/ano?', options: ['Sim, tenho metas de faturamento e controle de custos', 'Faço projeções simples, sem muito detalhe', 'Penso nisso, mas não coloco no papel', 'Não faço nenhum tipo de planejamento'] },
    { id: 'fq10', text: 'Você utiliza indicadores financeiros (KPIs), como ticket médio, ponto de equilíbrio ou lucratividade?', options: ['Sim, acompanho vários indicadores regularmente', 'Conheço alguns, mas não os calculo sempre', 'Não sei o que são ou como calcular', 'Acho muito complicado para o meu negócio'] },
  ];

const formSchema = z.object({
  oq1: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  oq2: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  oq3: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  oq4: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  oq5: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  oq6: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  oq7: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  oq8: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  oq9: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  oq10: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  operationalAdditionalInfo: z.string().optional(),
  fq1: z.string().optional(),
  fq2: z.string().optional(),
  fq3: z.string().optional(),
  fq4: z.string().optional(),
  fq5: z.string().optional(),
  fq6: z.string().optional(),
  fq7: z.string().optional(),
  fq8: z.string().optional(),
  fq9: z.string().optional(),
  fq10: z.string().optional(),
  financialAdditionalInfo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;
type Step = 'operational' | 'financial';

interface DiagnosticFormProps {
  onAnalysisComplete: (result: DiagnosticDataOutput, input: DiagnosticDataInput) => void;
}

export default function DiagnosticForm({ onAnalysisComplete }: DiagnosticFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('operational');
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        operationalAdditionalInfo: '',
        financialAdditionalInfo: ''
    }
  });

  const steps: Step[] = ['operational', 'financial'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = async () => {
    const operationalFields: (keyof FormData)[] = ['oq1', 'oq2', 'oq3', 'oq4', 'oq5', 'oq6', 'oq7', 'oq8', 'oq9', 'oq10'];
    const financialFields: (keyof FormData)[] = ['fq1', 'fq2', 'fq3', 'fq4', 'fq5', 'fq6', 'fq7', 'fq8', 'fq9', 'fq10'];

    let fieldsToValidate: (keyof FormData)[] = [];
    if (currentStep === 'operational') {
        fieldsToValidate = operationalFields;
    } else if (currentStep === 'financial') {
        fieldsToValidate = financialFields;
    }
    
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStep(steps[currentStepIndex + 1]);
      } else {
        await onSubmit(form.getValues());
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };


  async function onSubmit(values: FormData) {
    setIsLoading(true);

    const operationalData = operationalQuestions.map((q, index) => 
      `Pergunta: ${q.text}\nResposta: ${values[`oq${index + 1}` as keyof FormData]}`
    ).join('\n\n');
    const finalOperationalData = `${operationalData}\n\nInformações Adicionais: ${values.operationalAdditionalInfo || 'Nenhuma'}`;

    const financialData = financialQuestions.map((q, index) => 
        `Pergunta: ${q.text}\nResposta: ${values[`fq${index + 1}` as keyof FormData]}`
    ).join('\n\n');
    const finalFinancialData = `${financialData}\n\nInformações Adicionais: ${values.financialAdditionalInfo || 'Nenhuma'}`;


    const analysisInput: DiagnosticDataInput = {
        operationalData: finalOperationalData,
        financeiroData: finalFinancialData,
        gestaoData: 'N/A',
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

  const progressValue = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-2">Começar o Diagnóstico</h2>
            {currentStep === 'operational' && <p className="text-muted-foreground text-center">Vamos começar pelo Operacional. Responda às perguntas abaixo.</p>}
            {currentStep === 'financial' && <p className="text-muted-foreground text-center">Agora vamos para o Financeiro. Responda com atenção.</p>}
            <Progress value={progressValue} className="w-full mt-4 h-2" />
        </div>
      
      <Form {...form}>
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
          {currentStep === 'operational' && (
            <>
              {operationalQuestions.map((q, index) => (
                <FormField
                  key={q.id}
                  control={form.control}
                  name={`oq${index + 1}` as keyof FormData}
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
                name="operationalAdditionalInfo"
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
            </>
          )}

        {currentStep === 'financial' && (
            <>
              {financialQuestions.map((q, index) => (
                <FormField
                  key={q.id}
                  control={form.control}
                  name={`fq${index + 1}` as keyof FormData}
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
                name="financialAdditionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <Card>
                      <CardHeader>
                        <FormLabel className="text-base font-semibold">Algo mais sobre sua área financeira?</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Se houver mais algum detalhe sobre suas finanças que você queira compartilhar, escreva abaixo.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva aqui qualquer outro ponto relevante sobre seu controle de caixa, precificação, etc."
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
            </>
          )}
          
          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" size="lg" onClick={handleBack} disabled={currentStepIndex === 0 || isLoading}>
              Voltar
            </Button>
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentStepIndex < steps.length - 1 ? 'Próximo' : 'Analisar Dados'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
