/**
 * Supported HTML element types for interaction and observation.
 */
export enum ElementType {
  INPUT = 'INPUT',
  TEXTAREA = 'TEXTAREA',
  BUTTON = 'BUTTON',
  SELECT = 'SELECT',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
}

/**
 * Represents a extracted element from a webpage.
 */
export interface BrowserElement {
  id: string;
  type: ElementType;
  tagName: string;
  selector: string;
  text?: string;
  attributes: Record<string, string>;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isVisible: boolean;
  isDisabled: boolean;
}
