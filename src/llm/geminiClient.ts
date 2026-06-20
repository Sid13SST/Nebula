/**
 * GeminiClient handles interactions with the Google Gemini API.
 */
export class GeminiClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    // TODO: Initialize Google Gen AI / Gemini client libraries using the API key
  }

  /**
   * Submits a prompt to the Gemini model and returns a response.
   * 
   * TODO: Implement Prompt Submission:
   * - Send system prompts, instruction lists, or screenshots.
   * 
   * TODO: Implement Structured JSON Responses:
   * - Force the model to output parsed JSON matching a specific schema (e.g. Action schema).
   */
  public async submitPrompt(prompt: string, options?: { jsonSchema?: any }): Promise<string> {
    // TODO: Call Google Gen AI API
    throw new Error('Not implemented yet');
  }
}

export default GeminiClient;
