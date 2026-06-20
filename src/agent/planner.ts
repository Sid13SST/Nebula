import { Action } from '../types/action.js';
import { PageObservation } from '../types/observation.js';

/**
 * Planner is responsible for translating high-level goals into step-by-step actions using LLM reasoning.
 */
export class Planner {
  constructor() {
    // TODO: support LLM Client dependency injection
  }

  /**
   * Generates a plan of actions to achieve the user's target goal.
   * 
   * TODO: Implement Goal Analysis:
   * - Break down the user's high-level goal into sub-goals.
   * - Identify success criteria for the task.
   * 
   * TODO: Implement Reasoning & Planning:
   * - Analyze current page observation against the goal.
   * - Determine the next logical browser action.
   * - Request response in structured JSON format from the LLM.
   */
  public async planNextAction(goal: string, observation: PageObservation): Promise<Action> {
    // TODO: Call Gemini client to generate the next action step
    throw new Error('Not implemented yet');
  }
}

export default Planner;
