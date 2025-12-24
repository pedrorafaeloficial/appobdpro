'use server';

/**
 * @fileOverview Gera um checklist de soluções personalizadas com base nos dados de diagnóstico.
 *
 * - generatePersonalizedRecommendations - Uma função que gera um checklist de soluções.
 * - PersonalizedRecommendationsInput - O tipo de entrada para a função generatePersonalizedRecommendations.
 * - PersonalizedRecommendationsOutput - O tipo de retorno para a função generatePersonalizedRecommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  operationalData: z.string().describe('Dados coletados da área operacional do formulário de diagnóstico.'),
  gestaoData: z.string().describe('Dados coletados da área de gestão do formulário de diagnóstico.'),
  financeiroData: z.string().describe('Dados coletados da área financeira do formulário de diagnóstico.'),
  marketingData: z.string().describe('Dados coletados da área de marketing do formulário de diagnóstico.'),
  identifiedDTCs: z.string().describe('Uma lista de DTCs (Códigos de Erro) identificados em cada área.'),
});

export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const SolutionStepSchema = z.object({
  step: z.string().describe("Um passo curto e acionável que o dono da oficina precisa aprender ou fazer."),
});

const RecommendationItemSchema = z.object({
  code: z.string().describe("O código de erro no formato DTC-[ÁREA]-[CÓDIGO_NUMÉRICO] (ex: DTC-OPE-001)."),
  title: z.string().describe("O título do problema de forma clara e direta."),
  solution: z.array(SolutionStepSchema).describe("Uma lista de 3 a 4 passos curtos e acionáveis para resolver o problema."),
  module: z.string().describe("O nome de um módulo fictício na comunidade OBD-Pro para aprofundar na solução (ex: 'Gestão Financeira para Oficinas')."),
});

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z.array(RecommendationItemSchema).describe("Uma lista dos 10 problemas mais críticos e urgentes, ordenados por importância."),
});

export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function generatePersonalizedRecommendations(input: PersonalizedRecommendationsInput): Promise<PersonalizedRecommendationsOutput> {
  return generatePersonalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `Você é um especialista em gestão de oficinas mecânicas e criador da comunidade OBD-Pro.
Sua tarefa é criar um checklist de diagnóstico detalhado.

Analise todas as respostas fornecidas pelo dono da oficina:
Dados Operacionais: {{{operationalData}}}
Dados de Gestão: {{{gestaoData}}}
Dados Financeiros: {{{financeiroData}}}
Dados de Marketing: {{{marketingData}}}
DTCs Preliminares: {{{identifiedDTCs}}}

Com base em todas as informações, identifique os 10 problemas mais críticos e urgentes. Ordene-os por ordem de importância para a saúde do negócio.

Para cada um dos 10 pontos, siga estritamente o schema de saída.

**Código (code):**
Gere um código no formato **DTC-[ÁREA]-[CÓDIGO_NUMÉRICO]**.
- **ÁREA:** Use OPE (Operacional), FIN (Financeiro), GES (Gestão), MKT (Marketing).
- **CÓDIGO_NUMÉRICO:** Use um número sequencial de 3 dígitos (001, 002, etc.).

**Título (title):**
Descreva o problema de forma clara e direta.

**Solução (solution):**
Crie um passo a passo curto e acionável (3 a 4 passos) sobre o que o dono da oficina precisa aprender ou fazer para resolver o problema. Cada passo deve ser um item no array.

**Módulo (module):**
Conclua com o nome de um módulo fictício da comunidade OBD-Pro que faça sentido para o problema (ex: "Gestão Financeira para Oficinas", "Marketing Digital para Mecânicas", "Otimização de Processos Operacionais").

Seja direto, profissional e encorajador. O objetivo é mostrar o problema e o caminho claro para a solução dentro da sua comunidade. Responda apenas com o JSON estruturado.
`,
});

const generatePersonalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
