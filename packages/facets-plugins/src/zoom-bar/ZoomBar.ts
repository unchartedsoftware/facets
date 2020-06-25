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

import {css, CSSResult, customElement, unsafeCSS, html, TemplateResult} from 'lit-element';
import {FacetPlugin} from '@uncharted.software/facets-core';
import {FacetBarsBase} from '@uncharted.software/facets-core';

// @ts-ignore
import ZoomBarStyle from './ZoomBar.css';

@customElement('facet-plugin-zoom-bar')
export class ZoomBar extends FacetPlugin {
    public static get styles(): CSSResult[] {
        return [
            css`${unsafeCSS(ZoomBarStyle)}`,
        ];
    }

    public static get properties(): any {
        return {
            enabled: { type: Object },
        };
    }

    private _enabled: boolean = true;
    public get enabled(): boolean {
        return true;
    }
    public set enabled(value: boolean) {
        const oldValue = this._enabled;
        this._enabled = value;
        if (!this._enabled) {
            this.mouseTarget = null;
        }
        this.requestUpdate('enabled', oldValue);
    }

    private facet: FacetBarsBase | null = null;
    private mouseTarget: string | null = null;
    private mouseX: number | null = null;
    private boundMouseHandler: EventListener = this.handleMouseEvent.bind(this);

    protected hostChanged(host: HTMLElement|null): void {
        if (this.facet) {
            this.facet.removeEventListener('mousemove', this.boundMouseHandler);
            this.facet.removeEventListener('mouseleave', this.boundMouseHandler);
            this.facet.removeEventListener('mouseup', this.boundMouseHandler);
            this.facet.removeEventListener('touchstart', this.boundMouseHandler);
            this.facet.removeEventListener('touchend', this.boundMouseHandler);
            this.facet.removeEventListener('touchcancel', this.boundMouseHandler);
            this.facet.removeEventListener('touchmove', this.boundMouseHandler);
        }

        if (host instanceof FacetBarsBase) {
            this.facet = host;
            this.facet.addEventListener('mousemove', this.boundMouseHandler);
            this.facet.addEventListener('mouseleave', this.boundMouseHandler);
            this.facet.addEventListener('mouseup', this.boundMouseHandler);
            this.facet.addEventListener('touchstart', this.boundMouseHandler);
            this.facet.addEventListener('touchend', this.boundMouseHandler);
            this.facet.addEventListener('touchcancel', this.boundMouseHandler);
            this.facet.addEventListener('touchmove', this.boundMouseHandler);
        } else {
            this.facet = null;
        }
    }

    protected hostUpdated(changedProperties: Map<PropertyKey, unknown>): void {
        super.hostUpdated(changedProperties);
        if (changedProperties.has('view') || changedProperties.has('domain') || changedProperties.has('selection')) {
            this.requestUpdate();
        }
    }

    protected render(): TemplateResult | void {
        if (this.facet) {
            const domain = this.facet.domain;
            const view = this.facet.view;
            const selection = this.facet.selection;
            const domainLength = domain[1] - domain[0];
            const thumbLeft = (((view[0] - domain[0]) / domainLength) * 100).toFixed(2);
            const thumbRight = ((1.0 - (view[1] - domain[0]) / domainLength) * 100).toFixed(2);
            const selectionLeft = selection ? (((selection[0] - domain[0]) / domainLength) * 100).toFixed(2) : 0;
            const selectionRight = selection ? ((1.0 - (selection[1] - domain[0]) / domainLength) * 100).toFixed(2) : 100;
            return html`
            <div class="zoom-bar-container">
                <div class="zoom-bar-background">
                    <div class="zoom-bar-area">
                        <div class="zoom-bar-selection" style="left:${selectionLeft}%;right:${selectionRight}%;"></div>
                        <div class="zoom-bar-thumb" @mousedown="${this.handleMouseEvent}" style="left:${thumbLeft}%;right:${thumbRight}%;display:${this._enabled ? 'block' : 'none'}">
                            <div class="zoom-bar-handle zoom-bar-handle-left" @mousedown="${this.handleMouseEvent}"></div>
                            <div class="zoom-bar-handle zoom-bar-handle-right" @mousedown="${this.handleMouseEvent}"></div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }
        return html`${undefined}`;
    }

    private handleMouseEvent(event: Event): void {
        if (this.facet) {
            const mouseEvent = event as MouseEvent;
            const domain = this.facet.domain;
            const domainLength = domain[1] - domain[0];
            switch (mouseEvent.type) {
                case 'mousedown':
                case 'touchstart':
                    if (mouseEvent.currentTarget instanceof Element) {
                        if (mouseEvent.currentTarget.className.indexOf('zoom-bar-thumb') !== -1) {
                            this.mouseTarget = 'thumb';
                            event.preventDefault();
                        } else if (mouseEvent.currentTarget.className.indexOf('zoom-bar-handle-left') !== -1) {
                            this.mouseTarget = 'left-handle';
                            event.stopPropagation();
                            event.preventDefault();
                        } else if (mouseEvent.currentTarget.className.indexOf('zoom-bar-handle-right') !== -1) {
                            this.mouseTarget = 'right-handle';
                            event.stopPropagation();
                            event.preventDefault();
                        } else {
                            this.mouseTarget = null;
                        }
                        this.mouseX = mouseEvent.pageX;
                    }
                    break;

                case 'mouseup':
                case 'mouseleave':
                case 'touchcancel':
                case 'touchend':
                    this.mouseTarget = null;
                    break;

                case 'touchmove':
                case 'mousemove':
                    if (this.mouseTarget) {
                        const zoomBarArea = this.renderRoot.querySelector('.zoom-bar-area');
                        if (zoomBarArea) {
                            const rangeStep = zoomBarArea.scrollWidth / (domainLength + 1);
                            if (this.mouseX !== null) {
                                event.preventDefault();

                                const view = this.facet.view;
                                let distance = Math.round((mouseEvent.pageX - this.mouseX) / rangeStep);
                                if (distance > 0) {
                                    if (this.mouseTarget === 'left-handle') {
                                        distance = Math.min(distance, view[1] - view[0] - 1);
                                    } else {
                                        distance = Math.min(distance, domain[1] - view[1]);
                                    }
                                } else if (distance < 0) {
                                    if (this.mouseTarget === 'right-handle') {
                                        distance = Math.max(distance, view[0] - view[1] + 1);
                                    } else {
                                        distance = Math.max(distance, domain[0] - view[0]);
                                    }
                                }

                                if (distance) {
                                    switch (this.mouseTarget) {
                                        case 'thumb':
                                            this.facet.view = [view[0] + distance, view[1] + distance];
                                            break;

                                        case 'left-handle':
                                            this.facet.view = [view[0] + distance, view[1]];
                                            break;

                                        case 'right-handle':
                                            this.facet.view = [view[0], view[1] + distance];
                                            break;

                                        default:
                                            break;
                                    }

                                    this.mouseX += distance * rangeStep;
                                    this.requestUpdate();
                                }
                            }
                        }
                    }
                    break;

                default:
                    break;
            }
        }
    }
}

