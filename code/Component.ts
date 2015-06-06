/**
 * Represents a function listening for value changes of a component.
 */
type ValueListener = (value: number) => void;

/**
 * Represents a function that can transform a numeric value to a representable textual string.
 */
type ValueFormatter = (value: number) => string;

/**
 * An object which wraps a numeric value, ensuring it always stays valid.
 */
class Component implements DisplayNode {
    private _value: number;
    private maxValueReached: number;
    private elements: HTMLElement[];
    private valueAsText: string;
    private valueListeners: ValueListener[];
    private formatter: ValueFormatter;
    private milestoneListeners: { value: number, listener: ()=>void }[];

    public isQueuedForRender: boolean;
    public nextQueued: DisplayNode;

    constructor(initValue: number, formatter?: ValueFormatter) {
        this._value = initValue;
        this.maxValueReached = initValue;

        if (formatter) {
            this.formatter = formatter;
        }
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
        this.invokeValueListeners(value);
        this.checkMaxValue(value);

        // Request a render at the end of the frame
        Display.queueForRender(this);
    }

    /**
     * Updates the contents of all attached elements to reflect the current value of the component.
     */
    public render(): void {
        const elements = this.elements;
        if (!elements) {
            // No elements to render
            return;
        }

        const text = this.formatValue();
        if (text === this.valueAsText) {
            // Same text as what was previously rendered,
            // so re-rendering the attached elements to
            // the same value can be avoided.
            return;
        }
        this.valueAsText = text;

        for (let i = 0; i < elements.length; i++) {
            elements[i].innerHTML = text;
        }
    }

    /**
     * Invoke all the value listeners.
     */
    private invokeValueListeners(value: number): void {
        const listeners = this.valueListeners;
        if (!listeners) {
            // No listeners
            return;
        }

        for (let i = 0; i < listeners.length; i++) {
            listeners[i](value);
        }
    }

    /**
     * Checks if a new maximum value has been reached, and potentially invokes the appropriate listeners.
     */
    private checkMaxValue(value: number): void {
        // Check if a new max value has been reached
        if (value > this.maxValueReached) {
            // Remember new max value
            this.maxValueReached = value;

            // Invoke appropriate listeners
            const listeners = this.milestoneListeners;
            if (listeners) {
                while (listeners.length > 0) {
                    var entry = listeners[listeners.length - 1];

                    if (entry.value > value) {
                        // Entry value is too large; so there's no point
                        // of checking further since the listener array
                        // is sorted in ascending order, thus consecutive
                        // values will only be larger.
                        break;
                    }

                    // The listener must be removed before it is invoked.
                    // If the listener is invoked before it is removed, a
                    // endless recursion might occur if the listener sets
                    // the value of the component.
                    listeners.pop();
                    // Now the listener can be safely invoked.
                    entry.listener();
                }
            }
        }
    }

    /**
     * Creates a pretty textual representation of the current value of the component.
     */
    private formatValue(): string {
        const formatter = this.formatter;
        if (formatter) {
            // Use a custom formatter, if there is one
            return formatter(this._value);
        } else {
            // Default formatting
            return $.commify(this._value);
        }
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
     * Attach a listener to the component. The listener will be invoked whenever the value of the component changes.
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

    /**
     * Attaches a listener to the component that will be invoked when the value of the component reaches/passes
     * the specified threshold value. The listener will be invoked only once, on the first time when the
     * threshold is reached. If the threshold has been previously reached by the component the listener will
     * be invoked immediately.
     */
    public whenReached(value: number, listener: ()=>void): void {
        if (this.maxValueReached >= value) {
            // Value has been previously reached, so
            // just invoke the listener immediately
            // and be done with it.
            listener();
            return;
        }

        var entry = {value, listener};

        var listeners = this.milestoneListeners;
        if (!listeners) {
            // Create the listener array when a listener
            // is added for the first time.
            this.milestoneListeners = [entry];
            return
        }

        // Find insert index to keep array sorted by value from
        // largest to smallest.
        var insertAt = -1;
        for (var i = 0; i < listeners.length; i++) {
            if (value > listeners[i].value) {
                insertAt = i;
                break;
            }
        }
        // Note: Binary search could potentially be used,
        // but a single component isn't expected to have a
        // large amount of listeners, so this should suffice.

        // Insert into the correct index to keep the array sorted by value
        if (insertAt === -1) {
            listeners.push(entry);
        } else {
            listeners.splice(insertAt, 0, entry);
        }
    }
}
