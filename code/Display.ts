interface DisplayNode {
    isQueuedForRender: boolean;
    nextQueued: DisplayNode;
    render(): void;
}

module Display {
    // The head and tail of a singly-linked-list structure
    // used internally to store display nodes queued for
    // rendering.
    let firstNode: DisplayNode,
        lastNode: DisplayNode;

    export function queueForRender(node: DisplayNode): void {
        if (node.isQueuedForRender) {
            // This node is already queued for rendering; there's
            // no point of rendering a node twice in the same frame.
            return;
        }
        node.isQueuedForRender = true;

        if (!firstNode) {
            Assert.falsy(lastNode);
            // Render queue is empty.
            firstNode = lastNode = node;
        } else {
            Assert.truthy(lastNode);
            // Render queue is not empty.
            lastNode.nextQueued = node;
            lastNode = node;
        }

        // Invalidate new node
        node.nextQueued = null;
    }

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