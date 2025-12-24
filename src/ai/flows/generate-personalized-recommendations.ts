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
  report: z.string().describe('Um relatório completo com recomendações personalizadas para abordar os DTCs identificados e melhorar o desempenho geral do negócio, incluindo orientação sobre como resolvê-los e links para recursos de treinamento da comunidade.'),
});

export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function generatePersonalizedRecommendations(input: PersonalizedRecommendationsInput): Promise<PersonalizedRecommendationsOutput> {
  return generatePersonalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `Você é um assistente de IA projetado para fornecer recomendações personalizadas a proprietários de empresas com base em dados de diagnóstico.

  Analise os seguintes dados de diagnóstico coletados do proprietário da empresa nas áreas de operacional, gestão, financeiro e marketing. Também está incluída uma lista de DTCs (Códigos de Erro) identificados em cada área.

  Dados Operacionais: {{{operationalData}}}
  Dados de Gestão: {{{gestaoData}}}
  Dados Financeiros: {{{financeiroData}}}
  Dados de Marketing: {{{marketingData}}}
  DTCs Identificados: {{{identifiedDTCs}}}

  Com base nessas informações, crie um relatório abrangente com recomendações personalizadas para resolver os DTCs identificados e melhorar o desempenho geral do negócio. Para todos os erros gerados, mostre como resolvê-los e aponte os usuários para a comunidade OBD-Pro para treinamento completo. Seja conciso e acionável.
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
