import { BrowserElement } from './element.js';

/**
 * Base observation from the agent's workflow.
 */
export interface Observation {
  timestamp: Date;
  summary: string;
}

/**
 * Detailed observation about a specific webpage's state.
 */
export interface PageObservation extends Observation {
  url: string;
  title: string;
  elements: BrowserElement[];
  screenshotPath?: string;
  htmlSnapshot?: string;
}
export default Observation;
