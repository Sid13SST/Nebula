import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { logger } from '../logging/logger.js';
import { AgentError } from '../errors/AppError.js';

/**
 * GeminiClient handles interactions with the Google Gemini API.
 */
export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AgentError('GEMINI_API_KEY environment variable is not defined.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Helper method to call Gemini API with simple retry/backoff for rate limits.
   */
  private async executeWithRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota');
      if (isRateLimit && retries > 0) {
        logger.warn(`Gemini API rate limit hit (429). Retrying in ${delayMs}ms... (Retries left: ${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.executeWithRetry(fn, retries - 1, delayMs * 2);
      }
      throw error;
    }
  }

  /**
   * Generates standard text response from Gemini.
   */
  public async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    logger.info(`Sending prompt to Gemini model: ${this.modelName}`);
    logger.debug(`Prompt content: ${prompt}`);

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction,
      });

      const response = await this.executeWithRetry(async () => {
        const result = await model.generateContent(prompt);
        return result.response;
      });

      const text = response.text();
      logger.info('Received text response from Gemini.');
      logger.debug(`Response content: ${text}`);
      return text;
    } catch (error: any) {
      logger.error(`Gemini generateText API error: ${error.message}`);
      throw new AgentError(`Gemini generateText failed: ${error.message}`);
    }
  }

  /**
   * Generates structured JSON responses conforming to a given schema.
   */
  public async generateStructuredResponse(
    prompt: string,
    responseSchema: any,
    systemInstruction?: string
  ): Promise<string> {
    logger.info(`Sending structured prompt to Gemini model: ${this.modelName}`);
    logger.debug(`Prompt content: ${prompt}`);

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });

      const response = await this.executeWithRetry(async () => {
        const result = await model.generateContent(prompt);
        return result.response;
      });

      const text = response.text();
      logger.info('Received structured JSON response from Gemini.');
      logger.debug(`Structured response content: ${text}`);
      return text;
    } catch (error: any) {
      logger.error(`Gemini generateStructuredResponse API error: ${error.message}`);
      throw new AgentError(`Gemini generateStructuredResponse failed: ${error.message}`);
    }
  }
}

export default GeminiClient;
