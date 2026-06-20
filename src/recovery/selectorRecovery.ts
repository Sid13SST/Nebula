import { PlannedAction } from '../types/action.js';
import { PageObservation } from '../types/observation.js';
import { logger } from '../logging/logger.js';

/**
 * SelectorRecovery parses page elements to resolve alternative selectors when actions fail.
 */
export class SelectorRecovery {
  /**
   * Attempts to locate a matching element inside page observations using fallback strategies.
   * Priority: Substring selector match -> Label match -> Placeholder match -> aria-label -> Name.
   */
  public async findAlternativeSelector(
    failedAction: PlannedAction,
    observation: PageObservation
  ): Promise<string | null> {
    logger.info(`Selector recovery started for selector: "${failedAction.selector}"`);

    const selector = failedAction.selector || '';
    if (!selector) return null;

    // Clean selector keyword for search (e.g., extract "title" from "#wrong-title-selector")
    const cleanWord = selector.replace(/[#.\-_]/g, ' ').replace(/\d+/g, '').trim().toLowerCase();
    const keywords = cleanWord.split(/\s+/).filter(w => w.length > 2 && w !== 'input' && w !== 'btn' && w !== 'button' && w !== 'form' && w !== 'selector');

    logger.debug(`Cleaned keywords for recovery matching: ${JSON.stringify(keywords)}`);

    // 1. Priority check: search elements in observation
    for (const el of observation.elements) {
      if (!el.isVisible) continue;

      // 1.1 Match by label text
      if (el.label) {
        const lowerLabel = el.label.toLowerCase();
        for (const kw of keywords) {
          if (lowerLabel.includes(kw)) {
            logger.info(`Recovery success: Matched keyword "${kw}" to element label "${el.label}". Selector: "${el.selector}"`);
            return el.selector;
          }
        }
      }

      // 1.2 Match by placeholder
      if (el.placeholder) {
        const lowerPlaceholder = el.placeholder.toLowerCase();
        for (const kw of keywords) {
          if (lowerPlaceholder.includes(kw)) {
            logger.info(`Recovery success: Matched keyword "${kw}" to element placeholder "${el.placeholder}". Selector: "${el.selector}"`);
            return el.selector;
          }
        }
      }

      // 1.3 Match by aria-label
      if (el.ariaLabel) {
        const lowerAria = el.ariaLabel.toLowerCase();
        for (const kw of keywords) {
          if (lowerAria.includes(kw)) {
            logger.info(`Recovery success: Matched keyword "${kw}" to element aria-label "${el.ariaLabel}". Selector: "${el.selector}"`);
            return el.selector;
          }
        }
      }

      // 1.4 Match by name attribute
      if (el.name) {
        const lowerName = el.name.toLowerCase();
        for (const kw of keywords) {
          if (lowerName.includes(kw)) {
            logger.info(`Recovery success: Matched keyword "${kw}" to element name "${el.name}". Selector: "${el.selector}"`);
            return el.selector;
          }
        }
      }

      // 1.5 Match by ID substring
      const lowerId = el.id.toLowerCase();
      for (const kw of keywords) {
        if (lowerId.includes(kw)) {
          logger.info(`Recovery success: Matched keyword "${kw}" to element ID "${el.id}". Selector: "${el.selector}"`);
          return el.selector;
        }
      }
    }

    // 2. Direct string value fallback if any element has similar type and is visible
    for (const el of observation.elements) {
      if (el.isVisible && el.type.toString().toLowerCase() === failedAction.action.toLowerCase().replace('_keys', '')) {
        logger.info(`Recovery fallback: Selected first visible element of matching type. Selector: "${el.selector}"`);
        return el.selector;
      }
    }

    logger.warn('Selector recovery could not identify an alternative selector.');
    return null;
  }
}

export default SelectorRecovery;
