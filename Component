/**
 * 
 */
class Component {
  private _value: number;
  
  constructor(initValue: number) {
    this._value = initValue;
  }
  
  public get val(): number {
    return this._value;
  }
  
  public set val(value: number) {
    if (typeof value !== "number" || value < 0 || value === 1/0 || value !== value) {
      // Ensure the value of the component is always a primitive, positive, finite number.
      return;
    }
    
    this._value = value;
  }
}
