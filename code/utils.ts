/**
 * Provides various utility methods.
 */
module $ {
    /**
     * A wrapper of the native `document.getElementById` method, except this throws an error
     * if no element matching the specified id is found, instead of returning null.
     *
     * (Also shorter)
     */
    export function id(elementId: string): HTMLElement {
        const element = document.getElementById(elementId);

        if (!element) {
            // Better throw an error now with a clear error
            // message than face an unclear error later.
            throw new Error("No element matching the specified id was found.");
        }

        return element;
    }

    /**
     * Converts a time span of milliseconds into a string representation in the format of: `D days, HH:MM:SS`.
     */
    export function timeSpan(ms: number): string {
        if (typeof ms !== "number" || ms < 0 || ms === 1/0 || ms !== ms) {
            // Invalid value
            return "??:??:??";
        }

        // seconds
        ms /= 1000;
        let SS: any = Math.floor(ms%60);
        if (SS < 10) SS = "0" + SS;
        // minutes
        ms /= 60;
        let MM: any = Math.floor(ms%60);
        if (MM < 10) MM = "0" + MM;
        // hours
        ms /= 60;
        let HH: any = Math.floor(ms%24);
        if (HH < 10) HH = "0" + HH;
        // days
        ms /= 24;
        const days: any = Math.floor(ms%24);

        return `${days} days, ${HH}:${MM}:${SS}`;
    }
}