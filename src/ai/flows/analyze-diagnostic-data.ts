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
  operationalDTCs: z.string().describe('Uma lista de até 4 DTCs (Códigos de Erro) mais críticos identificados na área operacional, formatados como uma lista de marcadores.'),
  gestaoDTCs: z.string().describe('Uma lista de até 4 DTCs mais críticos identificados na área de gestão, formatados como uma lista de marcadores.'),
  financeiroDTCs: z.string().describe('Uma lista de até 4 DTCs mais críticos identificados na área financeira, formatados como uma lista de marcadores.'),
  marketingDTCs: z.string().describe('Uma lista de até 4 DTCs mais críticos identificados na área de marketing, formatados como uma lista de marcadores.'),
  recommendations: z.string().describe('Um resumo de 2-3 frases com recomendações iniciais para os problemas mais urgentes.'),
});
export type DiagnosticDataOutput = z.infer<typeof DiagnosticDataOutputSchema>;

export async function analyzeDiagnosticData(input: DiagnosticDataInput): Promise<DiagnosticDataOutput> {
  return analyzeDiagnosticDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDiagnosticDataPrompt',
  input: {schema: DiagnosticDataInputSchema},
  output: {schema: DiagnosticDataOutputSchema},
  prompt: `Você é um especialista em diagnósticos de negócios para oficinas automotivas. Analise os dados do formulário de diagnóstico e, para cada área (Operacional, Gestão, Financeiro e Marketing), identifique os 4 principais DTCs (Códigos de Erro) mais críticos. Apresente cada lista de DTCs como uma lista de marcadores simples (usando "-"). Além disso, forneça um resumo de 2 a 3 frases com as recomendações mais urgentes e iniciais.

Dados Operacionais: {{{operationalData}}}
Dados de Gestão: {{{gestaoData}}}
Dados Financeiros: {{{financeiroData}}}
Dados de Marketing: {{{marketingData}}}

Responda apenas com os DTCs e as recomendações, conforme o schema de saída.`,
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
