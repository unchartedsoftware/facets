import {FacetPlugin} from '../../FacetPlugin';
import {customElement, TemplateResult, html} from 'lit-element';
import {FacetTimeline} from '../../../facet-timeline/FacetTimeline';

// @ts-ignore
import FacetTimelineSelectionStyle from './FacetTimelineSelection.css';

interface SelectionMouse {
    tracking: string | null;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    offset: number;
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
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        offset: 0,
    };

    protected hostUpdated(changedProperties: Map<PropertyKey, unknown>): void {
        super.hostUpdated(changedProperties);
        if (changedProperties.has('view') || changedProperties.has('domain') || changedProperties.has('data')) {
            this.requestUpdate();
        }
    }

    protected hostChanged(host: HTMLElement|null): void {
        if (this.facet) {
            window.document.removeEventListener('mousemove', this.boundMouseHandler);
            window.document.removeEventListener('mouseup', this.boundMouseHandler);
            window.document.removeEventListener('mouseleave', this.boundMouseHandler);
            this.monkeyUnpatchRenderer(this.facet);
        }

        if (host instanceof FacetTimeline) {
            this.facet = host;
            window.document.addEventListener('mousemove', this.boundMouseHandler);
            window.document.addEventListener('mouseup', this.boundMouseHandler);
            window.document.addEventListener('mouseleave', this.boundMouseHandler);
            this.monkeyPatchRenderer(this.facet);

            if (!this.facet.selection) {
                this.facet.selection = this.facet.domain;
            }
        } else {
            this.facet = null;
        }
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected renderSelection(renderedValues: TemplateResult | void): TemplateResult | void {
        const host = this.facet;
        if (host) {
            if (!host.selection) {
                host.selection = host.domain;
            }

            const barArea = host.barAreaElement;
            let computedStyle = 'display:none';
            let leftStyle = 'display:block';
            let rightStyle = 'display:block';
            let displayBorder = ';';

            let maxDateStyle = 'display:none';
            let minDateLabel = null;

            let minDateStyle = 'display:none';
            let maxDateLabel = null;

            if (barArea) {
                const rect = barArea.getBoundingClientRect();
                const width = rect.right - rect.left;
                const view = host.view;
                const viewLength = view[1] - view[0];
                const barStep = width / viewLength;

                let selectionWidth = 0;
                let outerLeftWidth = 0;
                let outerRightWidth = 0;

                host.style.cursor = 'default';

                if (this.mouse.tracking) {
                    const values = host.values;
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

                    host.style.cursor = 'ew-resize';

                    if (leftIndex !== rightIndex) {
                        const leftPercentage = (barStepPercentage * leftIndex);
                        const rightPercentage = (100 - barStepPercentage * rightIndex);
                        const displayLeft = Math.min(Math.max(0, leftPercentage), 100).toFixed(2);
                        const displayRight = Math.min(Math.max(0, rightPercentage), 100).toFixed(2);
                        const leftBar = host.data[view[0] + leftIndex];
                        const rightBar = host.data[view[0] + rightIndex - 1];

                        computedStyle = `left:${displayLeft}%;right:${displayRight}%;`;
                        outerLeftWidth = Math.max(0, barStep * leftIndex);
                        outerRightWidth = Math.max(0, width - barStep * rightIndex);
                        selectionWidth = width - outerLeftWidth - outerRightWidth;

                        if (parseFloat(rightPercentage.toFixed(2)) < 0) {
                            displayBorder += 'no-right;';
                            rightStyle = 'display:none';
                            maxDateLabel = '●●●';
                        } else if (rightBar) {
                            maxDateLabel = rightBar.maxDateLabel;
                        } else {
                            maxDateLabel = '...';
                        }

                        if (parseFloat(leftPercentage.toFixed(2)) < 0) {
                            displayBorder += 'no-left;';
                            leftStyle = 'display:none';
                            minDateLabel = '●●●';
                        } else if (leftBar) {
                            minDateLabel = leftBar.minDateLabel;
                        } else {
                            minDateLabel = '...';
                        }
                    }
                } else if (host.selection) {
                    const selection = host.selection;
                    const barStepPercentage = 100 / viewLength;
                    const leftPercentage = barStepPercentage * (selection[0] - view[0]);
                    const rightPercentage = barStepPercentage * (view[1] - selection[1]);
                    const displayLeft = Math.min(Math.max(0, leftPercentage), 100).toFixed(2);
                    const displayRight = Math.min(Math.max(0, rightPercentage), 100).toFixed(2);
                    const leftBar = host.data[selection[0]];
                    const rightBar = host.data[selection[1] - 1];

                    if (rightPercentage <= 100 && leftPercentage <= 100) {
                        computedStyle = `left:${displayLeft}%;right:${displayRight}%;`;
                        outerLeftWidth = Math.max(0, barStep * (selection[0] - view[0]));
                        outerRightWidth = Math.max(0, width - barStep * (selection[1] - view[0]));
                        selectionWidth = width - outerLeftWidth - outerRightWidth;

                        if (rightPercentage < 0) {
                            displayBorder += 'no-right;';
                            rightStyle = 'display:none';
                            maxDateLabel = '●●●';
                        } else if (rightBar) {
                            maxDateLabel = rightBar.maxDateLabel;
                        } else {
                            maxDateLabel = '...';
                        }

                        if (leftPercentage < 0) {
                            displayBorder += 'no-left;';
                            leftStyle = 'display:none';
                            minDateLabel = '●●●';
                        } else if (leftBar) {
                            minDateLabel = leftBar.minDateLabel;
                        } else {
                            minDateLabel = '...';
                        }
                    }
                }

                if (minDateLabel && maxDateLabel) {
                    const minDateWidth = this.computeLabelWidth(minDateLabel as string);
                    const maxDateWidth = this.computeLabelWidth(maxDateLabel as string);
                    const dateLabelsPadding = 15; /* px */

                    if (selectionWidth > minDateWidth + maxDateWidth + dateLabelsPadding) {
                        minDateStyle = 'left:4px;';
                        maxDateStyle = 'right:4px';
                    } else {
                        if (outerLeftWidth < minDateWidth && outerRightWidth < maxDateWidth) {
                            minDateStyle = `left:4px;width:${selectionWidth * 0.5}px`;
                            maxDateStyle = `right:4px;width:${selectionWidth * 0.5}px`;
                        } else if (outerLeftWidth < minDateWidth) {
                            minDateStyle = `left:4px;width:${Math.max(selectionWidth - dateLabelsPadding, 0)}px`;
                            maxDateStyle = 'right:-10px;transform:translate(100%,0);';
                        } else if (outerRightWidth < maxDateWidth) {
                            minDateStyle = 'left:-10px;transform:translate(-100%,0);';
                            maxDateStyle = `right:4px;width:${Math.max(selectionWidth - dateLabelsPadding, 0)}px`;
                        } else {
                            minDateStyle = 'left:-10px;transform:translate(-100%,0);';
                            maxDateStyle = 'right:-10px;transform:translate(100%,0);';
                        }
                    }
                }
            }
            return html`
            <style>${FacetTimelineSelectionStyle}</style>
            ${renderedValues}
            <div class="facet-timeline-selection-computed" display-border="${displayBorder}" style="${computedStyle}">
                <div
                    class="facet-timeline-selection-handle facet-timeline-selection-handle-left"
                    style="${leftStyle}"
                    @mousedown="${this.boundLocalMouseHandler}">
                </div>
                <div
                    class="facet-timeline-selection-handle facet-timeline-selection-handle-right"
                    style="${rightStyle}"
                    @mousedown="${this.boundLocalMouseHandler}">
                </div>
                <div class="facet-timeline-date-label facet-timeline-date-label-left" style="${minDateStyle}">${minDateLabel}</div>
                <div class="facet-timeline-date-label facet-timeline-date-label-right" style="${maxDateStyle}">${maxDateLabel}</div>
            </div>
            `;
        }
        return undefined;
    }

    private handleMouseEvent(evt: Event): void {
        if (this.mouse.tracking) {
            const host = this.facet;
            if (host && host.barAreaElement) {
                const mouseEvent = evt as MouseEvent;

                switch (mouseEvent.type) {
                    case 'mousemove':
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
                        break;
                    case 'mouseleave':
                    case 'mouseup':
                        this.mouse.tracking = null;
                        this.setSelection(host);
                        mouseEvent.stopPropagation();
                        mouseEvent.preventDefault();
                        host.requestUpdate();
                        break;

                    default:
                        break;
                }
            }
        }
    }

    private handleLocalMouseEvent(evt: MouseEvent): void {
        const host = this.facet;
        if (host && evt.type === 'mousedown' && evt.target instanceof HTMLElement) {
            evt.stopPropagation();
            evt.preventDefault();
            if (evt.target.className.includes('facet-timeline-selection-clear-button')) {
                host.selection = null;
            } else {
                const barArea = host.barAreaElement;
                const selection = host.selection;
                if (barArea && selection) {
                    const view = host.view;
                    const rect = barArea.getBoundingClientRect();
                    const viewLength = view[1] - view[0];
                    const width = rect.right - rect.left;
                    const barStep = width / viewLength;

                    if (evt.target.className.includes('facet-timeline-selection-handle-left')) {
                        this.mouse.tracking = 'resize';
                        this.mouse.startX = rect.left + barStep * (selection[1] - view[0]) - 1;
                        this.mouse.startY = rect.top;
                        this.mouse.endX = rect.left + barStep * (selection[0] - view[0]) + 1;
                        this.mouse.endY = evt.clientY;
                        this.mouse.offset = this.mouse.endX - evt.clientX;
                    } else if (evt.target.className.includes('facet-timeline-selection-handle-right')) {
                        this.mouse.tracking = 'resize';
                        this.mouse.startX = rect.left + barStep * (selection[0] - view[0]) + 1;
                        this.mouse.startY = rect.top;
                        this.mouse.endX = rect.left + barStep * (selection[1] - view[0]) - 1;
                        this.mouse.endY = evt.clientY;
                        this.mouse.offset = evt.clientX - this.mouse.endX;
                    }
                }
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
            let leftIndex = Math.floor(left / barStep) + view[0];
            let rightIndex = Math.ceil(right / barStep) + view[0];

            while (leftIndex < rightIndex && !values[leftIndex]) {
                ++leftIndex;
            }

            while (rightIndex > leftIndex && !values[rightIndex - 1]) {
                --rightIndex;
            }

            if (leftIndex !== rightIndex) {
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
                    return this.renderSelection(this.facetRenderContent.call(facetAny));
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
        this.labelContext.font = '8px "IBM Plex Sans", sans-serif';
        return this.labelContext.measureText(label).width;
    }
}
