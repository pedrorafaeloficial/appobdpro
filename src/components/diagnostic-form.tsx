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
  { id: 'oq1', text: 'Como você mede o tempo que seus mecânicos levam para concluir um serviço padrão (ex: troca de óleo)?', options: ['Cronometramos e comparamos com tempos de referência', 'Temos uma ideia, mas não é um controle formal', 'Cada um faz no seu tempo', 'Não medimos o tempo'] },
  { id: 'oq2', text: 'Quanto tempo, em média, sua equipe leva para diagnosticar um problema complexo?', options: ['Menos de 1 hora, usamos equipamentos modernos', 'Entre 1 e 2 horas', 'Mais de 2 horas, muitas vezes é na tentativa e erro', 'Depende muito do mecânico'] },
  { id: 'oq3', text: 'Seus mecânicos possuem certificações ou fizeram cursos de atualização nos últimos 12 meses (ex: injeção eletrônica, veículos elétricos/híbridos)?', options: ['Sim, todos participaram de cursos recentes', 'Alguns da equipe, mas não todos', 'Raramente investimos em cursos', 'Não, eles aprendem na prática'] },
  { id: 'oq4', text: 'Sua oficina possui as ferramentas especiais e scanners mais recentes para os modelos de veículos que mais atende?', options: ['Sim, estamos sempre investindo nas melhores ferramentas', 'Temos o básico, mas às vezes precisamos improvisar', 'Nossas ferramentas estão um pouco desatualizadas', 'Muitas vezes recusamos serviços por falta de ferramenta'] },
  { id: 'oq5', text: 'Qual é o índice de retrabalho na sua oficina? (serviços que precisam ser refeitos)', options: ['Quase zero, temos um controle de qualidade rigoroso', 'Baixo, acontece esporadicamente', 'Médio, acontece com alguma frequência e gera reclamações', 'Alto, é uma fonte constante de prejuízo e estresse'] },
  { id: 'oq6', text: 'Como a equipe lida com diagnósticos difíceis?', options: ['Colaboramos em equipe e usamos base de dados técnica', 'O mecânico mais experiente assume', 'Cada um tenta resolver sozinho, na base da experiência', 'Ficamos travados e demoramos muito para resolver'] },
  { id: 'oq7', text: 'Qual o nível de conhecimento da sua equipe sobre veículos elétricos e híbridos?', options: ['Temos especialistas e já atendemos com segurança', 'Temos conhecimento básico, mas ainda com insegurança', 'Muito pouco, evitamos pegar esses serviços', 'Nenhum, não estamos preparados'] },
  { id: 'oq8', text: 'O fluxo de carros no pátio é organizado ou os mecânicos perdem tempo manobrando veículos?', options: ['É muito organizado, cada carro tem seu lugar definido', 'É relativamente organizado, com pequenos atrasos', 'É confuso, perdemos tempo manobrando carros', 'É caótico, um dos maiores gargalos de tempo'] },
  { id: 'oq9', text: 'Sua equipe sabe vender serviços adicionais identificados durante a manutenção? (ex: troca de filtro, alinhamento)', options: ['Sim, são treinados para isso e têm metas', 'Sim, mas fazem isso de forma intuitiva, sem processo', 'Raramente, eles focam apenas no serviço principal', 'Não, eles não têm essa habilidade de vendas'] },
  { id: 'oq10', text: 'Com que frequência a falta de uma peça no estoque atrasa a liberação de um veículo?', options: ['Raramente, nosso controle de estoque é muito eficiente', 'Ocasionalmente, para peças menos comuns', 'Frequentemente, afeta nossa produtividade diária', 'Sempre, é nosso principal motivo de atraso'] },
];

const financialQuestions = [
    { id: 'fq1', text: 'Você sabe exatamente qual foi o lucro líquido da sua oficina no último mês?', options: ['Sim, tenho o número exato na ponta do lápis', 'Tenho uma boa estimativa, mas não o valor preciso', 'Sei o faturamento, mas não o lucro real', 'Não tenho certeza, o dinheiro entra e sai'] },
    { id: 'fq2', text: 'Como você define o preço da sua mão de obra?', options: ['Calculo com base no custo por hora e margem de lucro desejada', 'Uso um valor fixo por tipo de serviço', 'Sigo a média de preço da concorrência na região', 'Defino um preço que acho justo, sem muito cálculo'] },
    { id: 'fq3', text: 'Qual é a margem de lucro que você aplica na venda de peças?', options: ['Calculo o markup ideal para cada peça ou categoria', 'Aplico uma porcentagem fixa sobre o custo de todas as peças', 'Dobro o valor que paguei na peça', 'Não tenho uma regra clara, depende da peça e do cliente'] },
    { id: 'fq4', text: 'Sua oficina tem um capital de giro para cobrir as despesas por quantos meses sem depender das vendas?', options: ['Mais de 3 meses, estou tranquilo', 'De 1 a 2 meses, com alguma segurança', 'Menos de 1 mês, vivo no limite', 'Não tenho reserva, dependo do faturamento do dia'] },
    { id: 'fq5', text: 'Com que frequência você reajusta sua tabela de preços de mão de obra e serviços?', options: ['Anualmente ou sempre que os custos aumentam', 'A cada dois anos, ou quando sinto que está defasada', 'Raramente, tenho medo de perder clientes se aumentar', 'Nunca reajustei meus preços'] },
    { id: 'fq6', text: 'Você consegue diferenciar o que é faturamento e o que é lucro?', options: ['Sim, com total clareza, e acompanho os dois', 'Entendo a diferença, mas foco mais no faturamento', 'É um pouco confuso, para mim o que importa é o dinheiro em caixa', 'Não, para mim é quase a mesma coisa'] },
    { id: 'fq7', text: 'Como você lida com o pagamento de fornecedores de peças?', options: ['Pago tudo à vista para ter o melhor desconto', 'Compro a prazo e tenho um controle rigoroso das datas de pagamento', 'Às vezes atraso pagamentos por falta de organização', 'Pago conforme o dinheiro entra, sem muito controle'] },
    { id: 'fq8', text: 'Qual o percentual do seu faturamento que é comprometido com custos fixos (aluguel, salários, etc.)?', options: ['Sei exatamente o percentual e o acompanho de perto', 'Tenho uma noção, mas não o número exato', 'É alto, sinto que trabalho só para pagar contas', 'Não faço ideia desse cálculo'] },
    { id: 'fq9', text: 'Você utiliza alguma ferramenta para gestão financeira?', options: ['Sim, uso um software de gestão completo', 'Uso planilhas de Excel bem estruturadas', 'Anoto tudo em um caderno', 'Controlo tudo de cabeça ou no extrato do banco'] },
    { id: 'fq10', text: 'Ao vender uma peça, como você decide o preço final para o cliente?', options: ['Meu sistema já sugere o preço com base no markup cadastrado', 'Aplico uma porcentagem padrão sobre o valor que paguei', 'Pesquiso o preço da peça na internet e coloco um valor acima', 'Depende da cara do cliente'] },
];
  
const managementQuestions = [
    { id: 'gq1', text: 'Sua equipe entende a missão da empresa e trabalha alinhada com ela?', options: ['Sim, eles são engajados e agem como "donos" do negócio', 'Alguns são engajados, outros apenas cumprem o horário', 'Eles estão aqui pelo salário, não se importam muito com a marca', 'Não temos uma missão clara, então não há como saber'] },
    { id: 'gq2', text: 'Qual é o nível de produtividade da sua equipe?', options: ['Alto, todos sabem o que fazer e são proativos', 'Bom, mas às vezes precisam de um empurrão para render mais', 'Regular, há muita conversa e tempo ocioso', 'Baixo, sinto que a equipe está desmotivada e produz pouco'] },
    { id: 'gq3', text: 'Você realiza reuniões de feedback individual com sua equipe para discutir desempenho e carreira?', options: ['Sim, periodicamente, para alinhar expectativas e desenvolvimento', 'Apenas quando há um problema de desempenho a ser corrigido', 'Raramente, a conversa é sempre informal e no dia a dia', 'Não, nunca fiz uma reunião de feedback formal'] },
    { id: 'gq4', text: 'Como você reconhece um bom trabalho ou um desempenho excepcional de um funcionário?', options: ['Temos um programa de bônus ou comissão por produtividade/qualidade', 'Com elogios públicos e agradecimentos', 'Apenas verbalmente, de forma particular', 'Não tenho o costume de dar reconhecimento, é a obrigação dele'] },
    { id: 'gq5', text: 'O ambiente de trabalho na sua oficina é colaborativo ou competitivo?', options: ['Altamente colaborativo, um ajuda o outro a resolver problemas', 'Normal, cada um faz o seu, mas ajudam se solicitado', 'Um pouco competitivo, há disputas por serviços melhores', 'Muito competitivo e individualista, o que gera conflitos'] },
    { id: 'gq6', text: 'Se você precisasse se ausentar da oficina por uma semana, o negócio continuaria funcionando sem problemas?', options: ['Sim, a equipe é autogerenciável e os processos são claros', 'Funcionaria, mas com algumas dificuldades e muitas ligações', 'Provavelmente teria problemas sérios na minha ausência', 'Não, a oficina depende 100% de mim para funcionar'] },
    { id: 'gq7', text: 'Seus funcionários se sentem à vontade para dar sugestões de melhoria nos processos?', options: ['Sim, temos canais abertos e incentivamos as ideias', 'Às vezes, mas nem sempre as sugestões são ouvidas', 'Não, eles têm receio de questionar a forma como as coisas são feitas', 'Eu sou o dono e sei o que é melhor, então não peço sugestões'] },
    { id: 'gq8', text: 'Qual é a taxa de rotatividade (turnover) de funcionários na sua oficina?', options: ['Baixíssima, a equipe está comigo há anos', 'Baixa, perco um ou outro funcionário esporadicamente', 'Média, sempre estou contratando e demitindo', 'Alta, tenho dificuldade em reter talentos'] },
    { id: 'gq9', text: 'Sua equipe se preocupa com a limpeza e organização do ambiente de trabalho?', options: ['Sim, é uma cultura, todos cuidam do espaço como se fosse deles', 'Apenas quando eu cobro e organizo mutirões de limpeza', 'Não muito, a oficina está frequentemente suja e desorganizada', 'É um caos, cada um deixa suas ferramentas espalhadas'] },
    { id: 'gq10', text: 'Seus funcionários vestem uniforme e se apresentam de forma profissional aos clientes?', options: ['Sim, todos usam uniformes limpos e se identificam', 'Alguns usam, outros não; não há um padrão', 'Não, cada um vem com sua própria roupa', 'A aparência não é algo com que nos preocupamos'] },
];

const marketingQuestions = [
    { id: 'mq1', text: 'O Perfil da sua Empresa no Google (Google Meu Negócio) está completo, com fotos, horário e boas avaliações?', options: ['Sim, está 100% otimizado e respondo todas as avaliações', 'Está criado, mas desatualizado e com poucas avaliações', 'Nem sei se tenho ou como acessar', 'O que é Google Meu Negócio?'] },
    { id: 'mq2', text: 'Sua oficina já apareceu em algum vídeo ou post que "viralizou" localmente no Instagram ou TikTok?', options: ['Sim, já tivemos picos de clientes por causa de um conteúdo', 'Não, nosso conteúdo é mais institucional e não viraliza', 'Nunca pensei em criar conteúdo em vídeo nesse formato', 'Tenho vergonha de aparecer ou acho que não funciona'] },
    { id: 'mq3', text: 'Qual sua principal fonte de novos clientes hoje?', options: ['Indicação (boca a boca) e clientes que passam na frente', 'Redes sociais e conteúdo que postamos', 'Anúncios pagos no Google ou Instagram', 'Não sei de onde vêm os clientes novos'] },
    { id: 'mq4', text: 'Como você captura o contato (nome, e-mail, whatsapp) de um cliente que entra na oficina?', options: ['Tenho um sistema/ficha de cadastro e pego os dados de todos', 'Anoto o nome e telefone na ordem de serviço em papel', 'Só pego o contato se o serviço for demorar', 'Não tenho o hábito de pedir e registrar os contatos'] },
    { id: 'mq5', text: 'Você realiza alguma ação de pós-venda, como ligar para saber se o serviço ficou bom ou enviar lembrete da próxima revisão?', options: ['Sim, temos um processo automático ou manual para contatar todos os clientes', 'Faço isso esporadicamente, quando lembro', 'Apenas se o cliente entra em contato para reclamar', 'Não, depois que o cliente paga, o contato acaba'] },
    { id: 'mq6', text: 'Seu processo comercial se resume a "passar o orçamento" ou você usa técnicas de venda para mostrar valor?', options: ['Somos consultores, explicamos o problema e mostramos o valor da solução', 'Passamos o orçamento e torcemos para o cliente fechar', 'Brigamos por preço, geralmente damos desconto para fechar', 'Perco muitos orçamentos e não sei o porquê'] },
    { id: 'mq7', text: 'Você tem um banco de fotos e vídeos de "antes e depois" dos serviços para usar no marketing?', options: ['Sim, registramos os melhores casos para postar', 'Tiro fotos às vezes, mas ficam perdidas no celular', 'Não tenho o hábito de registrar os serviços', 'Acho desnecessário mostrar o "antes", só o carro pronto'] },
    { id: 'mq8', text: 'Sua oficina tem uma fachada atraente e bem sinalizada, que chama a atenção de quem passa na rua?', options: ['Sim, é limpa, iluminada e profissional', 'É ok, mas poderia ser mais chamativa', 'Minha fachada é antiga e um pouco descuidada', 'É difícil de encontrar ou a aparência afasta clientes'] },
    { id: 'mq9', text: 'Você já fez alguma parceria com comércios locais ou influenciadores da sua cidade para divulgar a oficina?', options: ['Sim, tenho parcerias ativas que me trazem clientes', 'Já tentei, mas não tive muito resultado', 'Tenho interesse, mas não sei por onde começar', 'Não acredito que isso funcione para o meu negócio'] },
    { id: 'mq10', text: 'Quando um cliente indica um amigo, você oferece algum benefício a quem indicou?', options: ['Sim, tenho um programa "Indique e Ganhe" estruturado', 'Agradeço, mas não ofereço nada em troca', 'Nunca pensei em fazer isso', 'Não fico sabendo quando um cliente é indicado por outro'] },
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
  fq1: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  fq2: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  fq3: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  fq4: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  fq5: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  fq6: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  fq7: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  fq8: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  fq9: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  fq10: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  financialAdditionalInfo: z.string().optional(),
  gq1: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  gq2: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  gq3: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  gq4: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  gq5: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  gq6: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  gq7: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  gq8: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  gq9: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  gq10: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  managementAdditionalInfo: z.string().optional(),
  mq1: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  mq2: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  mq3: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  mq4: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  mq5: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  mq6: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  mq7: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  mq8: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  mq9: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  mq10: z.string({ required_error: 'Por favor, selecione uma resposta.' }),
  marketingAdditionalInfo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;
type Step = 'operational' | 'financial' | 'management' | 'marketing';

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
        financialAdditionalInfo: '',
        managementAdditionalInfo: '',
        marketingAdditionalInfo: '',
    }
  });

  const steps: Step[] = ['operational', 'financial', 'management', 'marketing'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = async () => {
    const operationalFields: (keyof FormData)[] = ['oq1', 'oq2', 'oq3', 'oq4', 'oq5', 'oq6', 'oq7', 'oq8', 'oq9', 'oq10'];
    const financialFields: (keyof FormData)[] = ['fq1', 'fq2', 'fq3', 'fq4', 'fq5', 'fq6', 'fq7', 'fq8', 'fq9', 'fq10'];
    const managementFields: (keyof FormData)[] = ['gq1', 'gq2', 'gq3', 'gq4', 'gq5', 'gq6', 'gq7', 'gq8', 'gq9', 'gq10'];
    const marketingFields: (keyof FormData)[] = ['mq1', 'mq2', 'mq3', 'mq4', 'mq5', 'mq6', 'mq7', 'mq8', 'mq9', 'mq10'];

    let fieldsToValidate: (keyof FormData)[] = [];
    if (currentStep === 'operational') {
        fieldsToValidate = operationalFields;
    } else if (currentStep === 'financial') {
        fieldsToValidate = financialFields;
    } else if (currentStep === 'management') {
        fieldsToValidate = managementFields;
    } else if (currentStep === 'marketing') {
        fieldsToValidate = marketingFields;
    }
    
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStep(steps[currentStepIndex + 1]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        await onSubmit(form.getValues());
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const managementData = managementQuestions.map((q, index) =>
        `Pergunta: ${q.text}\nResposta: ${values[`gq${index + 1}` as keyof FormData]}`
    ).join('\n\n');
    const finalManagementData = `${managementData}\n\nInformações Adicionais: ${values.managementAdditionalInfo || 'Nenhuma'}`;

    const marketingData = marketingQuestions.map((q, index) =>
        `Pergunta: ${q.text}\nResposta: ${values[`mq${index + 1}` as keyof FormData]}`
    ).join('\n\n');
    const finalMarketingData = `${marketingData}\n\nInformações Adicionais: ${values.marketingAdditionalInfo || 'Nenhuma'}`;


    const analysisInput: DiagnosticDataInput = {
        operationalData: finalOperationalData,
        financeiroData: finalFinancialData,
        gestaoData: finalManagementData,
        marketingData: finalMarketingData
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
            {currentStep === 'management' && <p className="text-muted-foreground text-center">Ótimo! Agora vamos falar sobre Gestão.</p>}
            {currentStep === 'marketing' && <p className="text-muted-foreground text-center">Última etapa! Vamos falar sobre Marketing e Vendas.</p>}
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

          {currentStep === 'management' && (
            <>
              {managementQuestions.map((q, index) => (
                <FormField
                  key={q.id}
                  control={form.control}
                  name={`gq${index + 1}` as keyof FormData}
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
                name="managementAdditionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <Card>
                      <CardHeader>
                        <FormLabel className="text-base font-semibold">Algo mais sobre sua gestão?</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Se houver mais algum detalhe sobre sua gestão de pessoas ou processos que queira compartilhar, escreva abaixo.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva aqui qualquer outro ponto relevante sobre liderança, equipe, metas, etc."
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

          {currentStep === 'marketing' && (
            <>
              {marketingQuestions.map((q, index) => (
                <FormField
                  key={q.id}
                  control={form.control}
                  name={`mq${index + 1}` as keyof FormData}
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
                name="marketingAdditionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <Card>
                      <CardHeader>
                        <FormLabel className="text-base font-semibold">Algo mais sobre seu Marketing e Vendas?</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Se houver mais algum detalhe sobre sua estratégia de marketing que queira compartilhar, escreva abaixo.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva aqui qualquer outro ponto relevante sobre atração de clientes, redes sociais, etc."
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
