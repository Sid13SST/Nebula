import { DetectedElement } from './element.js';

/**
 * Base observation from the agent's workflow.
 */
export interface Observation {
  timestamp: Date;
  summary: string;
}

/**
 * Metadata about the observation event.
 */
export interface ObservationMetadata {
  durationMs: number;
  elementCount: number;
  formCount: number;
  timestamp: Date;
}

/**
 * Detailed observation about a specific webpage's state.
 */
export interface PageObservation extends Observation {
  url: string;
  title: string;
  elements: DetectedElement[];
  screenshotPath?: string;
  htmlSnapshot?: string;
  metadata?: ObservationMetadata;
}
export default Observation;
