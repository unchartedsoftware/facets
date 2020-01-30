import {css, CSSResult, customElement, html, TemplateResult, unsafeCSS} from 'lit-element';
import {FacetPlugin, FacetBarsBase} from '@uncharted/facets-core';

// @ts-ignore
import ScrollbarStyle from './Scrollbar.css';

@customElement('facet-plugin-scrollbar')
export class Scrollbar extends FacetPlugin {
    public static get styles(): CSSResult[] {
        return [
            css`${unsafeCSS(ScrollbarStyle)}`,
        ];
    }

    private facet: FacetBarsBase | null = null;
    private mouseTarget: string | null = null;
    private mouseX: number | null = null;
    private boundMouseHandler: EventListener = this.handleMouseEvent.bind(this);

    protected hostChanged(host: HTMLElement|null): void {
        if (this.facet) {
            this.facet.removeEventListener('mousemove', this.boundMouseHandler);
            this.facet.removeEventListener('mouseout', this.boundMouseHandler);
            this.facet.removeEventListener('mouseup', this.boundMouseHandler);
            this.facet.removeEventListener('touchstart', this.boundMouseHandler);
            this.facet.removeEventListener('touchend', this.boundMouseHandler);
            this.facet.removeEventListener('touchcancel', this.boundMouseHandler);
            this.facet.removeEventListener('touchmove', this.boundMouseHandler);
        }

        if (host instanceof FacetBarsBase) {
            this.facet = host;
            this.facet.addEventListener('mousemove', this.boundMouseHandler);
            this.facet.addEventListener('mouseout', this.boundMouseHandler);
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
            if (view[0] !== domain[0] || view[1] !== domain[1]) {
                const selection = this.facet.selection;
                const domainLength = domain[1] - domain[0];
                const thumbLeft = (((view[0] - domain[0]) / domainLength) * 100).toFixed(2);
                const thumbRight = ((1.0 - (view[1] - domain[0]) / domainLength) * 100).toFixed(2);
                const selectionLeft = selection ? (((selection[0] - domain[0]) / domainLength) * 100).toFixed(2) : 0;
                const selectionRight = selection ? ((1.0 - (selection[1] - domain[0]) / domainLength) * 100).toFixed(2) : 100;
                return html`
                <div class="scrollbar-container">
                    <div class="scrollbar-background">
                        <div class="scrollbar-area">
                            <div class="scrollbar-selection" style="left:${selectionLeft}%;right:${selectionRight}%;"></div>
                            <div class="scrollbar-thumb" @mousedown="${this.handleMouseEvent}" style="left:${thumbLeft}%;right:${thumbRight}%;"></div>
                        </div>
                    </div>
                </div>
                `;
            }
        }
        return html`<div class="scrollbar-container"></div>`;
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
                        if (mouseEvent.currentTarget.className.indexOf('scrollbar-thumb') !== -1) {
                            this.mouseTarget = 'thumb';
                            event.preventDefault();
                        } else {
                            this.mouseTarget = null;
                        }
                        this.mouseX = mouseEvent.pageX;
                    }
                    break;

                case 'mouseout':
                    if (mouseEvent.target === this.facet) {
                        this.mouseTarget = null;
                    }
                    break;

                case 'mouseup':
                case 'touchcancel':
                case 'touchend':
                    this.mouseTarget = null;
                    break;

                case 'touchmove':
                case 'mousemove':
                    if (this.mouseTarget) {
                        const zoomBarArea = this.renderRoot.querySelector('.scrollbar-area');
                        if (zoomBarArea) {
                            const rangeStep = zoomBarArea.scrollWidth / (domainLength + 1);
                            if (this.mouseX !== null) {
                                event.preventDefault();

                                const view = this.facet.view;
                                let distance = Math.round((mouseEvent.pageX - this.mouseX) / rangeStep);
                                if (distance > 0) {
                                    distance = Math.min(distance, domain[1] - view[1]);
                                } else if (distance < 0) {
                                    distance = Math.max(distance, domain[0] - view[0]);
                                }

                                if (distance) {
                                    if (this.mouseTarget === 'thumb') {
                                        this.facet.view = [view[0] + distance, view[1] + distance];
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
