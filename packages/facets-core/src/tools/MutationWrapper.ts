/*
 *  Copyright (c) 2020 Uncharted Software Inc.
 *  http://www.uncharted.software/
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy of
 *  this software and associated documentation files (the "Software"), to deal in
 *  the Software without restriction, including without limitation the rights to
 *  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 *  of the Software, and to permit persons to whom the Software is furnished to do
 *  so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *
 */

export type ChildrenChangeHandler = ((nodes: NodeList) => void) | void | null;
export type AttributeChangeHandler = ((attribute: string) => void) | void | null;

export class MutationWrapper {
    public nodesAdded: ChildrenChangeHandler | void | null = null;
    public nodesRemoved: ChildrenChangeHandler | void | null = null;

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
                }
            }
        });

        this._target = target;
        this._config = { attributes: false, childList: true, subtree: false };

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
