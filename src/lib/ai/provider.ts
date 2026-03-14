import Groq from "groq-sdk";

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

class GroqProvider implements AIProvider {
  name: AIProviderName = 'GROQ';
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || 'fake_key_for_build',
      dangerouslyAllowBrowser: true, // For development demonstration
    });
  }

  async generateText(prompt: string, context?: any): Promise<AIResponse> {
    const completion = await this.groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are ClinIQ AI, a clinical workflow assistant. Mode: WORKFLOW ONLY. NO AUTO-ORDERS. NO DIAGNOSIS. Respond in a concise, professional clinical tone." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
    });

    return { text: completion.choices[0]?.message?.content || "" };
  }

  async *streamText(prompt: string, context?: any): AsyncGenerator<string> {
    const stream = await this.groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are ClinIQ AI, a clinical workflow assistant. Mode: WORKFLOW ONLY. NO AUTO-ORDERS. NO DIAGNOSIS. Respond in a concise, professional clinical tone. Use monospace formatting if helpful." },
        { role: "user", content: `Context: ${JSON.stringify(context)}\n\nPrompt: ${prompt}` }
      ],
      model: "llama-3.3-70b-versatile",
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  }
}

export const aiProvider: AIProvider = new GroqProvider();
