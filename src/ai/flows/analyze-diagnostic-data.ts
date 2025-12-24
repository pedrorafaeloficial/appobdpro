'use server';

/**
 * @fileOverview Analisa dados de diagnóstico e sugere DTCs (Códigos de Falha de Diagnóstico) para várias áreas de negócio.
 *
 * - analyzeDiagnosticData - Uma função que analisa dados de diagnóstico e retorna potenciais DTCs e recomendações.
 * - DiagnosticDataInput - O tipo de entrada para a função analyzeDiagnosticData.
 * - DiagnosticDataOutput - O tipo de retorno para a função analyzeDiagnosticData.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosticDataInputSchema = z.object({
  operationalData: z.string().describe('Dados relacionados à área operacional do negócio.'),
  gestaoData: z.string().describe('Dados relacionados à área de gestão do negócio.'),
  financeiroData: z.string().describe('Dados relacionados à área financeira do negócio.'),
  marketingData: z.string().describe('Dados relacionados à área de marketing do negócio.'),
});
export type DiagnosticDataInput = z.infer<typeof DiagnosticDataInputSchema>;

const DiagnosticDataOutputSchema = z.object({
  operationalDTCs: z.string().describe('Potenciais DTCs (Códigos de Erro) identificados na área operacional.'),
  gestaoDTCs: z.string().describe('Potenciais DTCs identificados na área de gestão.'),
  financeiroDTCs: z.string().describe('Potenciais DTCs identificados na área financeira.'),
  marketingDTCs: z.string().describe('Potenciais DTCs identificados na área de marketing.'),
  recommendations: z.string().describe('Recomendações personalizadas para abordar os DTCs identificados e melhorar o desempenho geral do negócio, com links para a comunidade OBD-Pro.'),
});
export type DiagnosticDataOutput = z.infer<typeof DiagnosticDataOutputSchema>;

export async function analyzeDiagnosticData(input: DiagnosticDataInput): Promise<DiagnosticDataOutput> {
  return analyzeDiagnosticDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDiagnosticDataPrompt',
  input: {schema: DiagnosticDataInputSchema},
  output: {schema: DiagnosticDataOutputSchema},
  prompt: `Você é um especialista em diagnósticos de negócios de IA. Analise os dados fornecidos de um formulário de diagnóstico de negócios e identifique potenciais DTCs (Códigos de Erro) em cada área (Operacional, Gestão, Financeiro e Marketing). Forneça recomendações personalizadas para resolver os DTCs identificados e melhorar o desempenho geral do negócio. Para todos os erros gerados, mostre como resolvê-los e aponte os usuários para a comunidade OBD-Pro para treinamento completo.

Dados Operacionais: {{{operationalData}}}
Dados de Gestão: {{{gestaoData}}}
Dados Financeiros: {{{financeiroData}}}
Dados de Marketing: {{{marketingData}}}

Responda com potenciais DTCs e recomendações para cada uma das áreas.`,
});

const analyzeDiagnosticDataFlow = ai.defineFlow(
  {
    name: 'analyzeDiagnosticDataFlow',
    inputSchema: DiagnosticDataInputSchema,
    outputSchema: DiagnosticDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
