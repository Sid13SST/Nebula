import { ActionPlan, ActionPlanSchema } from '../types/action.js';
import { PageObservation } from '../types/observation.js';
import { GeminiClient } from '../llm/geminiClient.js';
import { SYSTEM_PROMPT, ACTION_PLANNING_PROMPT } from '../llm/prompts.js';
import { AgentError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';

/**
 * Planner is responsible for translating high-level goals into step-by-step actions using LLM reasoning.
 */
export class Planner {
  private geminiClient: GeminiClient;

  constructor(providedGeminiClient?: GeminiClient) {
    this.geminiClient = providedGeminiClient || new GeminiClient();
  }

  /**
   * Generates a validated action plan to achieve the user's goal based on page observations.
   */
  public async plan(goal: string, observation: PageObservation): Promise<ActionPlan> {
    logger.info('Planning started');
    
    // Generate prompt by replacing placeholders
    const serializedElements = JSON.stringify(
      observation.elements.map((el) => ({
        id: el.id,
        type: el.type,
        label: el.label,
        selector: el.selector,
        isVisible: el.isVisible,
        placeholder: el.placeholder,
      })),
      null,
      2
    );

    const prompt = ACTION_PLANNING_PROMPT
      .replace('{{goal}}', goal)
      .replace('{{url}}', observation.url)
      .replace('{{title}}', observation.title)
      .replace('{{elements}}', serializedElements);

    logger.info('Prompt generated');

    // Define schema according to Google Gen AI expectations
    const responseSchema = {
      type: 'OBJECT',
      properties: {
        reasoning: {
          type: 'STRING',
          description: 'A concise explanation of why you are taking these actions',
        },
        actions: {
          type: 'ARRAY',
          description: 'The sequence of actions to execute',
          items: {
            type: 'OBJECT',
            properties: {
              action: {
                type: 'STRING',
                description: 'The ActionType value (e.g. SEND_KEYS, CLICK, SCROLL)',
              },
              selector: {
                type: 'STRING',
                description: 'CSS selector target',
              },
              value: {
                type: 'STRING',
                description: 'Text to type, or other parameters',
              },
            },
            required: ['action'],
          },
        },
      },
      required: ['reasoning', 'actions'],
    };

    try {
      logger.info('Gemini request sent');
      const rawResponse = await this.geminiClient.generateStructuredResponse(
        prompt,
        responseSchema,
        SYSTEM_PROMPT
      );
      logger.info('Response received');

      // Parse JSON
      let parsedJson: any;
      try {
        parsedJson = JSON.parse(rawResponse);
      } catch (jsonErr: any) {
        logger.error(`Failed to parse Gemini JSON output: ${rawResponse}`);
        throw new AgentError(`Malformed JSON received from Gemini: ${jsonErr.message}`);
      }

      // Validate JSON using Zod
      const validationResult = ActionPlanSchema.safeParse(parsedJson);
      if (!validationResult.success) {
        const issues = validationResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        logger.error(`Validation failed for response JSON: ${issues}`);
        throw new AgentError(`ActionPlan validation failed: ${issues}`);
      }

      logger.info('Plan validated');
      logger.info('Planning completed');
      
      const plan = validationResult.data;
      // Emit plan to agentEvents
      try {
        const { agentEvents } = await import('../logging/eventManager.js');
        agentEvents.emit('plan', plan);
      } catch {}

      return plan;
    } catch (error: any) {
      logger.error(`Planner plan execution failed: ${error.message}`);
      if (error instanceof AgentError) {
        throw error;
      }
      throw new AgentError(`AI reasoning failed: ${error.message}`);
    }
  }

  /**
   * For backwards compatibility.
   */
  public async planNextAction(goal: string, observation: PageObservation): Promise<any> {
    const planResult = await this.plan(goal, observation);
    return planResult.actions[0] || null;
  }
}

export default Planner;
