export type ChildrenChangeHandler = ((nodes: NodeList) => void) | void | null;
export type AttributeChangeHandler = ((attribute: string) => void) | void | null;

export class MutationWrapper {
    public nodesAdded: ChildrenChangeHandler | void | null = null;
    public nodesRemoved: ChildrenChangeHandler | void | null = null;
    public attributeChange: AttributeChangeHandler | void | null = null;

    private readonly _target: Element;
    private readonly _observer: MutationObserver;
    private readonly _config: MutationObserverInit;

    public constructor(target: Element, autoStart: boolean = true) {
        this._observer = new MutationObserver((records: MutationRecord[]): void => {
            for (let i = 0, n = records.length; i < n; ++i) {
                if (records[i].type === 'childList') {
                    if (this.nodesAdded) {
                        this.nodesAdded(records[i].addedNodes);
                    }
                    if (this.nodesRemoved) {
                        this.nodesRemoved(records[i].removedNodes);
                    }
                } else if (records[i].type === 'attributes' && this.attributeChange) {
                    this.attributeChange(records[i].attributeName as string);
                }
            }
        });

        this._target = target;
        this._config = { attributes: true, childList: true, subtree: false };

        if (autoStart) {
            this._observer.observe(this._target, this._config);
        }
    }

    public start(): void {
        this._observer.observe(this._target, this._config);
    }

    public stop(): void {
        this._observer.disconnect();
    }
}
