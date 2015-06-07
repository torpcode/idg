/**
 * A mechanism for using an HTML element as a custom tooltip.
 */
module Tooltip {
    // The element that will be used as the tooltip.
    let tooltipElem: HTMLElement;

    let visible = false;
    let textGetter: ()=>string;

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
            Assert.not(visible);
            visible = true;

            const bounds = element.getBoundingClientRect();
            tooltipElem.style.left = (bounds.right + 5) + "px";
            tooltipElem.style.top = bounds.top + "px";

            tooltipElem.innerHTML = htmlText;
            tooltipElem.style.display = "block";
            textGetter = null;
        });
        element.addEventListener("mouseout", () => {
            Assert.is(visible);
            visible = false;

            tooltipElem.style.display = "none";
            tooltipElem.innerHTML = "";
            textGetter = null;
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
            Assert.not(visible);
            visible = true;

            const bounds = element.getBoundingClientRect();
            tooltipElem.style.left = (bounds.right + 5) + "px";
            tooltipElem.style.top = bounds.top + "px";

            tooltipElem.innerHTML = htmlTextGetter();
            tooltipElem.style.display = "block";
            textGetter = htmlTextGetter;
        });
        element.addEventListener("mouseout", () => {
            Assert.is(visible);
            visible = false;

            tooltipElem.style.display = "none";
            tooltipElem.innerHTML = "";
            textGetter = null;
        });
    }

    function init() {
        tooltipElem = $.id("tooltip");
    }

    export function update(): void {
        if (visible && textGetter) {
            tooltipElem.innerHTML = textGetter();
        }
    }
}