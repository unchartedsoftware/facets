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

import {FacetPlugin} from '../../FacetPlugin';
import {customElement, TemplateResult, html} from 'lit-element';
import { styleMap, StyleInfo } from 'lit-html/directives/style-map';
import {FacetTimeline} from '../../../facet-timeline/FacetTimeline';
import {FacetBarsFilterValue, FacetBarsFilterEdge} from '../../../facet-bars-base/FacetBarsBase';

// @ts-ignore
import FacetTimelineSelectionStyle from './FacetTimelineSelection.css';

interface SelectionMouse {
    tracking: string | null;
    cursor: string | null;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    offset: number;
}

interface FilterRenderInfo {
    style: StyleInfo;
    displayBorder: string;
    minHandleStyle: StyleInfo;
    maxHandleStyle: StyleInfo;
    minLabel: string | null;
    maxLabel: string | null;
    minLabelStyle: StyleInfo;
    maxLabelStyle: StyleInfo;
    filterWidth: number;
    outerLeftWidth: number;
    outerRightWidth: number;
}

interface SelectionRenderInfo {
    style: StyleInfo;
    userBoxStyle: StyleInfo;
}

@customElement('facet-timeline-selection')
export class FacetTimelineSelection extends FacetPlugin {
    private facet: FacetTimeline | null = null;
    private facetRenderContent: (() => TemplateResult | void) | null = null;
    private labelCanvas: HTMLCanvasElement = document.createElement('canvas');
    private labelContext: CanvasRenderingContext2D = this.labelCanvas.getContext('2d') as CanvasRenderingContext2D;
    private boundMouseHandler: EventListener = this.handleMouseEvent.bind(this);
    private boundLocalMouseHandler = this.handleLocalMouseEvent.bind(this) as EventListener;

    private mouse: SelectionMouse = {
        tracking: null,
        cursor: null,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        offset: 0,
    };

    protected hostUpdated(changedProperties: Map<PropertyKey, unknown>): void {
        super.hostUpdated(changedProperties);
        if (changedProperties.has('view') ||
            changedProperties.has('domain') ||
            changedProperties.has('data') ||
            changedProperties.has('filter')) {
            this.requestUpdate();
        }
    }

    protected hostChanged(host: HTMLElement|null): void {
        if (this.facet) {
            window.document.removeEventListener('mousemove', this.boundMouseHandler);
            window.document.removeEventListener('mouseup', this.boundMouseHandler);
            window.document.removeEventListener('mouseleave', this.boundMouseHandler);

            const barArea = this.facet.barAreaElement;
            if (barArea) {
                barArea.removeEventListener('mousedown', this.boundMouseHandler);
            }

            this.monkeyUnpatchRenderer(this.facet);
        }

        if (host instanceof FacetTimeline) {
            this.facet = host;
            window.document.addEventListener('mousemove', this.boundMouseHandler);
            window.document.addEventListener('mouseup', this.boundMouseHandler);
            window.document.addEventListener('mouseleave', this.boundMouseHandler);

            const barArea = this.facet.barAreaElement;
            if (barArea) {
                barArea.addEventListener('mousedown', this.boundMouseHandler);
            }

            this.monkeyPatchRenderer(this.facet);
        } else {
            this.facet = null;
        }
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected renderPlugin(renderedValues: TemplateResult | void): TemplateResult | void {
        const facet = this.facet;
        if (facet) {
            const barArea = facet.barAreaElement;
            const filterInfo = this.computeFilterRenderInfo(facet, barArea);
            const selectionInfo = this.computeSelectionRenderInfo(facet, barArea);

            if (this.mouse.cursor) {
                facet.style.cursor = this.mouse.cursor;
            } else {
                facet.style.removeProperty('cursor');
            }

            return html`
            <style>${FacetTimelineSelectionStyle}</style>
            <div class="facet-timeline-filter-handle-track"></div>
            ${renderedValues}
            <div class="facet-timeline-selection-computed" style="${styleMap(selectionInfo.style)}"></div>
            <div class="facet-timeline-selection-user" style="${styleMap(selectionInfo.userBoxStyle)}"></div>
            <div class="facet-timeline-filter-computed" display-border="${filterInfo.displayBorder}" style="${styleMap(filterInfo.style)}">
                <div
                    class="facet-timeline-filter-handle facet-timeline-filter-handle-left"
                    style="${styleMap(filterInfo.minHandleStyle)}"
                    @mousedown="${this.boundLocalMouseHandler}">
                </div>
                <div
                    class="facet-timeline-filter-handle facet-timeline-filter-handle-right"
                    style="${styleMap(filterInfo.maxHandleStyle)}"
                    @mousedown="${this.boundLocalMouseHandler}">
                </div>
                <div
                    class="facet-timeline-date-label facet-timeline-date-label-left"
                    style="${styleMap(filterInfo.minLabelStyle)}"
                    @click="${this.minFilterDateClicked}"
                    >
                    ${filterInfo.minLabel}
                </div>
                <div
                    class="facet-timeline-date-label facet-timeline-date-label-right"
                    style="${styleMap(filterInfo.maxLabelStyle)}"
                    @click="${this.maxFilterDateClicked}"
                    >
                    ${filterInfo.maxLabel}
                </div>
            </div>
            `;
        }
        return undefined;
    }

    protected computeSelectionRenderInfo(facet: FacetTimeline, barArea: HTMLElement | null): SelectionRenderInfo {
        const result: SelectionRenderInfo = {
            style: { display: 'none' },
            userBoxStyle: { display: 'none' },
        };

        if (facet && barArea) {
            const rect = barArea.getBoundingClientRect();
            const width = rect.right - rect.left;
            const view = facet.view;
            const values = facet.values;
            const viewLength = view[1] - view[0];
            const barStep = width / viewLength;
            const timelineContent = facet.renderRoot.querySelector('.facet-timeline-content');
            const timelineBB = timelineContent ? timelineContent.getBoundingClientRect() : rect;

            if (this.mouse.tracking === 'selection-draw') {
                const filterValues = facet.filterValues;
                let minLocation = rect.left;
                let maxLocation = rect.left;
                let minIndex;
                let maxIndex;
                if (filterValues) {
                    minLocation = rect.left + Math.max(filterValues[0] - view[0], 0) * barStep;
                    maxLocation = rect.left + (Math.min(filterValues[1], view[1]) - view[0]) * barStep;
                    minIndex = Math.max(Math.floor(filterValues[0]) - view[0], 0);
                    maxIndex = Math.min(view[1] - view[0], Math.ceil(filterValues[1]) - view[0]);
                } else {
                    // minLocation += 0; // no need
                    maxLocation += (view[1] - view[0]) * barStep;
                    minIndex = 0;
                    maxIndex = view[1] - view[0];
                }
                const left = Math.max(Math.min(this.mouse.startX, this.mouse.endX), minLocation) - rect.left;
                const right = rect.right - Math.min(Math.max(this.mouse.startX, this.mouse.endX), maxLocation);
                const top = Math.max(Math.min(this.mouse.startY, this.mouse.endY), rect.top) - timelineBB.top;
                const bottom = timelineBB.bottom - Math.min(Math.max(this.mouse.startY, this.mouse.endY), rect.bottom);

                result.userBoxStyle = {
                    display: 'block',
                    top: `${top}px`,
                    bottom: `${bottom}px`,
                    left: `${left}px`,
                    right: `${right}px`,
                };


                const barStepPercentage = 100 / viewLength;
                let leftIndex = Math.max(Math.floor(left / barStep), minIndex);
                let rightIndex = Math.min(viewLength - Math.floor(right / barStep), maxIndex);

                while (leftIndex < rightIndex && !values[leftIndex + view[0]]) {
                    ++leftIndex;
                }

                while (rightIndex > leftIndex && !values[rightIndex + view[0] - 1]) {
                    --rightIndex;
                }

                if (leftIndex !== rightIndex) {
                    const leftBoundary = filterValues ? Math.max(filterValues[0], leftIndex) : leftIndex;
                    const rightBoundary = filterValues ? Math.min(filterValues[1], rightIndex) : rightIndex;
                    const leftPercentage = (barStepPercentage * leftBoundary);
                    const rightPercentage = (100 - barStepPercentage * rightBoundary);
                    const displayLeft = Math.min(Math.max(0, leftPercentage), 100).toFixed(2);
                    const displayRight = Math.min(Math.max(0, rightPercentage), 100).toFixed(2);

                    result.style = {
                        display: 'block',
                        left: `${displayLeft}%`,
                        right: `${displayRight}%`,
                        top: `${rect.top - timelineBB.top - 2}px`,
                        bottom: `${timelineBB.bottom - rect.bottom - 1}px`,
                    };
                }
            } else if (facet.selection) {
                const selection = facet.selection;
                const filterValues = facet.filterValues;
                const barStepPercentage = 100 / viewLength;
                const leftBoundary = filterValues ? Math.max(filterValues[0], selection[0]) : selection[0];
                const rightBoundary = filterValues ? Math.min(filterValues[1], selection[1]) : selection[1];
                const leftPercentage = barStepPercentage * (leftBoundary - view[0]);
                const rightPercentage = barStepPercentage * (view[1] - rightBoundary);
                const displayLeft = Math.min(Math.max(0, leftPercentage), 100).toFixed(2);
                const displayRight = Math.min(Math.max(0, rightPercentage), 100).toFixed(2);

                if (selection[1] >= view[0] && selection[0] <= view[1]) {
                    const style: {[name: string]: string} = {
                        display: 'block',
                        left: `${displayLeft}%`,
                        right: `${displayRight}%`,
                        top: `${rect.top - timelineBB.top - 2}px`,
                        bottom: `${timelineBB.bottom - rect.bottom - 1}px`,
                    };

                    if (selection[0] < view[0]) {
                        style.borderLeft = 'none';
                    }

                    if (selection[1] > view[1]) {
                        style.borderRight = 'none';
                    }

                    result.style = style;
                }
            }
        }

        return result;
    }

    protected computeFilterRenderInfo(facet: FacetTimeline, barArea: HTMLElement | null): FilterRenderInfo {
        const result: FilterRenderInfo = {
            style: { display: 'none' },
            displayBorder: ';',
            minHandleStyle: { display: 'block' },
            maxHandleStyle: { display: 'block' },
            minLabel: null,
            maxLabel: null,
            minLabelStyle: { display: 'none' },
            maxLabelStyle: { display: 'none' },
            filterWidth: 0,
            outerLeftWidth: 0,
            outerRightWidth: 0,
        };

        if (facet && barArea) {
            if (this.mouse.tracking === 'filter-resize') {
                this.computeFilterRenderInfoResize(result, facet, barArea);
            } else if (facet.filter) {
                this.computeFilterRenderInfoFilter(result, facet, barArea);
            } else {
                result.style = {
                    display: 'block',
                    left: '0',
                    right: '0',
                };
                result.displayBorder = 'no-border';
                result.minHandleStyle = { display: 'none' };
                result.maxHandleStyle = { display: 'none' };
            }

            this.computeFilterLabelsRenderInfo(result);
        }

        return result;
    }

    protected computeFilterRenderInfoResize(filterInfo: FilterRenderInfo, facet: FacetTimeline, barArea: HTMLElement): void {
        const rect = barArea.getBoundingClientRect();
        const width = rect.right - rect.left;
        const view = facet.view;
        const values = facet.values;
        const viewLength = view[1] - view[0];
        const barStep = width / viewLength;

        const left = Math.min(this.mouse.startX, this.mouse.endX) - rect.left;
        const right = rect.right - Math.max(this.mouse.startX, this.mouse.endX);
        const barStepPercentage = 100 / viewLength;
        let leftIndex = Math.floor(left / barStep);
        let rightIndex = viewLength - Math.floor(right / barStep);

        while (leftIndex < rightIndex && !values[leftIndex + view[0]]) {
            ++leftIndex;
        }

        while (rightIndex > leftIndex && !values[rightIndex + view[0] - 1]) {
            --rightIndex;
        }

        if (leftIndex !== rightIndex) {
            const leftBar = facet.data[view[0] + leftIndex];
            const rightBar = facet.data[view[0] + rightIndex - 1];
            const domain = facet.domain;
            leftIndex = Math.max(leftIndex, domain[0]);
            rightIndex = Math.min(rightIndex, domain[1]);

            const leftPercentage = (barStepPercentage * leftIndex);
            const rightPercentage = (100 - barStepPercentage * rightIndex);
            const displayLeft = Math.min(Math.max(0, leftPercentage), 100).toFixed(2);
            const displayRight = Math.min(Math.max(0, rightPercentage), 100).toFixed(2);

            filterInfo.style = {
                display: 'block',
                left: `${displayLeft}%`,
                right: `${displayRight}%`,
            };

            filterInfo.outerLeftWidth = Math.max(0, barStep * leftIndex);
            filterInfo.outerRightWidth = Math.max(0, width - barStep * rightIndex);
            filterInfo.filterWidth = width - filterInfo.outerLeftWidth - filterInfo.outerRightWidth;

            if (parseFloat(rightPercentage.toFixed(2)) < 0) {
                filterInfo.maxLabel = '●●●';
                filterInfo.displayBorder += 'no-right;';
                filterInfo.maxHandleStyle = { display: 'none' };
            } else if (rightBar) {
                filterInfo.maxLabel = rightBar.maxDateLabel;
            } else {
                filterInfo.maxLabel = null;
            }

            if (parseFloat(leftPercentage.toFixed(2)) < 0) {
                filterInfo.minLabel = '●●●';
                filterInfo.displayBorder += 'no-left;';
                filterInfo.minHandleStyle = { display: 'none' };
            } else if (leftBar) {
                filterInfo.minLabel = leftBar.minDateLabel;
            } else {
                filterInfo.minLabel = null;
            }
        }
    }

    protected computeFilterRenderInfoFilter(filterInfo: FilterRenderInfo, facet: FacetTimeline, barArea: HTMLElement): void {
        const rect = barArea.getBoundingClientRect();
        const width = rect.right - rect.left;
        const view = facet.view;
        const values = facet.values;
        const viewLength = view[1] - view[0];
        const barStep = width / viewLength;

        const filter = facet.filter as [FacetBarsFilterEdge, FacetBarsFilterEdge];
        const filterValues = facet.filterValues as [number, number];
        const barStepPercentage = 100 / viewLength;
        const leftPercentage = barStepPercentage * (filterValues[0] - view[0]);
        const rightPercentage = barStepPercentage * (view[1] - filterValues[1]);
        const displayLeft = Math.min(Math.max(0, leftPercentage), 100).toFixed(2);
        const displayRight = Math.min(Math.max(0, rightPercentage), 100).toFixed(2);
        let leftIndex = Math.floor(filterValues[0]);
        let rightIndex = Math.ceil(filterValues[1]);

        while (leftIndex < rightIndex && !values[leftIndex]) {
            ++leftIndex;
        }

        while (rightIndex > leftIndex && !values[rightIndex - 1]) {
            --rightIndex;
        }

        if (leftIndex !== rightIndex) {
            const leftBar = facet.data[leftIndex];
            const rightBar = facet.data[rightIndex - 1];

            if (rightPercentage <= 100 && leftPercentage <= 100) {
                filterInfo.style = {
                    display: 'block',
                    left: `${displayLeft}%`,
                    right: `${displayRight}%`,
                };

                filterInfo.outerLeftWidth = Math.max(0, barStep * (filterValues[0] - view[0]));
                filterInfo.outerRightWidth = Math.max(0, width - barStep * (filterValues[1] - view[0]));
                filterInfo.filterWidth = width - filterInfo.outerLeftWidth - filterInfo.outerRightWidth;

                if (rightPercentage < 0) {
                    filterInfo.maxLabel = '●●●';
                    filterInfo.displayBorder += 'no-right;';
                    filterInfo.maxHandleStyle = {display: 'none'};
                } else if (isNaN(filter[1] as number)) {
                    filterInfo.maxLabel = (filter[1] as FacetBarsFilterValue).label;
                } else if (rightBar) {
                    filterInfo.maxLabel = rightBar.maxDateLabel;
                } else {
                    filterInfo.maxLabel = '●●●';
                }

                if (leftPercentage < 0) {
                    filterInfo.minLabel = '●●●';
                    filterInfo.displayBorder += 'no-left;';
                    filterInfo.minHandleStyle = {display: 'none'};
                } else if (isNaN(filter[0] as number)) {
                    filterInfo.minLabel = (filter[0] as FacetBarsFilterValue).label;
                } else if (leftBar) {
                    filterInfo.minLabel = leftBar.minDateLabel;
                } else {
                    filterInfo.minLabel = '●●●';
                }
            }
        }
    }

    protected computeFilterLabelsRenderInfo(filterInfo: FilterRenderInfo): void {
        if (filterInfo.minLabel && filterInfo.maxLabel) {
            const minDateWidth = this.computeLabelWidth(filterInfo.minLabel);
            const maxDateWidth = this.computeLabelWidth(filterInfo.maxLabel);
            const dateLabelsPadding = 15; /* px */

            if (filterInfo.filterWidth > minDateWidth + maxDateWidth + dateLabelsPadding) {
                filterInfo.minLabelStyle = { display: 'block', left: '4px' };
                filterInfo.maxLabelStyle = { display: 'block', right: '4px' };
            } else if (filterInfo.outerLeftWidth < minDateWidth && filterInfo.outerRightWidth < maxDateWidth) {
                filterInfo.minLabelStyle = {
                    display: 'block',
                    left: '4px',
                    width: `${filterInfo.filterWidth * 0.5}px`,
                };
                filterInfo.maxLabelStyle = {
                    display: 'block',
                    right: '4px',
                    width: `${filterInfo.filterWidth * 0.5}px`,
                };
            } else if (filterInfo.outerLeftWidth < minDateWidth) {
                filterInfo.minLabelStyle = {
                    display: 'block',
                    left: '4px',
                    width: `${Math.min(minDateWidth + dateLabelsPadding,
                        Math.max(filterInfo.filterWidth - dateLabelsPadding, 0))}px`,
                };
                filterInfo.maxLabelStyle = {
                    display: 'block',
                    right: '-10px',
                    transform: 'translate(100%,0)',
                };
            } else if (filterInfo.outerRightWidth < maxDateWidth) {
                filterInfo.minLabelStyle = {
                    display: 'block',
                    left: '-10px',
                    transform: 'translate(-100%,0)',
                };
                filterInfo.maxLabelStyle = {
                    display: 'block',
                    right: '4px',
                    width: `${Math.min(maxDateWidth + dateLabelsPadding,
                        Math.max(filterInfo.filterWidth - dateLabelsPadding, 0))}px`,
                };
            } else {
                filterInfo.minLabelStyle = {
                    display: 'block',
                    left: '-10px',
                    transform: 'translate(-100%,0)',
                };
                filterInfo.maxLabelStyle = {
                    display: 'block',
                    right: '-10px',
                    transform: 'translate(100%,0)',
                };
            }
        }
    }

    private handleMouseEvent(evt: Event): void {
        const host = this.facet;
        if (host) {
            const barArea = host.barAreaElement;
            if (barArea) {
                const mouseEvent = evt as MouseEvent;

                switch (mouseEvent.type) {
                    case 'mousedown':
                        mouseEvent.stopPropagation();
                        mouseEvent.preventDefault();
                        if (this.isPointInSelectionArea(mouseEvent.clientX, mouseEvent.clientY, barArea, host)) {
                            this.mouse.tracking = 'selection-draw';
                            this.mouse.cursor = 'crosshair';
                            this.mouse.startX = this.mouse.endX = mouseEvent.clientX;
                            this.mouse.startY = this.mouse.endY = mouseEvent.clientY;
                            this.mouse.offset = 0;
                            host.requestUpdate();
                        }
                        break;

                    case 'mousemove':
                        if (this.mouse.tracking) {
                            this.mouse.endX = mouseEvent.clientX;
                            this.mouse.endY = mouseEvent.clientY;
                            if (this.mouse.endX > this.mouse.startX) {
                                this.mouse.endX = Math.max(this.mouse.startX, this.mouse.endX - this.mouse.offset);
                            } else if (this.mouse.endX < this.mouse.startX) {
                                this.mouse.endX = Math.min(this.mouse.startX, this.mouse.endX + this.mouse.offset);
                            }
                            mouseEvent.stopPropagation();
                            mouseEvent.preventDefault();
                            host.requestUpdate();
                        } else if (host.filterValues) {
                            let newCursor = null;

                            if (this.isPointInSelectionArea(mouseEvent.clientX, mouseEvent.clientY, barArea, host)) {
                                newCursor = 'crosshair';
                            }

                            if (this.mouse.cursor !== newCursor) {
                                this.mouse.cursor = newCursor;
                                host.requestUpdate();
                            }
                        }
                        break;

                    case 'mouseleave':
                    case 'mouseup':
                        if (this.mouse.tracking === 'filter-resize') {
                            this.setFilter(host);
                            host.requestUpdate();
                        } else if (this.mouse.tracking === 'selection-draw') {
                            this.setSelection(host);
                            host.requestUpdate();
                        }
                        mouseEvent.stopPropagation();
                        mouseEvent.preventDefault();
                        this.mouse.tracking = null;
                        break;

                    default:
                        break;
                }
            }
        }
    }

    private handleLocalMouseEvent(evt: MouseEvent): void {
        const host = this.facet;
        if (host && evt.type === 'mousedown' && evt.button === 0 && evt.target instanceof HTMLElement) {
            evt.stopPropagation();
            evt.preventDefault();
            if (evt.target.className.includes('facet-timeline-filter-clear-button')) {
                host.filter = null;
            } else {
                const barArea = host.barAreaElement;
                const filterValues = host.filterValues;
                if (barArea && filterValues) {
                    const view = host.view;
                    const rect = barArea.getBoundingClientRect();
                    const viewLength = view[1] - view[0];
                    const width = rect.right - rect.left;
                    const barStep = width / viewLength;

                    if (evt.target.className.includes('facet-timeline-filter-handle-left')) {
                        this.mouse.tracking = 'filter-resize';
                        this.mouse.cursor = 'ew-resize';
                        this.mouse.startX = rect.left + barStep * (filterValues[1] - view[0]) - 1;
                        this.mouse.startY = rect.top;
                        this.mouse.endX = rect.left + barStep * (filterValues[0] - view[0]) + 1;
                        this.mouse.endY = evt.clientY;
                        this.mouse.offset = this.mouse.endX - evt.clientX;
                    } else if (evt.target.className.includes('facet-timeline-filter-handle-right')) {
                        this.mouse.tracking = 'filter-resize';
                        this.mouse.cursor = 'ew-resize';
                        this.mouse.startX = rect.left + barStep * (filterValues[0] - view[0]) + 1;
                        this.mouse.startY = rect.top;
                        this.mouse.endX = rect.left + barStep * (filterValues[1] - view[0]) - 1;
                        this.mouse.endY = evt.clientY;
                        this.mouse.offset = evt.clientX - this.mouse.endX;
                    }
                }
            }
        }
    }

    private minFilterDateClicked(event: Event): void {
        this.dispatchEvent(new CustomEvent('timeline-interaction', {
            bubbles: false,
            detail: {
                type: 'min-filter-label-clicked',
                el: event.currentTarget,
            },
        }));
    }

    private maxFilterDateClicked(event: Event): void {
        this.dispatchEvent(new CustomEvent('timeline-interaction', {
            bubbles: false,
            detail: {
                type: 'max-filter-label-clicked',
                el: event.currentTarget,
            },
        }));
    }

    private setFilter(host: FacetTimeline): void {
        const barArea = host.barAreaElement;
        if (barArea) {
            const rect = barArea.getBoundingClientRect();
            const left = Math.min(this.mouse.startX, this.mouse.endX) - rect.left;
            const right = Math.max(this.mouse.startX, this.mouse.endX) - rect.left;
            const view = host.view;
            const viewLength = view[1] - view[0];
            const width = rect.right - rect.left;
            const barStep = width / viewLength;
            const values = host.values;
            let leftIndex = Math.floor(left / barStep) + view[0];
            let rightIndex = Math.ceil(right / barStep) + view[0];

            while (leftIndex < rightIndex && !values[leftIndex]) {
                ++leftIndex;
            }

            while (rightIndex > leftIndex && !values[rightIndex - 1]) {
                --rightIndex;
            }

            if (leftIndex !== rightIndex) {
                const domain = host.domain;
                leftIndex = Math.max(leftIndex, domain[0]);
                rightIndex = Math.min(rightIndex, domain[1]);
                host.filter = [leftIndex, rightIndex];

                const selection = host.selection;
                if (selection) {
                    if (selection[1] <= leftIndex || selection[0] >= rightIndex) {
                        host.selection = null;
                    } else if (selection[0] < leftIndex || selection[1] > rightIndex) {
                        host.selection = [Math.max(selection[0], leftIndex), Math.min(selection[1], rightIndex)];
                    }
                }
            } else {
                host.filter = null;
            }
        }
    }

    private setSelection(host: FacetTimeline): void {
        const barArea = host.barAreaElement;
        if (barArea) {
            const rect = barArea.getBoundingClientRect();
            const left = Math.min(this.mouse.startX, this.mouse.endX) - rect.left;
            const right = Math.max(this.mouse.startX, this.mouse.endX) - rect.left;
            const view = host.view;
            const viewLength = view[1] - view[0];
            const width = rect.right - rect.left;
            const barStep = width / viewLength;
            const values = host.values;
            const filterValues = host.filterValues;
            let leftIndex;
            let rightIndex;
            if (filterValues) {
                const filter0 = Math.floor(filterValues[0]);
                const filter1 = Math.ceil(filterValues[1]);
                leftIndex = Math.max(Math.floor(left / barStep) + view[0], filter0);
                rightIndex = Math.min(Math.ceil(right / barStep) + view[0], filter1);
            } else {
                leftIndex = Math.max(Math.floor(left / barStep) + view[0], view[0]);
                rightIndex = Math.min(Math.ceil(right / barStep) + view[0], view[1]);
            }

            while (leftIndex < rightIndex && !values[leftIndex]) {
                ++leftIndex;
            }

            while (rightIndex > leftIndex && !values[rightIndex - 1]) {
                --rightIndex;
            }

            if (
                host.selection &&
                host.selection[0] === leftIndex &&
                host.selection[1] === rightIndex
            ) {
                host.selection = null;
            } else if (leftIndex !== rightIndex) {
                host.selection = [leftIndex, rightIndex];
            } else {
                host.selection = null;
            }
        }
    }

    private monkeyPatchRenderer(facet: FacetTimeline): void {
        const facetAny: any = facet;
        if (typeof facetAny.renderTimelineContent === 'function') {
            this.facetRenderContent = facetAny.renderTimelineContent;
            facetAny.renderTimelineContent = (): TemplateResult | void => {
                if (this.facetRenderContent) {
                    return this.renderPlugin(this.facetRenderContent.call(facetAny));
                }
                return undefined;
            };
        }
    }

    private monkeyUnpatchRenderer(facet: FacetTimeline): void {
        const facetAny: any = facet;
        if (this.facetRenderContent && typeof this.facetRenderContent === 'function') {
            facetAny.renderTimelineContent = this.facetRenderContent;
            this.facetRenderContent = null;
        }
    }

    private computeLabelWidth(label: string): number {
        this.labelContext.font = '12px "IBM Plex Sans", sans-serif';
        return this.labelContext.measureText(label).width;
    }

    private isPointInSelectionArea(x: number, y: number, barArea: HTMLElement, host: FacetTimeline): boolean {
        const rect = barArea.getBoundingClientRect();
        if (y >= rect.top && y <= rect.bottom) {
            if (host.filterValues) {
                const left = x - rect.left;
                const right = x - rect.left;
                const view = host.view;
                const viewLength = view[1] - view[0];
                const width = rect.right - rect.left;
                const barStep = width / viewLength;
                const filterValues = host.filterValues;
                const filter0 = Math.floor(filterValues[0]);
                const filter1 = Math.ceil(filterValues[1]);
                const leftIndex = Math.floor(left / barStep) + view[0];
                const rightIndex = Math.ceil(right / barStep) + view[0];
                return leftIndex >= filter0 && rightIndex <= filter1;
            }
            return x >= rect.left && x <= rect.right;
        }
        return false;
    }
}
