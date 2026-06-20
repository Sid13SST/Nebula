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
  UNKNOWN = 'UNKNOWN',
}

/**
 * Represents an extracted element from a webpage.
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

/**
 * Extended representation of an element containing additional parsed metadata from observation.
 */
export interface DetectedElement extends BrowserElement {
  label?: string;
  name?: string;
  placeholder?: string;
  ariaLabel?: string;
  readonly?: boolean;
}

/**
 * Representation of a detected form field.
 */
export interface DetectedFormField {
  label?: string;
  name?: string;
  selector: string;
  type: ElementType;
  elementId: string;
  value?: string;
}
