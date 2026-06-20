import { Page } from 'playwright';
import { BrowserManager } from '../browser/browserManager.js';
import { DetectedElement, ElementType } from '../types/element.js';
import { BrowserError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';

/**
 * ElementExtractor extracts interactive/relevant elements from the DOM.
 */
export class ElementExtractor {
  /**
   * Parses the DOM to retrieve interactive elements and their metadata.
   */
  public async extractElements(providedPage?: Page): Promise<DetectedElement[]> {
    logger.info('Starting element extraction...');
    try {
      const page = providedPage || BrowserManager.getInstance().getPage();
      
      const elements = await page.evaluate(() => {
        // Find all interactive tags
        const selectorQuery = 'input, textarea, button, select';
        const rawElements = Array.from(document.querySelectorAll(selectorQuery));
        
        return rawElements.map((el, index) => {
          const htmlEl = el as HTMLElement;
          const rect = htmlEl.getBoundingClientRect();
          const style = window.getComputedStyle(htmlEl);
          
          // Check visibility
          const isVisible = !!(
            htmlEl.offsetWidth > 0 ||
            htmlEl.offsetHeight > 0 ||
            rect.width > 0 ||
            rect.height > 0
          ) && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';

          const isDisabled = htmlEl.hasAttribute('disabled') || (htmlEl as any).disabled === true;
          const isReadOnly = htmlEl.hasAttribute('readonly') || (htmlEl as any).readOnly === true;

          // Categorize element type
          const tagName = htmlEl.tagName.toUpperCase();
          let type: string = 'UNKNOWN';
          
          if (tagName === 'INPUT') {
            const inputType = (htmlEl as HTMLInputElement).type?.toUpperCase() || 'INPUT';
            if (inputType === 'CHECKBOX') type = 'CHECKBOX';
            else if (inputType === 'RADIO') type = 'RADIO';
            else type = 'INPUT';
          } else if (tagName === 'TEXTAREA') {
            type = 'TEXTAREA';
          } else if (tagName === 'BUTTON') {
            type = 'BUTTON';
          } else if (tagName === 'SELECT') {
            type = 'SELECT';
          }

          // Selector generation strategy
          let finalSelector = '';
          const id = htmlEl.getAttribute('id');
          const name = htmlEl.getAttribute('name');
          const ariaLabel = htmlEl.getAttribute('aria-label');
          const placeholder = htmlEl.getAttribute('placeholder');

          if (id) {
            finalSelector = `#${id}`;
          } else if (name) {
            finalSelector = `[name="${name}"]`;
          } else if (ariaLabel) {
            finalSelector = `[aria-label="${ariaLabel}"]`;
          } else if (placeholder) {
            finalSelector = `[placeholder="${placeholder}"]`;
          } else {
            // Inline fallback CSS path generation to avoid TSX function wrapping ReferenceError
            const path: string[] = [];
            let current: HTMLElement | null = htmlEl;
            while (current && current.nodeType === Node.ELEMENT_NODE) {
              let selector = current.nodeName.toLowerCase();
              if (current.id) {
                selector += `#${current.id}`;
                path.unshift(selector);
                break;
              } else {
                let sibling = current.previousElementSibling;
                let sibIndex = 1;
                while (sibling) {
                  if (sibling.nodeName === current.nodeName) {
                    sibIndex++;
                  }
                  sibling = sibling.previousElementSibling;
                }
                let hasSiblings = false;
                let nextSibling = current.nextElementSibling;
                while (nextSibling) {
                  if (nextSibling.nodeName === current.nodeName) {
                    hasSiblings = true;
                    break;
                  }
                  nextSibling = nextSibling.nextElementSibling;
                }
                if (sibIndex > 1 || hasSiblings) {
                  selector += `:nth-of-type(${sibIndex})`;
                }
              }
              path.unshift(selector);
              current = current.parentElement;
            }
            finalSelector = path.join(' > ');
          }

          // Extract attributes
          const attributes: Record<string, string> = {};
          for (let i = 0; i < htmlEl.attributes.length; i++) {
            const attr = htmlEl.attributes[i];
            attributes[attr.name] = attr.value;
          }

          // Unique element ID for tracking
          const elementId = id || name || `el-${index}-${Date.now().toString(36)}`;

          return {
            id: elementId,
            type,
            tagName: tagName.toLowerCase(),
            selector: finalSelector,
            text: htmlEl.textContent || (htmlEl as any).value || '',
            attributes,
            boundingBox: {
              x: rect.left + window.scrollX,
              y: rect.top + window.scrollY,
              width: rect.width,
              height: rect.height,
            },
            isVisible,
            isDisabled,
            readonly: isReadOnly,
            name: name || undefined,
            placeholder: placeholder || undefined,
            ariaLabel: ariaLabel || undefined,
          };
        });
      });

      // Filter and map types properly
      const detectedElements: DetectedElement[] = elements.map((el) => {
        return {
          id: el.id,
          type: el.type as any,
          tagName: el.tagName,
          selector: el.selector,
          text: el.text,
          attributes: el.attributes,
          boundingBox: el.boundingBox,
          isVisible: el.isVisible,
          isDisabled: el.isDisabled,
          readonly: el.readonly,
          name: el.name,
          placeholder: el.placeholder,
          ariaLabel: el.ariaLabel,
        };
      });

      logger.info(`Extracted ${detectedElements.length} elements.`);
      return detectedElements;
    } catch (error: any) {
      logger.error(`Failed to extract elements: ${error.message}`);
      throw new BrowserError(`Element extraction failed: ${error.message}`);
    }
  }
}

export default ElementExtractor;
