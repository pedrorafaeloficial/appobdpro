'use server';

import { analyzeDiagnosticData, DiagnosticDataInput } from '@/ai/flows/analyze-diagnostic-data';
import { generatePersonalizedRecommendations, PersonalizedRecommendationsInput, PersonalizedRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';

export async function runAnalysis(input: DiagnosticDataInput) {
  try {
    const result = await analyzeDiagnosticData(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error running AI analysis:', error);
    return { success: false, error: 'Falha ao analisar os dados. Por favor, tente novamente.' };
  }
}

export async function getFullReport(input: PersonalizedRecommendationsInput): Promise<{ success: boolean; data?: PersonalizedRecommendationsOutput; error?: string; }> {
  try {
    const result = await generatePersonalizedRecommendations(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating full report:', error);
    return { success: false, error: 'Falha ao gerar o relatório. Por favor, tente novamente.' };
  }
}
