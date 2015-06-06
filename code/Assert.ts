/**
 * Contains assertion methods for verifying conditions.
 */
module Assert {
    /**
     * Asserts that a value is a primitive boolean `true`.
     */
    export function is(value: any): void {
        if (value !== true) {
            fail("Expected value to be true.");
        }
    }

    /**
     * Asserts that a value is a primitive boolean `false`.
     */
    export function not(value: any): void {
        if (value === true) {
            fail("Expected value to be false.");
        }
    }

    /**
     * Assert that a value is 'truthy'.
     * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Truthy}
     */
    export function truthy(value: any): void {
        if (!value) {
            fail("Expected value to be truthy.");
        }
    }

    /**
     * Asserts that a value is 'falsy'.
     * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
     */
    export function falsy(value: any): void {
        if (value) {
            fail("Expected value to be falsy.");
        }
    }

    /**
     * Throws an assertion error with the specified error message.
     */
    export function fail(errorMessage?: string): void {
        throw new Error("Assertion error: " + errorMessage);
    }
}