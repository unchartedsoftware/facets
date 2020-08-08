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

import {customElement, LitElement} from 'lit-element';

@customElement('facet-plugin')
export class FacetPlugin extends LitElement {
    public static connectedEvent = 'facet-plugin-connected';
    public static disconnectedEvent = 'facet-plugin-disconnected';

    private _boundUpdateHandler: EventHandlerNonNull = this._updateHandler.bind(this);

    private _host: LitElement|null = null;
    public get host(): LitElement|null {
        return this._host;
    }
    public set host(value: LitElement|null) {
        if (value !== this._host) {
            if (this._host) {
                this._host.removeEventListener('facet-element-updated', this._boundUpdateHandler);
            }

            this._host = value;

            if (this._host) {
                this._host.addEventListener('facet-element-updated', this._boundUpdateHandler);
                this._host.requestUpdate();
            }

            this.hostChanged(this._host);
            this.requestUpdate();
        }
    }

    public connectedCallback(): void {
        super.connectedCallback();
        const parent = this.parentElement;
        if (parent) {
            // stupid IE11...
            const dispatchEvent = (): void => {
                parent.dispatchEvent(new CustomEvent(FacetPlugin.connectedEvent, {
                    bubbles: true,
                    detail: {
                        plugin: this,
                    },
                }));
            };
            if ((window as any).ShadyDOM && (window as any).ShadyDOM.inUse) {
                requestAnimationFrame(dispatchEvent);
            } else {
                dispatchEvent();
            }
        }
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this.host) {
            this.host.dispatchEvent(new CustomEvent(FacetPlugin.disconnectedEvent, {
                bubbles: true,
                detail: {
                    plugin: this,
                },
            }));
        }
    }

    protected hostUpdated(changedProperties: Map<PropertyKey, unknown>): void { // eslint-disable-line
        // OVERRIDE
    }

    protected hostChanged(host: HTMLElement|null): void { // eslint-disable-line
        // OVERRIDE
    }

    private _updateHandler(event: Event): void {
        if (event.target === this._host && event instanceof CustomEvent) {
            this.hostUpdated(event.detail.changedProperties);
        }
    }
}
