import { Page } from 'playwright';
import { BrowserManager } from '../browser/browserManager.js';
import { BrowserError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';

/**
 * FormDetector detects input forms, label associations, and groups fields.
 */
export class FormDetector {
  /**
   * Identifies labels for elements based on "for" attribute and nested label patterns.
   * Returns a map of element selector or ID to the cleaned label text.
   */
  public async detectLabels(providedPage?: Page): Promise<Record<string, string>> {
    logger.info('Starting label detection...');
    try {
      const page = providedPage || BrowserManager.getInstance().getPage();

      const labelMapping = await page.evaluate(() => {
        const mapping: Record<string, string> = {};

        // 1. Process labels with "for" attributes
        const labelsWithFor = Array.from(document.querySelectorAll('label[for]'));
        labelsWithFor.forEach((label) => {
          const forId = label.getAttribute('for');
          if (forId) {
            const el = document.getElementById(forId);
            if (el) {
              const rawText = label.textContent;
              const labelText = rawText ? rawText.replace(/\s+/g, ' ').trim() : '';
              if (labelText) {
                // Map by ID and fallback CSS selector
                mapping[`#${forId}`] = labelText;
              }
            }
          }
        });

        // 2. Process nested labels
        const allLabels = Array.from(document.querySelectorAll('label'));
        allLabels.forEach((label) => {
          // If label doesn't have "for" or if we want to support nested input
          const interactiveEl = label.querySelector('input, textarea, select');
          if (interactiveEl) {
            const rawText = label.innerText || label.textContent;
            const labelText = rawText ? rawText.replace(/\s+/g, ' ').trim() : '';
            if (labelText) {
              const id = interactiveEl.getAttribute('id');
              const name = interactiveEl.getAttribute('name');
              
              if (id) {
                mapping[`#${id}`] = labelText;
              } else if (name) {
                mapping[`[name="${name}"]`] = labelText;
              }
            }
          }
        });

        // 3. Process aria-labelledby and aria-label
        const ariaLabeled = Array.from(document.querySelectorAll('[aria-labelledby], [aria-label]'));
        ariaLabeled.forEach((el) => {
          const id = el.getAttribute('id');
          const name = el.getAttribute('name');
          const key = id ? `#${id}` : (name ? `[name="${name}"]` : '');
          if (!key) return;

          const ariaLabel = el.getAttribute('aria-label');
          if (ariaLabel) {
            mapping[key] = ariaLabel.replace(/\s+/g, ' ').trim();
          } else {
            const labelledBy = el.getAttribute('aria-labelledby');
            if (labelledBy) {
              const labelEl = document.getElementById(labelledBy);
              if (labelEl) {
                const rawText = labelEl.textContent;
                mapping[key] = rawText ? rawText.replace(/\s+/g, ' ').trim() : '';
              }
            }
          }
        });

        return mapping;
      });

      logger.info(`Detected ${Object.keys(labelMapping).length} label associations.`);
      return labelMapping;
    } catch (error: any) {
      logger.error(`Failed to detect labels: ${error.message}`);
      throw new BrowserError(`Label detection failed: ${error.message}`);
    }
  }

  /**
   * Dummy/Placeholder detectForms matching original signature.
   * Future implementation can group elements inside <form> tags.
   */
  public async detectForms(providedPage?: Page): Promise<Record<string, any[]>> {
    try {
      const page = providedPage || BrowserManager.getInstance().getPage();
      const formsData = await page.evaluate(() => {
        const forms = Array.from(document.querySelectorAll('form'));
        const result: Record<string, any[]> = {};
        forms.forEach((form, index) => {
          const formId = form.getAttribute('id') || `form-${index}`;
          result[formId] = [];
        });
        return result;
      });
      return formsData;
    } catch (error: any) {
      throw new BrowserError(`Form detection failed: ${error.message}`);
    }
  }
}

export default FormDetector;
