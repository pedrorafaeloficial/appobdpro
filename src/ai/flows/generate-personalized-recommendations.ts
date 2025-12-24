'use server';

/**
 * @fileOverview Generates personalized recommendations based on diagnostic data.
 *
 * - generatePersonalizedRecommendations - A function that generates personalized recommendations.
 * - PersonalizedRecommendationsInput - The input type for the generatePersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the generatePersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  operationalData: z.string().describe('Data collected from the operational area of the diagnostic form.'),
  gestaoData: z.string().describe('Data collected from the gestão (management) area of the diagnostic form.'),
  financeiroData: z.string().describe('Data collected from the financeiro (financial) area of the diagnostic form.'),
  marketingData: z.string().describe('Data collected from the marketing area of the diagnostic form.'),
  identifiedDTCs: z.string().describe('A list of identified DTCs (Error Codes) in each area.'),
});

export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const PersonalizedRecommendationsOutputSchema = z.object({
  report: z.string().describe('A complete report with tailored recommendations to address the identified DTCs and improve overall business performance, including guidance on how to resolve them and links to community training resources.'),
});

export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function generatePersonalizedRecommendations(input: PersonalizedRecommendationsInput): Promise<PersonalizedRecommendationsOutput> {
  return generatePersonalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized recommendations to business owners based on diagnostic data.

  Analyze the following diagnostic data collected from the business owner in the areas of operational, gestão (management), financeiro (financial), and marketing. Also included is a list of identified DTCs (Error Codes) in each area.

  Operational Data: {{{operationalData}}}
  Gestão Data: {{{gestaoData}}}
  Financeiro Data: {{{financeiroData}}}
  Marketing Data: {{{marketingData}}}
  Identified DTCs: {{{identifiedDTCs}}}

  Based on this information, create a comprehensive report with tailored recommendations to address the identified DTCs and improve overall business performance. For all generated errors, show how to resolve them, and point users to the OBD-Pro community for complete training. Be concise and actionable.
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
