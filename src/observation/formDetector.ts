import { BrowserElement } from '../types/element.js';

/**
 * FormDetector detects input forms and structures them for form-filling planning.
 */
export class FormDetector {
  /**
   * Identifies logical form containers and fields.
   * TODO: Detect submission buttons, inputs, labels, and grouping structures.
   */
  public async detectForms(): Promise<Record<string, BrowserElement[]>> {
    throw new Error('Not implemented yet');
  }
}

export default FormDetector;
