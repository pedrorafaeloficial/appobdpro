'use server';

/**
 * @fileOverview Analyzes diagnostic data and suggests DTCs (Diagnostic Trouble Codes) for various business areas.
 *
 * - analyzeDiagnosticData - A function that analyzes diagnostic data and returns potential DTCs and recommendations.
 * - DiagnosticDataInput - The input type for the analyzeDiagnosticData function.
 * - DiagnosticDataOutput - The return type for the analyzeDiagnosticData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosticDataInputSchema = z.object({
  operationalData: z.string().describe('Data related to the operational area of the business.'),
  gestaoData: z.string().describe('Data related to the gestão (management) area of the business.'),
  financeiroData: z.string().describe('Data related to the financeiro (financial) area of the business.'),
  marketingData: z.string().describe('Data related to the marketing area of the business.'),
});
export type DiagnosticDataInput = z.infer<typeof DiagnosticDataInputSchema>;

const DiagnosticDataOutputSchema = z.object({
  operationalDTCs: z.string().describe('Potential DTCs (Error Codes) identified in the operational area.'),
  gestaoDTCs: z.string().describe('Potential DTCs identified in the gestão (management) area.'),
  financeiroDTCs: z.string().describe('Potential DTCs identified in the financeiro (financial) area.'),
  marketingDTCs: z.string().describe('Potential DTCs identified in the marketing area.'),
  recommendations: z.string().describe('Tailored recommendations to address the identified DTCs and improve overall business performance, with links to the OBD-Pro community.'),
});
export type DiagnosticDataOutput = z.infer<typeof DiagnosticDataOutputSchema>;

export async function analyzeDiagnosticData(input: DiagnosticDataInput): Promise<DiagnosticDataOutput> {
  return analyzeDiagnosticDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDiagnosticDataPrompt',
  input: {schema: DiagnosticDataInputSchema},
  output: {schema: DiagnosticDataOutputSchema},
  prompt: `You are an AI expert in business diagnostics. Analyze the data provided from a business diagnostic form and identify potential DTCs (Error Codes) in each area (Operational, Gestão (Management), Financeiro (Financial), and Marketing). Provide tailored recommendations to address the identified DTCs and improve overall business performance. For all generated errors, show how to resolve them, and point users to the OBD-Pro community for complete training.

Operational Data: {{{operationalData}}}
Gestão Data: {{{gestaoData}}}
Financeiro Data: {{{financeiroData}}}
Marketing Data: {{{marketingData}}}

Respond with potential DTCs and recommendations for each of the areas.`,
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
