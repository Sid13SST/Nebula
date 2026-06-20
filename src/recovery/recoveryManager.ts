import { PlannedAction, ActionPlan } from '../types/action.js';
import { PageObservation } from '../types/observation.js';
import { PageObserver } from '../observation/pageObserver.js';
import { SelectorRecovery } from './selectorRecovery.js';
import { Planner } from '../agent/planner.js';
import { logger } from '../logging/logger.js';
import { AgentError } from '../errors/AppError.js';

/**
 * RecoveryManager coordinates verification, re-observation, selector fallback, and AI replanning.
 */
export class RecoveryManager {
  private pageObserver: PageObserver;
  private selectorRecovery: SelectorRecovery;
  private planner: Planner;

  constructor() {
    this.pageObserver = new PageObserver();
    this.selectorRecovery = new SelectorRecovery();
    this.planner = new Planner();
  }

  /**
   * Re-observes the webpage to get the latest state.
   */
  public async reobservePage(): Promise<PageObservation> {
    logger.info('re-observation started');
    try {
      const observation = await this.pageObserver.observe();
      return observation;
    } catch (error: any) {
      logger.error(`Re-observation failed: ${error.message}`);
      throw new AgentError(`Failed to re-observe page during recovery: ${error.message}`);
    }
  }

  /**
   * Invokes the selector recovery fallback engine on the current page observation.
   */
  public async recoverSelector(action: PlannedAction, observation: PageObservation): Promise<string | null> {
    return this.selectorRecovery.findAlternativeSelector(action, observation);
  }

  /**
   * Triggers the AI planner to re-plan based on a goal and failure context.
   */
  public async requestReplan(goal: string, errorMsg: string): Promise<ActionPlan> {
    logger.info('re-planning started');
    try {
      const observation = await this.reobservePage();
      const updatedGoal = `${goal} (Note: Previous action execution failed with error: "${errorMsg}". Please adjust the plan.)`;
      const plan = await this.planner.plan(updatedGoal, observation);
      return plan;
    } catch (error: any) {
      logger.error(`Re-planning request failed: ${error.message}`);
      throw new AgentError(`Re-planning failed: ${error.message}`);
    }
  }

  /**
   * Coordinates the recovery of a failed action.
   * If a corrected selector is resolved, returns the updated PlannedAction. Otherwise, returns null.
   */
  public async recoverAction(action: PlannedAction, error: Error): Promise<PlannedAction | null> {
    logger.info(`recovery started for action: ${action.action}`);

    try {
      // 1. Re-observe page to find updated elements
      const observation = await this.reobservePage();

      // 2. Attempt to resolve alternative selector
      if (action.selector) {
        const alternativeSelector = await this.recoverSelector(action, observation);
        if (alternativeSelector && alternativeSelector !== action.selector) {
          logger.info(`selector recovered: corrected "${action.selector}" to "${alternativeSelector}"`);
          return {
            ...action,
            selector: alternativeSelector,
          };
        }
      }
    } catch (err: any) {
      logger.error(`Error during recoverAction workflow: ${err.message}`);
    }

    return null;
  }
}

export default RecoveryManager;
