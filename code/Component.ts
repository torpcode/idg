/**
 * An object which wraps a numeric value, ensuring it always stays valid.
 */
class Component {
  private _value: number;
  private elements: HTMLElement[];
  
  constructor(initValue: number) {
    this._value = initValue;
  }
  
  public get val(): number {
    // Just a simple getter
    return this._value;
  }
  
  public set val(value: number) {
    if (typeof value !== "number" || value < 0 || value === 1/0 || value !== value) {
      // Ensure the value of the component is always a primitive, positive, finite number.
      return;
    }
    
    if (this._value === value) {
      // New value is same as old, do nothing.
      return;
    }
    this._value = value;
    this.render();
  }
  
  private render(): void {
    const elements = this.elements;
    if (!elements) {
      // No elements to render
      return;
    }
    
    // Render attached elements to represent the
    // current value of the element.
    const text = "" + this._value;
    for (let i = 0; i < elements.length; i++) {
      elements[i].innerHTML = text;
    }
  }
  
  public attachElement(element: HTMLElement): void {
    // Update the contents of the element immediately,
    // instead of it being outdated until the next
    // time the value of this component changes.
    element.innerHTML = "" + this._value;
    
    if (!this.elements) {
      // Initialize the 'elements' array on first call.
      this.elements = [];
    }
    
    this.elements.push(element);
  }
}
