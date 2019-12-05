import {TemplateResult, html} from 'lit-element';
import {FacetBarsValues} from '../FacetBarsValues';

interface SelectionMouse {
    tracking: string | null;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    offset: number;
}

export class FacetBarsValuesSelection {
    private mouse: SelectionMouse = {
        tracking: null,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        offset: 0,
    };

    public render(host: FacetBarsValues): TemplateResult | void {
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
        <div class="facet-bars-values-selection-computed" style="${computedStyle}">
            <div
                class="facet-bars-values-selection-handle facet-bars-values-selection-handle-left"
                style="${leftStyle}"
                @mousedown="${this.handleLocalMouseEvent.bind(this, host)}">
            </div>
            <div
                class="facet-bars-values-selection-clear-button"
                style="${rightStyle}"
                @mousedown="${this.handleLocalMouseEvent.bind(this, host)}">
            </div>
            <div
                class="facet-bars-values-selection-handle facet-bars-values-selection-handle-right"
                style="${rightStyle}"
                @mousedown="${this.handleLocalMouseEvent.bind(this, host)}">
            </div>
        </div>
        <div class="facet-bars-values-selection-user" style="${userStyle}"></div>
        `;
    }

    public getMouseHandler(host: FacetBarsValues): (evt: MouseEvent) => void {
        return this.handleMouseEvent.bind(this, host);
    }

    public handleMouseEvent(host: FacetBarsValues, evt: MouseEvent): void {
        if (evt.currentTarget === host.barAreaElement) {
            switch (evt.type) {
                case 'mousedown':
                    this.mouse.tracking = 'draw';
                    this.mouse.startX = this.mouse.endX = evt.clientX;
                    this.mouse.startY = this.mouse.endY = evt.clientY;
                    this.mouse.offset = 0;
                    evt.stopPropagation();
                    evt.preventDefault();
                    host.requestUpdate();
                    break;

                case 'mousemove':
                    if (this.mouse.tracking) {
                        this.mouse.endX = evt.clientX;
                        this.mouse.endY = evt.clientY;
                        if (this.mouse.endX > this.mouse.startX) {
                            this.mouse.endX = Math.max(this.mouse.startX, this.mouse.endX - this.mouse.offset);
                        } else if (this.mouse.endX < this.mouse.startX) {
                            this.mouse.endX = Math.min(this.mouse.startX, this.mouse.endX + this.mouse.offset);
                        }
                        evt.stopPropagation();
                        evt.preventDefault();
                        host.requestUpdate();
                    }
                    break;

                case 'mouseup':
                case 'mouseleave':
                    if (this.mouse.tracking) {
                        this.mouse.tracking = null;
                        this._setSelection(host);
                        evt.stopPropagation();
                        evt.preventDefault();
                        host.requestUpdate();
                    }
                    break;

                default:
                    break;
            }
        }
    }

    public handleLocalMouseEvent(host: FacetBarsValues, evt: MouseEvent): void {
        if (evt.type === 'mousedown' && evt.target instanceof HTMLElement) {
            evt.stopPropagation();
            evt.preventDefault();
            if (evt.target.className.includes('facet-bars-values-selection-clear-button')) {
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

                    if (evt.target.className.includes('facet-bars-values-selection-handle-left')) {
                        this.mouse.tracking = 'resize';
                        this.mouse.startX = rect.left + barStep * (selection[1] - view[0]) - 1;
                        this.mouse.startY = rect.top;
                        this.mouse.endX = rect.left + barStep * (selection[0] - view[0]) + 1;
                        this.mouse.endY = evt.clientY;
                        this.mouse.offset = this.mouse.endX - evt.clientX;
                    } else if (evt.target.className.includes('facet-bars-values-selection-handle-right')) {
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

    private _setSelection(host: FacetBarsValues): void {
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
}
