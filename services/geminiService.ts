
import { GoogleGenAI } from "@google/genai";
import { EggRecord } from "../types";

// Always initialize GoogleGenAI with a named parameter using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  analyzeData: async (records: EggRecord[]): Promise<string> => {
    // API Key availability is assumed as per guidelines; no manual configuration checks are needed here.
    if (records.length === 0) {
      return "Não há dados suficientes para análise. Realize alguns lançamentos primeiro.";
    }

    // Get last 7 records
    const recentData = records.slice(0, 7);
    const dataSummary = recentData.map(r => 
      `Data: ${r.date}, Aves: ${r.birdCount}, Ovos: ${r.totalEggs}, Perdas: ${r.brokenEggs}, Ração: ${r.totalFeed}kg`
    ).join('\n');

    const prompt = `
      Você é um consultor especializado em avicultura de postura para uma escola agrícola.
      Analise os seguintes dados dos últimos 7 dias:
      
      ${dataSummary}
      
      Forneça:
      1. Um insight educativo sobre a eficiência atual.
      2. Alerta de anomalias (se houver quedas bruscas ou excesso de perdas).
      3. 3 Recomendações práticas de manejo técnico para melhorar os resultados.
      
      Responda em português de forma clara e profissional para estudantes.
    `;

    try {
      // Use ai.models.generateContent to query the model with prompt and config
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      // Extract generated text directly from the response.text property
      return response.text || "Não foi possível gerar a análise agora.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Erro ao conectar com a IA. Tente novamente mais tarde.";
    }
  }
};
