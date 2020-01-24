import {FacetPlugin} from '../../FacetPlugin';
import {customElement, TemplateResult, html} from 'lit-element';
import {FacetBarsBase} from '../../../facet-bars-base/FacetBarsBase';

// @ts-ignore
import FacetBarsSelectionStyle from './FacetBarsSelection.css';

interface SelectionMouse {
    tracking: string | null;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    offset: number;
}

@customElement('facet-bars-selection')
export class FacetBarsSelection extends FacetPlugin {
    private facet: FacetBarsBase | null = null;
    private facetRenderValues: (() => TemplateResult | void) | null = null;
    private handleMouseEventBound = this.handleMouseEvent.bind(this) as EventListener;
    private handleLocalMouseEventBound = this.handleLocalMouseEvent.bind(this) as EventListener;

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
        if (host instanceof FacetBarsBase) {
            this.facet = host;
            this.facet.addEventListener('facet-bars-mouse-event', this.handleMouseEventBound);
            this.monkeyPatchRenderer(this.facet);
        } else {
            if (this.facet) {
                this.facet.removeEventListener('facet-bars-mouse-event', this.handleMouseEventBound);
                this.monkeyUnpatchRenderer(this.facet);
            }
            this.facet = null;
        }
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected renderSelection(renderedValues: TemplateResult | void): TemplateResult | void {
        const host = this.facet;
        if (host) {
            const barArea = host.barAreaElement;
            let userStyle = 'display:none';
            let computedStyle = 'display:none';
            let leftStyle = 'display:block';
            let rightStyle = 'display:block';

            if (barArea) {
                host.style.cursor = 'default';
                if (this.mouse.tracking) {
                    const rect = barArea.getBoundingClientRect();
                    const left = Math.min(this.mouse.startX, this.mouse.endX) - rect.left;
                    const right = rect.right - Math.max(this.mouse.startX, this.mouse.endX);

                    if (this.mouse.tracking === 'draw') {
                        const top = Math.min(this.mouse.startY, this.mouse.endY) - rect.top;
                        const bottom = rect.bottom - Math.max(this.mouse.startY, this.mouse.endY);

                        userStyle = `top:${top}px;bottom:${bottom}px;left:${left}px;right:${right}px;`;
                        host.style.cursor = 'crosshair';
                    } else {
                        host.style.cursor = 'ew-resize';
                    }

                    const values = host.values;
                    const view = host.view;
                    const viewLength = view[1] - view[0];
                    const width = rect.right - rect.left;
                    const barStep = width / viewLength;
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
                        const leftPercentage = (barStepPercentage * leftIndex);
                        const rightPercentage = (100 - barStepPercentage * rightIndex);
                        const displayLeft = Math.min(Math.max(0, leftPercentage), 100).toFixed(2);
                        const displayRight = Math.min(Math.max(0, rightPercentage), 100).toFixed(2);

                        computedStyle = `left:${displayLeft}%;right:${displayRight}%;`;

                        if (parseFloat(rightPercentage.toFixed(2)) < 0) {
                            computedStyle += 'border-right:none;';
                            rightStyle = 'display:none';
                        }
                        if (parseFloat(leftPercentage.toFixed(2)) < 0) {
                            computedStyle += 'border-left:none;';
                            leftStyle = 'display:none';
                        }
                    }
                } else if (host.selection) {
                    const view = host.view;
                    const selection = host.selection;
                    const viewLength = view[1] - view[0];
                    const barStepPercentage = 100 / viewLength;
                    const leftPercentage = barStepPercentage * (selection[0] - view[0]);
                    const rightPercentage = barStepPercentage * (view[1] - selection[1]);
                    const displayLeft = Math.min(Math.max(0, leftPercentage), 100).toFixed(2);
                    const displayRight = Math.min(Math.max(0, rightPercentage), 100).toFixed(2);

                    if (rightPercentage <= 100 && leftPercentage <= 100) {
                        computedStyle = `left:${displayLeft}%;right:${displayRight}%;`;
                        if (rightPercentage < 0) {
                            computedStyle += 'border-right:none;';
                            rightStyle = 'display:none';
                        }
                        if (leftPercentage < 0) {
                            computedStyle += 'border-left:none;';
                            leftStyle = 'display:none';
                        }
                    }
                }
            }
            return html`
            <style>${FacetBarsSelectionStyle}</style>
            ${renderedValues}
            <div class="facet-bars-selection-computed" style="${computedStyle}">
                <div
                    class="facet-bars-selection-handle facet-bars-selection-handle-left"
                    style="${leftStyle}"
                    @mousedown="${this.handleLocalMouseEventBound}">
                </div>
                <div
                    class="facet-bars-selection-clear-button"
                    style="${rightStyle}"
                    @mousedown="${this.handleLocalMouseEventBound}">
                </div>
                <div
                    class="facet-bars-selection-handle facet-bars-selection-handle-right"
                    style="${rightStyle}"
                    @mousedown="${this.handleLocalMouseEventBound}">
                </div>
            </div>
            <div class="facet-bars-selection-user" style="${userStyle}"></div>
            `;
        }
        return undefined;
    }

    private handleMouseEvent(evt: CustomEvent): void {
        const mouseEvent = evt.detail.mouseEvent;
        const host = this.facet;
        if (host && host.barAreaElement) {
            switch (mouseEvent.type) {
                case 'mousedown':
                    this.mouse.tracking = 'draw';
                    this.mouse.startX = this.mouse.endX = mouseEvent.clientX;
                    this.mouse.startY = this.mouse.endY = mouseEvent.clientY;
                    this.mouse.offset = 0;
                    mouseEvent.stopPropagation();
                    mouseEvent.preventDefault();
                    host.requestUpdate();
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
                    }
                    break;

                case 'mouseup':
                case 'mouseleave':
                    if (this.mouse.tracking) {
                        this.mouse.tracking = null;
                        this.setSelection(host);
                        mouseEvent.stopPropagation();
                        mouseEvent.preventDefault();
                        host.requestUpdate();
                    }
                    break;

                default:
                    break;
            }
        }
    }

    private handleLocalMouseEvent(evt: MouseEvent): void {
        const host = this.facet;
        if (host && evt.type === 'mousedown' && evt.target instanceof HTMLElement) {
            evt.stopPropagation();
            evt.preventDefault();
            if (evt.target.className.includes('facet-bars-selection-clear-button')) {
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

                    if (evt.target.className.includes('facet-bars-selection-handle-left')) {
                        this.mouse.tracking = 'resize';
                        this.mouse.startX = rect.left + barStep * (selection[1] - view[0]) - 1;
                        this.mouse.startY = rect.top;
                        this.mouse.endX = rect.left + barStep * (selection[0] - view[0]) + 1;
                        this.mouse.endY = evt.clientY;
                        this.mouse.offset = this.mouse.endX - evt.clientX;
                    } else if (evt.target.className.includes('facet-bars-selection-handle-right')) {
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

    private setSelection(host: FacetBarsBase): void {
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

    private monkeyPatchRenderer(facet: FacetBarsBase): void {
        const facetAny: any = facet;
        if (typeof facetAny.renderValues === 'function') {
            this.facetRenderValues = facetAny.renderValues;
            facetAny.renderValues = (): TemplateResult | void => {
                if (this.facetRenderValues) {
                    return this.renderSelection(this.facetRenderValues.call(facetAny));
                }
                return undefined;
            };
        }
    }

    private monkeyUnpatchRenderer(facet: FacetBarsBase): void {
        const facetAny: any = facet;
        if (this.facetRenderValues && typeof this.facetRenderValues === 'function') {
            facetAny.renderValues = this.facetRenderValues;
            this.facetRenderValues = null;
        }
    }
}
