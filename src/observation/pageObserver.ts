import { PageObservation } from '../types/observation.js';

/**
 * PageObserver observes the current state of a web page (title, URL, structure, visual cues).
 */
export class PageObserver {
  /**
   * Captures and constructs a full PageObservation.
   * TODO: Implement page screenshot, HTML extraction, and semantic state parsing.
   */
  public async observePage(): Promise<PageObservation> {
    throw new Error('Not implemented yet');
  }
}

export default PageObserver;
