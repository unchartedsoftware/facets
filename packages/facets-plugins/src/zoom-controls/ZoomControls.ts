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

import {css, CSSResult, customElement, unsafeCSS, TemplateResult, html} from 'lit-element';
import {FacetPlugin, FacetBarsBase, makeIconSVG} from '@uncharted/facets-core';
import {faPlus} from '@fortawesome/free-solid-svg-icons/faPlus';
import {faMinus} from '@fortawesome/free-solid-svg-icons/faMinus';
import {faHome} from '@fortawesome/free-solid-svg-icons/faHome';

// @ts-ignore
import ZoomControlsStyle from './ZoomControls.css';

enum WheelZoomState {
    idle,
    enabled,
    locked,
}

@customElement('facet-plugin-zoom-controls')
export class ZoomControls extends FacetPlugin {
    public static get styles(): CSSResult[] {
        return [
            css`${unsafeCSS(ZoomControlsStyle)}`,
        ];
    }

    private facet: FacetBarsBase | null = null;
    private wheelZoomState: WheelZoomState = WheelZoomState.idle;
    private wheelDeltaXSum: number = 0;
    private wheelDeltaYSum: number = 0;
    private lastWheelTime: number = 0;
    private wheelDeltaThreshold: number = 14;
    private wheelTimeThreshold: number = 80; /* ms */
    private boundWheelHandler: EventListener = this.wheelHandler.bind(this);

    protected hostChanged(host: HTMLElement|null): void {
        if (this.facet) {
            this.facet.removeEventListener('wheel', this.boundWheelHandler);
        }

        if (host instanceof FacetBarsBase) {
            this.facet = host;
            this.facet.addEventListener('wheel', this.boundWheelHandler);
        } else {
            this.facet = null;
        }
    }


    protected render(): TemplateResult | void {
        if (this.facet) {
            return html`
            <div class="zoom-controls-container">
                <div class="zoom-controls-buttons">
                    <div class="zoom-controls-button" @click="${this.dispatchInteractionEvent.bind(this, 'plus')}">
                        ${makeIconSVG(faPlus, 12, 12, '#A7A7A8')}
                    </div>
                    <div class="zoom-controls-button" @click="${this.dispatchInteractionEvent.bind(this, 'home')}">
                        ${makeIconSVG(faHome, 12, 12, '#DEDEDF')}
                    </div>
                    <div class="zoom-controls-button" @click="${this.dispatchInteractionEvent.bind(this, 'minus')}">
                        ${makeIconSVG(faMinus, 12, 12, '#A7A7A8')}
                    </div>
                </div>
            </div>`;
        }
        return html`${undefined}`;
    }

    private dispatchInteractionEvent(type: string): void {
        this.dispatchEvent(new CustomEvent('zoom-controls-interaction', {
            bubbles: false,
            detail: {
                type,
            },
        }));
    }

    private wheelHandler(event: Event): void {
        if (this.facet) {
            const wheelEvent = event as WheelEvent;
            const timestamp = wheelEvent.timeStamp;

            if (timestamp - this.lastWheelTime > this.wheelTimeThreshold) {
                this.wheelDeltaXSum = wheelEvent.deltaX;
                this.wheelDeltaYSum = wheelEvent.deltaY;
                this.wheelZoomState = WheelZoomState.idle;
            } else {
                this.wheelDeltaXSum += wheelEvent.deltaX;
                this.wheelDeltaYSum += wheelEvent.deltaY;
                wheelEvent.preventDefault();
            }
            this.lastWheelTime = timestamp;

            if (this.wheelZoomState === WheelZoomState.idle) {
                if (Math.abs(this.wheelDeltaYSum) >= this.wheelDeltaThreshold) {
                    this.wheelZoomState = WheelZoomState.enabled;
                } else if (Math.abs(this.wheelDeltaXSum) >= this.wheelDeltaThreshold) {
                    this.wheelZoomState = WheelZoomState.locked;
                }
            }

            while (this.wheelZoomState === WheelZoomState.enabled && Math.abs(this.wheelDeltaYSum) >= this.wheelDeltaThreshold) {
                if (this.wheelDeltaYSum > 0) {
                    this.dispatchInteractionEvent('minus');
                    this.wheelDeltaYSum -= this.wheelDeltaThreshold;
                } else {
                    this.dispatchInteractionEvent('plus');
                    this.wheelDeltaYSum += this.wheelDeltaThreshold;
                }
            }
        }
    }
}
