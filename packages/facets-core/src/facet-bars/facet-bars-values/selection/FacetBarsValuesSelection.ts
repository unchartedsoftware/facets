import {TemplateResult, html} from 'lit-element';
import {FacetBarsValues} from '../FacetBarsValues';

interface SelectionMouse {
    tracking: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export class FacetBarsValuesSelection {
    private mouse: SelectionMouse = {
        tracking: false,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
    };

    public render(host: FacetBarsValues): TemplateResult | void {
        let userStyle = 'display:none';
        let computedStyle = 'display:none';
        const barArea = host.barAreaElement;
        if (barArea) {
            if (this.mouse.tracking) {
                const rect = barArea.getBoundingClientRect();
                const left = Math.min(this.mouse.startX, this.mouse.endX) - rect.left;
                const right = rect.right - Math.max(this.mouse.startX, this.mouse.endX);
                const top = Math.min(this.mouse.startY, this.mouse.endY) - rect.top;
                const bottom = rect.bottom - Math.max(this.mouse.startY, this.mouse.endY);

                userStyle = `top:${top}px;bottom:${bottom}px;left:${left}px;right:${right}px`;

                const view = host.view;
                const viewLength = view[1] - view[0];
                const width = rect.right - rect.left;
                const barStep = width / viewLength;
                const barStepPercentage = 100 / viewLength;
                const leftIndex = Math.floor(left / barStep);
                const rightIndex = Math.floor(right / barStep);
                const leftPercentage = (barStepPercentage * leftIndex).toFixed(2);
                const rightPercentage = (barStepPercentage * rightIndex).toFixed(2);

                computedStyle = `left:${leftPercentage}%;right:${rightPercentage}%`;
            } else if (host.selection) {
                const view = host.view;
                const selection = host.selection;
                const viewLength = view[1] - view[0];
                const barStepPercentage = 100 / viewLength;
                const leftPercentage = (barStepPercentage * (selection[0] - view[0])).toFixed(2);
                const rightPercentage = (barStepPercentage * (view[1] - selection[1])).toFixed(2);

                computedStyle = `left:${leftPercentage}%;right:${rightPercentage}%`;
            }
        }
        return html`
        <div class="facet-bars-values-selection-computed" style="${computedStyle}"></div>
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
                    this.mouse.tracking = true;
                    this.mouse.startX = this.mouse.endX = evt.clientX;
                    this.mouse.startY = this.mouse.endY = evt.clientY;
                    evt.stopPropagation();
                    evt.preventDefault();
                    host.requestUpdate();
                    break;

                case 'mousemove':
                    if (this.mouse.tracking) {
                        this.mouse.endX = evt.clientX;
                        this.mouse.endY = evt.clientY;
                        evt.stopPropagation();
                        evt.preventDefault();
                        host.requestUpdate();
                    }
                    break;

                case 'mouseup':
                case 'mouseleave':
                    if (this.mouse.tracking) {
                        this.mouse.tracking = false;
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
            host.selection = [Math.floor(left / barStep) + view[0], Math.ceil(right / barStep) + view[0]];
        }
    }
}
