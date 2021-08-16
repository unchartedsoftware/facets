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
import {FacetPlugin} from '../../FacetPlugin';
import {FacetBarsBase} from '../../../facet-bars-base/FacetBarsBase';

// @ts-ignore
import FacetTimelineLabelsStyle from './FacetTimelineLabels.css';

@customElement('facet-timeline-labels')
export class FacetTimelineLabels extends FacetPlugin {
    private ro: ResizeObserver = new ResizeObserver(entries => {
        entries.forEach(e => {
            const label = e.target as FacetTimelineLabels;
            label.resizeCallback(e.contentRect);
        });
    });

    public static get styles(): CSSResult[] {
        return [
            css`${unsafeCSS(FacetTimelineLabelsStyle)}`,
        ];
    }

    private facet: FacetBarsBase | null = null;
    private labelCanvas: HTMLCanvasElement = document.createElement('canvas');
    private labelContext: CanvasRenderingContext2D = this.labelCanvas.getContext('2d') as CanvasRenderingContext2D;

    private renderedWidth: number | null = null;
    protected hostUpdated(changedProperties: Map<PropertyKey, unknown>): void {
        super.hostUpdated(changedProperties);
        if (changedProperties.has('view') || changedProperties.has('domain') || changedProperties.has('data')) {
            this.requestUpdate();
        }
    }

    protected hostChanged(host: HTMLElement|null): void {
        if (host instanceof FacetBarsBase) {
            this.facet = host;
        } else {
            this.facet = null;
        }
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.ro.observe(this);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.ro.unobserve(this);
    }

    resizeCallback(domRect: DOMRectReadOnly): void {
        if (this.renderedWidth && domRect.width !== this.renderedWidth) {
            this.requestUpdate();
        }
    }

    protected render(): TemplateResult | void {
        const facet = this.facet;
        if (facet) {
            const ticks: TemplateResult[] = [];
            const labels: TemplateResult[] = [];
            const barArea = facet.barAreaElement;
            if (barArea) {
                const domain = facet.domain;
                const view = facet.view;
                const values = facet.values;
                const viewLength = view[1] - view[0];
                const width = barArea.getBoundingClientRect().width;
                const barStep = width / viewLength;
                const barStepPercentage = 100 / viewLength;
                const labelLevels: string[] = [];
                const padding = 5;

                let renderedWidth = 0;
                for (let v = view[0], n = view[1] - 1; v <= n; ++v) {
                    const value = values[v];
                    const i = v - view[0];
                    let tickHeight = 2;

                    if (v >= domain[0] && v <= domain[1]) {
                        if (value && value.label) {
                            // get the label for the value
                            const label = Array.isArray(value.label) ? value.label : [value.label];

                            // if we are not keeping track of all the levels in the label, initialize them
                            if (labelLevels.length < label.length) {
                                for (let ii = labelLevels.length, nn = label.length; ii < nn; ++ii) {
                                    labelLevels[ii] = '';
                                }
                            }

                            // check which level should be rendered
                            let renderLevel = -1;
                            for (let ii = label.length - 1; ii >= 0; --ii) {
                                if (label[ii] !== labelLevels[ii]) {
                                    renderLevel = ii;
                                    break;
                                }
                            }

                            // if a level should be rendered, check if there's enough space to render it
                            if (renderLevel >= 0 && renderedWidth <= barStep * i) {
                                const labelWidth = this.computeLabelWidth(label[renderLevel]);
                                let hasSpace = false;
                                let offset = 0;
                                let offsetPercent = 0;
                                let labelPosition = 0;

                                if (i === 0) {
                                    hasSpace = true;
                                    labelPosition = 0;
                                    offset = padding;
                                    offsetPercent = 0;
                                } else if (barStep * i + labelWidth * 0.5 > width && renderedWidth <= width - labelWidth - padding) {
                                    hasSpace = true;
                                    labelPosition = width;
                                    offset = labelWidth + padding * 2;
                                    offsetPercent = -100;
                                } else if (renderedWidth <= barStep * i - labelWidth * 0.5 - padding && renderedWidth + labelWidth + padding < width) {
                                    hasSpace = true;
                                    labelPosition = barStep * i;
                                    offset = labelWidth * 0.5 + padding;
                                    offsetPercent = -50;
                                }

                                if (hasSpace) {
                                    tickHeight += renderLevel * 2 + 2;
                                    labelLevels[renderLevel] = label[renderLevel];
                                    renderedWidth = labelPosition + labelWidth + padding * 2 - offset;

                                    const positionPercent = (labelPosition / width * 100).toFixed(2);
                                    const labelWeight = renderLevel ? '600' : 'normal';
                                    const labelColor = renderLevel ? '#666768' : '#A7A7A8';

                                    labels.push(html`
                                <div
                                class="facet-timeline-labels-label"
                                style="top:${tickHeight}px;left:${positionPercent}%;font-weight:${labelWeight};color:${labelColor};transform:translate(${offsetPercent}%,0);">
                                    ${label[renderLevel]}
                                </div>`);
                                }
                            }
                        }

                        ticks.push(html`<div class="facet-timeline-labels-tick" style="height:${tickHeight}px;left:${(barStepPercentage * i).toFixed(2)}%"></div>`);
                    }
                }
                this.renderedWidth = renderedWidth;
            }
            return html`
            <div class="facet-timeline-labels-container">
                ${ticks}
                ${labels}
            </div>`;
        }
        return html`${undefined}`;
    }

    private computeLabelWidth(label: string): number {
        this.labelContext.font = '10px "IBM Plex Sans", sans-serif';
        return this.labelContext.measureText(label).width;
    }
}
