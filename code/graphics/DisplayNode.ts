/**
 * Represents a renderable object that can be queued to the Display to be rendered at the appropriate time.
 */
interface DisplayNode {
    isQueuedForRender: boolean;
    nextQueued: DisplayNode;
    render(): void;
}
