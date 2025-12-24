'use server';

import { analyzeDiagnosticData, DiagnosticDataInput } from '@/ai/flows/analyze-diagnostic-data';
import { generatePersonalizedRecommendations, PersonalizedRecommendationsInput } from '@/ai/flows/generate-personalized-recommendations';

export async function runAnalysis(input: DiagnosticDataInput) {
  try {
    const result = await analyzeDiagnosticData(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error running AI analysis:', error);
    return { success: false, error: 'Failed to analyze data. Please try again.' };
  }
}

export async function getFullReport(input: PersonalizedRecommendationsInput) {
  try {
    const result = await generatePersonalizedRecommendations(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating full report:', error);
    return { success: false, error: 'Failed to generate report. Please try again.' };
  }
}
