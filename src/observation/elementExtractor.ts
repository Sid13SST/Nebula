import { BrowserElement } from '../types/element.js';

/**
 * ElementExtractor extracts interactive/relevant elements from the DOM.
 */
export class ElementExtractor {
  /**
   * Parses the DOM or accessibility tree to retrieve elements.
   * TODO: Implement locator identification and interactive check.
   */
  public async extractElements(): Promise<BrowserElement[]> {
    throw new Error('Not implemented yet');
  }
}

export default ElementExtractor;
