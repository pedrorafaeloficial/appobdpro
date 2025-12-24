'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFullReport } from '@/app/actions';
import type { PersonalizedRecommendationsInput, PersonalizedRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CheckCircle2, ChevronRight, Circle, Star, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Logo from '@/components/logo';

type RecommendationItem = PersonalizedRecommendationsOutput['recommendations'][0];

function SolutionSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="bg-card/50">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-5 w-56" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function SolutionsPage() {
  const [report, setReport] = useState<PersonalizedRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchReport = async () => {
      const inputString = sessionStorage.getItem('fullReportInput');
      if (!inputString) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar dados',
          description: 'Não foi possível encontrar os dados do diagnóstico. Por favor, comece de novo.',
        });
        router.push('/');
        return;
      }

      try {
        const input: PersonalizedRecommendationsInput = JSON.parse(inputString);
        const result = await getFullReport(input);
        if (result.success && result.data) {
          setReport(result.data);
        } else {
          throw new Error(result.error || 'Falha ao gerar o relatório.');
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Erro ao gerar relatório',
          description: 'Houve um problema ao criar seu checklist de soluções.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [router, toast]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-4 md:px-8 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Logo />
            <Button onClick={() => router.push('/')}>Começar Novo Diagnóstico</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 md:px-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-center mb-4">Seu Checklist de Soluções</h1>
        <p className="text-muted-foreground text-lg text-center mb-12">
          Aqui estão os passos recomendados para resolver as principais avarias encontradas e impulsionar sua oficina.
        </p>

        {isLoading ? (
          <SolutionSkeleton />
        ) : (
          <div className="space-y-8">
            {report?.recommendations.map((item: RecommendationItem, index: number) => (
              <Card key={index} className="overflow-hidden border-primary/20 shadow-lg shadow-primary/10">
                <CardHeader className="bg-card/80">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <span className="text-primary font-mono text-lg">{item.code}</span>
                    <span>{item.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-md mb-3 text-primary">Plano de Ação:</h3>
                  <ul className="space-y-3">
                    {item.solution.map((sol, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span>{sol.step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="bg-card/80 py-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span>Aprenda a resolver na comunidade OBD-Pro no módulo: <strong className="text-foreground">{item.module}</strong></span>
                    </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <section className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Evolua sua Oficina com a Comunidade OBD-Pro</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
                Tenha acesso a um ecossistema completo com treinamentos, ferramentas e networking para transformar a gestão do seu negócio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Oferta Mensal */}
                <Card className="border-2 border-border hover:border-primary transition-all duration-300 transform hover:-translate-y-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl">Plano Mensal</CardTitle>
                        <CardDescription>Flexibilidade para começar agora.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-left space-y-4">
                        <p className="text-4xl font-bold">R$ 69,70<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Acesso a todo conteúdo já gravado</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Aulas novas toda semana</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Networking com Mecânicos e Autopeças</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Profissionais e Mentores do Mercado</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Certificado de Especialista</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Planilhas de Gestão Prontas</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Acesso à Calculadora de Venda de Peças</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg">Quero o Plano Mensal <ChevronRight className="ml-2 h-4 w-4" /></Button>
                    </CardFooter>
                </Card>

                {/* Oferta Anual */}
                <Card className="border-2 border-primary shadow-2xl shadow-primary/30 relative overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">MAIS POPULAR</div>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl">Plano Anual</CardTitle>
                        <CardDescription>O melhor custo-benefício para sua evolução.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-left space-y-4">
                        <p className="text-4xl font-bold">R$ 697,00<span className="text-lg font-normal text-muted-foreground">/ano</span></p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-primary" />Tudo do plano Mensal, e mais:</li>
                            <li className="flex items-center gap-2 text-primary font-bold"><Star className="h-4 w-4 fill-primary" />Ferramentas de IA completas</li>
                            <li className="flex items-center gap-2 text-primary font-bold"><Star className="h-4 w-4 fill-primary" />Acesso exclusivo aos Professores</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" variant="default">Quero o Plano Anual <ChevronRight className="ml-2 h-4 w-4" /></Button>
                    </CardFooter>
                </Card>
            </div>
        </section>

      </main>
    </div>
  );
}
