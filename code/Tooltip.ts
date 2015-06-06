/**
 * A mechanism for using an HTML element as a custom tooltip.
 */
module Tooltip {
    // The element that will be used as the tooltip.
    let tooltipElem: HTMLElement;

    /**
     * Attaches markup/text to appear as a tooltip besides the element when the cursor
     * hovers over it.
     */
    export function attachText(element: HTMLElement, htmlText: string): void {
        if (!tooltipElem) {
            // Init on first use
            init();
        }

        element.addEventListener("mouseover", () => {
            const bounds = element.getBoundingClientRect();
            tooltipElem.style.left = (bounds.right + 5) + "px";
            tooltipElem.style.top = bounds.top + "px";

            tooltipElem.innerHTML = htmlText;
            tooltipElem.style.display = "block";
        });
        element.addEventListener("mouseout", () => {
            tooltipElem.style.display = "none";
            tooltipElem.innerHTML = "";
        });
    }

    /**
     * Attaches a function that returns markup/text to appear as a tooltip besides the
     * element when the cursor hovers over it. This should be used instead of `attachText()`
     * when the content of the tooltip is dynamic and may change, as the function will
     * be invoked each time the tooltip is shown.
     */
    export function attachFunc(element: HTMLElement, htmlTextGetter: ()=>string): void {
        if (!tooltipElem) {
            // Init on first use
            init();
        }

        element.addEventListener("mouseover", () => {
            const bounds = element.getBoundingClientRect();
            tooltipElem.style.left = (bounds.right + 5) + "px";
            tooltipElem.style.top = bounds.top + "px";

            tooltipElem.innerHTML = htmlTextGetter();
            tooltipElem.style.display = "block";
        });
        element.addEventListener("mouseout", () => {
            tooltipElem.style.display = "none";
            tooltipElem.innerHTML = "";
        });
    }

    function init() {
        tooltipElem = $.id("tooltip");
    }
}