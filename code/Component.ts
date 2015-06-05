type ValueListener = (value: number) => void;

/**
 * An object which wraps a numeric value, ensuring it always stays valid.
 */
class Component {
    private _value: number;
    private elements: HTMLElement[];
    private valueListeners: ValueListener[];

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
        this.invokeValueListeners();
        this.render();
    }

    /**
     * Updates the contents of all attached elements to reflect the current value of the component.
     */
    private render(): void {
        const elements = this.elements;
        if (!elements) {
            // No elements to render
            return;
        }

        const text = this.formatValue();
        for (let i = 0; i < elements.length; i++) {
            elements[i].innerHTML = text;
        }
    }

    /**
     * Invoke all the value listeners.
     */
    private invokeValueListeners(): void {
        const listeners = this.valueListeners;
        if (!listeners) {
            // No listeners
            return;
        }

        const value = this._value;
        for (let i = 0; i < listeners.length; i++) {
            listeners[i](value);
        }
    }

    /**
     * Creates a pretty textual representation of the current value of the component.
     */
    private formatValue(): string {
        return "" + Math.floor(this._value*10)/10;
    }

    /**
     * Attach an element to this component. The content of the element will be kept updated to reflect the value of the
     * component whenever it changes.
     */
    public attachElement(element: HTMLElement): void {
        // Update the contents of the element immediately,
        // instead of it being outdated until the next
        // time the value of this component changes.
        element.innerHTML = this.formatValue();

        if (!this.elements) {
            // Initialize the 'elements' array on first call.
            this.elements = [];
        }

        this.elements.push(element);
    }

    /**
     * Attach a listener to this component. The listener will be invoked whenever the value of the component changes.
     */
    public addValueListener(listener: ValueListener): void {
        if (!this.valueListeners) {
            // Init before first use
            this.valueListeners = [];
        }

        // Invoke the listener immediately with the current value
        listener(this._value);

        this.valueListeners.push(listener);
    }
}
