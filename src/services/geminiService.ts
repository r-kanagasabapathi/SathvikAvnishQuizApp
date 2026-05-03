import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export async function generateQuiz(type: 'math' | 'brain' | 'spelling' | 'vocabulary', difficulty: 'easy' | 'medium' | 'hard'): Promise<QuizQuestion[]> {
  const prompt = `Generate a ${difficulty} quiz for an 8-year-old child. 
  Type: ${type}. 
  The quiz should have 5 questions.
  Provide fun and encouraging feedback explanations for each.
  Format as JSON array of objects.`;

  const systemInstruction = `You are a friendly and encouraging educational assistant for kids. 
  Keep questions age-appropriate for an 8-year-old.
  For math: use simple addition, subtraction, multiplication (up to 12), and basic division.
  For brain: use logic riddles and pattern recognition.
  For spelling/vocab: use common 2nd-3rd grade words.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback static questions in case of API failure
    return [
      {
        question: "What is 5 + 3?",
        options: ["7", "8", "9", "10"],
        correctAnswer: "8",
        explanation: "Great job! 5 fingers and 3 more fingers make 8!"
      }
    ];
  }
}
