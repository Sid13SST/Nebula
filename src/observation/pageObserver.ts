import { Page } from 'playwright';
import { BrowserManager } from '../browser/browserManager.js';
import { ElementExtractor } from './elementExtractor.js';
import { FormDetector } from './formDetector.js';
import { PageObservation } from '../types/observation.js';
import { ObservationError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';

/**
 * PageObserver observes the current state of a web page (title, URL, structure, visual cues).
 */
export class PageObserver {
  private elementExtractor: ElementExtractor;
  private formDetector: FormDetector;

  constructor() {
    this.elementExtractor = new ElementExtractor();
    this.formDetector = new FormDetector();
  }

  /**
   * Captures and constructs a full PageObservation.
   */
  public async observe(providedPage?: Page): Promise<PageObservation> {
    const startTime = Date.now();
    logger.info('Observation started');

    try {
      const page = providedPage || BrowserManager.getInstance().getPage();
      if (!page) {
        throw new ObservationError('No active browser page is available to observe.');
      }

      // Collect base page details
      const title = await page.title();
      const url = page.url();
      const timestamp = new Date();

      // Extract raw interactive elements
      const elements = await this.elementExtractor.extractElements(page);
      logger.info(`Elements extracted: ${elements.length}`);

      // Detect forms and labels
      const labelMap = await this.formDetector.detectLabels(page);
      const formMap = await this.formDetector.detectForms(page);
      const formCount = Object.keys(formMap).length;
      logger.info(`Forms detected: ${formCount}`);

      // Associate labels to elements
      const mappedElements = elements.map((element) => {
        // Look up label by ID or fallback selector
        const associatedLabel = labelMap[element.selector] || labelMap[`#${element.id}`] || labelMap[`[name="${element.name}"]`] || '';
        return {
          ...element,
          label: associatedLabel || undefined,
        };
      });

      const durationMs = Date.now() - startTime;
      logger.info(`Observation completed. Extracted ${mappedElements.length} elements across ${formCount} forms in ${durationMs}ms.`);

      return {
        timestamp,
        summary: `Page observation of "${title}" at ${url}`,
        title,
        url,
        elements: mappedElements,
        metadata: {
          durationMs,
          elementCount: mappedElements.length,
          formCount,
          timestamp,
        },
      };
    } catch (error: any) {
      logger.error(`Observation failed: ${error.message}`);
      if (error instanceof ObservationError) {
        throw error;
      }
      throw new ObservationError(`Observation failed: ${error.message}`);
    }
  }

  /**
   * For backwards compatibility.
   */
  public async observePage(): Promise<PageObservation> {
    return this.observe();
  }
}

export default PageObserver;
