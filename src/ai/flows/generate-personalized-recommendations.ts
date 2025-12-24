'use server';

/**
 * @fileOverview Gera recomendações personalizadas com base nos dados de diagnóstico.
 *
 * - generatePersonalizedRecommendations - Uma função que gera recomendações personalizadas.
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

const PersonalizedRecommendationsOutputSchema = z.object({
  report: z.string().describe('Um relatório completo intitulado "Principais Erros de Avaria encontrados", listando as 15 piores respostas em ordem de importância. Para cada item, forneça um passo a passo curto do que aprender, mencionando que existe um módulo específico na comunidade OBD-Pro para resolver o problema.'),
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
  Sua tarefa é criar um relatório de diagnóstico chamado "Principais Erros de Avaria encontrados".

  Analise todas as respostas fornecidas pelo dono da oficina:
  Dados Operacionais: {{{operationalData}}}
  Dados de Gestão: {{{gestaoData}}}
  Dados Financeiros: {{{financeiroData}}}
  Dados de Marketing: {{{marketingData}}}
  DTCs Preliminares: {{{identifiedDTCs}}}

  Com base em todas as informações, identifique as 15 respostas que indicam os problemas mais críticos e urgentes. Ordene-os por ordem de importância para a saúde do negócio.

  Para cada um dos 15 pontos, siga estritamente este formato:
  1.  **Título do Problema:** Descreva o problema de forma clara e direta.
  2.  **Passos para Resolver:** Crie um passo a passo curto e acionável (3 a 4 passos) sobre o que o dono da oficina precisa aprender ou fazer.
  3.  **Direcionamento:** Conclua dizendo: "Para se aprofundar e resolver isso de vez, acesse o módulo [Nome do Módulo] na comunidade OBD-Pro." Use um nome de módulo fictício que faça sentido para o problema (ex: "Gestão Financeira para Oficinas", "Marketing Digital para Mecânicas", "Otimização de Processos Operacionais").

  Seja direto, profissional e encorajador. O objetivo é mostrar o problema e o caminho claro para a solução dentro da sua comunidade.
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
