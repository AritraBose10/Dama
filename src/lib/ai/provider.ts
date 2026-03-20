import { GoogleGenerativeAI } from "@google/generative-ai";

export type AIProviderName = 'GROQ' | 'ANTHROPIC' | 'OPENAI' | 'GEMINI' | 'LOCAL';

export interface AIResponse {
  text: string;
  isStreaming?: boolean;
}

export interface AIProvider {
  name: AIProviderName;
  generateText(prompt: string, context?: any): Promise<AIResponse>;
  streamText(prompt: string, context?: any): AsyncGenerator<string>;
}

class GeminiProvider implements AIProvider {
  name: AIProviderName = 'GEMINI';
  private genAI: GoogleGenerativeAI;
  private systemInstruction = "You are ClinIQ AI, a clinical workflow assistant. Mode: WORKFLOW ONLY. NO AUTO-ORDERS. NO DIAGNOSIS. Respond in a concise, professional clinical tone. Use monospace formatting if helpful.";

  constructor() {
    // We enforce using the NEXT_PUBLIC_GEMINI_API_KEY environment variable.
    this.genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'fake_key_for_build');
  }

  async generateText(prompt: string, context?: any): Promise<AIResponse> {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: this.systemInstruction,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { text: response.text() };
  }

  async *streamText(prompt: string, context?: any): AsyncGenerator<string> {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: this.systemInstruction,
    });

    const fullPrompt = `Context: ${JSON.stringify(context)}\n\nPrompt: ${prompt}`;
    const result = await model.generateContentStream(fullPrompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  }
}

export const aiProvider: AIProvider = new GeminiProvider();
