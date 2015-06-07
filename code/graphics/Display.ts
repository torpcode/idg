/**
 * Handles the rendering of the visual elements of the game.
 */
module Display {
    // The head and tail of a singly-linked-list structure
    // used internally to store display nodes queued for
    // rendering.
    let firstNode: DisplayNode,
        lastNode: DisplayNode;

    /**
     * Queues a DisplayNode to be rendered at the end of the current frame.
     * This method is always `O(1)` runtime due to the linked-list-likeness of DisplayNodes.
     */
    export function queueForRender(node: DisplayNode): void {
        if (node.isQueuedForRender) {
            // This node is already queued for rendering; there's
            // no point of rendering a node twice in the same frame.
            return;
        }
        node.isQueuedForRender = true;

        if (!firstNode) {
            // Render queue is empty.
            Assert.falsy(lastNode);
            firstNode = lastNode = node;
        } else {
            // Render queue is not empty.
            Assert.truthy(lastNode);
            lastNode.nextQueued = node;
            lastNode = node;
        }

        // Invalidate new node
        node.nextQueued = null;
    }

    /**
     * Renders all the DisplayNodes that are currently queued to be rendered.
     */
    export function render(): void {
        // Render queued nodes
        let node = firstNode;
        while (node) {
            node.render();
            node.isQueuedForRender = false;

            // Invalidating the 'next' reference of the node is
            // currently not required, since its value isn't used
            // for anything other than when the node is queued for
            // rendering; in which case the 'next' property of
            // the node is specifically set when it is queued.
            node = node.nextQueued;
        }

        // Empty the render queue
        firstNode = lastNode = null;
    }
}