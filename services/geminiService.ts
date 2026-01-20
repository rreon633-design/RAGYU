
import { GoogleGenAI, Type, Schema, GenerateContentResponse } from "@google/genai";
import { LIBRA_SYSTEM_PROMPT } from "../constants";
import { QuizConfig, Question, UserSettings } from "../types";

export const getLibraResponseStream = async function* (history: { role: string; content: string }[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      })),
      config: {
        systemInstruction: LIBRA_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) yield text;
    }
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    yield "Something went wrong. Please check your connection or project settings.";
  }
};

export const getLibraResponse = async (history: { role: string; content: string }[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      })),
      config: {
        systemInstruction: LIBRA_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Something went wrong. Please check your connection or project settings.";
  }
};

export const generateQuizQuestions = async (config: QuizConfig, userPreferences?: UserSettings): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let preferencesContext = '';
  if (userPreferences) {
    const topics = userPreferences.preferredTopics?.join(', ');
    if (topics) {
      preferencesContext = `\n  User Context:
  - Preferred Topics: ${topics}
  
  Instruction: If the user's preferred topics fall within the requested Subject (${config.subject}), prioritize generating questions for them.`;
    }
  }

  const prompt = `Generate ${config.questionCount} multiple-choice questions for the ${config.exam} domain.
  Subject: ${config.subject}
  Topics: ${config.topics.length > 0 ? config.topics.join(', ') : 'General syllabus topics'}
  Difficulty: ${config.difficulty}${preferencesContext}

  REQUIREMENTS:
  1. For TECHNICAL topics (Java, Python, Web Dev, etc.), include code snippets where relevant using markdown code blocks.
  2. For QUANT/MATH, use LaTeX for ANY mathematical expressions or formulas (e.g., $x^2 + y^2$, $\\frac{a}{b}$).
  3. Provide exactly 4 options for each question.
  4. The 'correctIndex' must be 0, 1, 2, or 3.
  5. The 'explanation' must be detailed and helpful for students.
  6. **CRITICAL**: Include a 'visualAid' field containing a valid raw SVG string (<svg...></svg>) that visually explains the solution. 
     - For Coding: Draw a logic flow, stack/heap diagram, or memory layout.
     - For Geometry: Draw the labeled shape.
     - For Data Interpretation: Draw a simple bar/pie chart.
     - Keep SVGs simple, using a standard viewBox="0 0 300 200". Use attractive colors (blues, emeralds, oranges).
  7. Return STRICT JSON.
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        text: { type: Type.STRING, description: "The question text. Use markdown code blocks for code and LaTeX where appropriate." },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Exactly 4 options"
        },
        correctIndex: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
        explanation: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step solution"
            },
            tricks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Shortcuts or tips"
            },
            concept: { type: Type.STRING, description: "The core concept tested" },
            visualAid: { type: Type.STRING, description: "A raw SVG string (<svg ...>...</svg>) illustrating the solution or concept. Do not wrap in markdown code blocks." }
          },
          required: ["steps", "tricks", "concept", "visualAid"]
        }
      },
      required: ["id", "text", "options", "correctIndex", "explanation"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Empty response from AI");
    }
    
    const questions = JSON.parse(jsonText) as Question[];
    return questions.map((q, index) => ({
      ...q,
      id: `ai-gen-${index}-${Date.now()}`
    }));

  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw error;
  }
};
