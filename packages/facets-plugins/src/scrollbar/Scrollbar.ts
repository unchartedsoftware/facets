import {css, CSSResult, customElement, html, TemplateResult, unsafeCSS} from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map';
import {FacetPlugin, FacetBarsBase} from '@uncharted/facets-core';

// @ts-ignore
import ScrollbarStyle from './Scrollbar.css';

enum WheelScrollState {
    idle,
    enabled,
    locked,
}

@customElement('facet-plugin-scrollbar')
export class Scrollbar extends FacetPlugin {
    public static get styles(): CSSResult[] {
        return [
            css`${unsafeCSS(ScrollbarStyle)}`,
        ];
    }

    public static get properties(): any {
        return {
            minBarWidth: { type: Number, attribute: 'min-bar-width' },
        };
    }

    public minBarWidth: number = 8;

    private facet: FacetBarsBase | null = null;
    private mouseTarget: string | null = null;
    private mouseX: number | null = null;
    private boundMouseHandler: EventListener = this.handleMouseEvent.bind(this);

    private wheelScrollState: WheelScrollState = WheelScrollState.idle;
    private wheelDeltaXSum: number = 0;
    private wheelDeltaYSum: number = 0;
    private lastWheelTime: number = 0;
    private wheelDeltaThreshold: number = 14;
    private wheelTimeThreshold: number = 80; /* ms */
    private boundWheelHandler: EventListener = this.wheelHandler.bind(this);

    private animatedScrolling: boolean = false;
    private scrollStep: number = 0;

    protected hostChanged(host: HTMLElement|null): void {
        if (this.facet) {
            this.facet.removeEventListener('wheel', this.boundWheelHandler);
            this.facet.removeEventListener('mousedown', this.boundMouseHandler);
            window.document.removeEventListener('mousemove', this.boundMouseHandler);
            window.document.removeEventListener('mouseleave', this.boundMouseHandler);
            window.document.removeEventListener('mouseup', this.boundMouseHandler);
        }

        if (host instanceof FacetBarsBase) {
            this.facet = host;
            this.facet.addEventListener('wheel', this.boundWheelHandler);
            this.facet.addEventListener('mousedown', this.boundMouseHandler);
            window.document.addEventListener('mousemove', this.boundMouseHandler);
            window.document.addEventListener('mouseleave', this.boundMouseHandler);
            window.document.addEventListener('mouseup', this.boundMouseHandler);
            this.ensureMaxBarWidth();
        } else {
            this.facet = null;
        }
    }

    protected hostUpdated(changedProperties: Map<PropertyKey, unknown>): void {
        super.hostUpdated(changedProperties);

        this.ensureMaxBarWidth();

        if (
            changedProperties.has('view') ||
            changedProperties.has('domain') ||
            changedProperties.has('selection') ||
            changedProperties.has('filter') ||
            changedProperties.has('values')
        ) {
            this.requestUpdate();
        }
    }

    protected render(): TemplateResult | void {
        if (this.facet) {
            const domain = this.facet.domain;
            const view = this.facet.view;
            {
                const domainLength = domain[1] - domain[0];
                const thumbLeft = (((view[0] - domain[0]) / domainLength) * 100).toFixed(2);
                const thumbRight = ((1.0 - (view[1] - domain[0]) / domainLength) * 100).toFixed(2);
                const thumbVisibility = view[0] !== domain[0] || view[1] !== domain[1] ? 'visible' : 'hidden';
                const thumbStyle = {
                    left: `${thumbLeft}%`,
                    right: `${thumbRight}%`,
                    visibility: thumbVisibility,
                };
                return html`
                <div class="scrollbar-container">
                    <div class="scrollbar-background">
                        <div class="scrollbar-area" @mousedown="${this.handleMouseEvent}">
                            <div class="scrollbar-thumb"
                            @mousedown="${this.handleMouseEvent}"
                            dark="${this.mouseTarget ? 'true' : 'false'}"
                            style=${styleMap(thumbStyle)}></div>
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
            switch (mouseEvent.type) {
                case 'mousedown':
                    if (mouseEvent.currentTarget instanceof Element) {
                        if (mouseEvent.currentTarget === this.facet && mouseEvent.button === 1) {
                            this.mouseTarget = 'drag';
                            this.animatedScrolling = false;
                            event.preventDefault();
                            event.stopImmediatePropagation();
                        } else if (mouseEvent.currentTarget.className.indexOf('scrollbar-thumb') !== -1 && mouseEvent.button === 0) {
                            this.mouseTarget = 'thumb';
                            this.animatedScrolling = false;
                            event.preventDefault();
                            event.stopImmediatePropagation();
                        } else {
                            if (mouseEvent.currentTarget instanceof Element && mouseEvent.currentTarget.className.indexOf('scrollbar-area') !== -1) {
                                if (mouseEvent.button === 0) {
                                    const scrollbarArea = this.renderRoot.querySelector('.scrollbar-area');
                                    if (scrollbarArea) {
                                        const domain = this.facet.domain;
                                        const domainLength = domain[1] - domain[0];
                                        const view = this.facet.view;
                                        const pageLength = Math.max(view[1] - view[0] - 1, 1);
                                        const scrollBB = scrollbarArea.getBoundingClientRect();
                                        const clickX = mouseEvent.clientX - scrollBB.x;

                                        const thumbLeft = (view[0] - domain[0]) / domainLength * scrollBB.width;
                                        const thumbRight = (view[1] - domain[0]) / domainLength * scrollBB.width;

                                        let distance = 0;
                                        if (clickX > thumbRight) {
                                            distance = Math.min(pageLength, domain[1] - view[1]);
                                        } else if (clickX < thumbLeft) {
                                            distance = Math.max(-pageLength, domain[0] - view[0]);
                                        }

                                        if (distance) {
                                            this.animatedScrollTo(distance);
                                        }
                                    }
                                }
                                event.preventDefault();
                            }
                            this.mouseTarget = null;
                        }
                        this.mouseX = mouseEvent.pageX;
                    }
                    break;

                case 'mouseleave':
                case 'mouseup':
                    this.mouseTarget = null;
                    this.requestUpdate();
                    break;

                case 'mousemove':
                    if (this.mouseTarget) {
                        const scrollbarArea = this.renderRoot.querySelector('.scrollbar-area');
                        if (scrollbarArea) {
                            const domain = this.facet.domain;
                            const domainLength = domain[1] - domain[0];
                            const view = this.facet.view;
                            const viewLength = view[1] - view[0];
                            const scrollWidth = scrollbarArea.getBoundingClientRect().width;
                            let rangeStep;
                            let distanceMultiplier;

                            if (this.mouseTarget === 'drag') {
                                rangeStep = scrollWidth / (viewLength + 1);
                                distanceMultiplier = -1;
                            } else {
                                rangeStep = scrollWidth / (domainLength + 1);
                                distanceMultiplier = 1;
                            }

                            if (this.mouseX !== null) {
                                event.preventDefault();

                                let distance = Math.round((mouseEvent.pageX - this.mouseX) / rangeStep) * distanceMultiplier;
                                if (distance > 0) {
                                    distance = Math.min(distance, domain[1] - view[1]);
                                } else if (distance < 0) {
                                    distance = Math.max(distance, domain[0] - view[0]);
                                }

                                if (distance) {
                                    this.facet.view = [view[0] + distance, view[1] + distance];
                                    this.mouseX += distance * rangeStep * distanceMultiplier;
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

    private ensureMaxBarWidth(): void {
        if (this.facet) {
            const barArea = this.facet.barAreaElement;
            const view = this.facet.view;
            if (barArea) {
                const maxBarCount = Math.floor(barArea.scrollWidth / this.minBarWidth);
                if (view[1] - view[0] > maxBarCount) {
                    this.facet.view = [view[0], view[0] + maxBarCount];
                    this.requestUpdate();
                }
            }
        }
    }

    private wheelHandler(event: Event): void {
        if (this.facet) {
            const wheelEvent = event as WheelEvent;
            const timestamp = wheelEvent.timeStamp;
            wheelEvent.preventDefault();

            if (timestamp - this.lastWheelTime > this.wheelTimeThreshold) {
                this.wheelDeltaXSum = wheelEvent.deltaX;
                this.wheelDeltaYSum = wheelEvent.deltaY;
                this.wheelScrollState = WheelScrollState.idle;
            } else {
                this.wheelDeltaXSum += wheelEvent.deltaX;
                this.wheelDeltaYSum += wheelEvent.deltaY;
            }

            this.lastWheelTime = timestamp;

            const viewLength = this.facet.view[1] - this.facet.view[0];
            const deltaThreshold = this.wheelDeltaThreshold / (viewLength * 0.1);

            if (this.wheelScrollState === WheelScrollState.idle) {
                if (Math.abs(this.wheelDeltaXSum) >= deltaThreshold) {
                    this.wheelScrollState = WheelScrollState.enabled;
                    this.animatedScrolling = false;
                } else if (Math.abs(this.wheelDeltaYSum) >= deltaThreshold) {
                    this.wheelScrollState = WheelScrollState.locked;
                }
            }

            while (this.wheelScrollState === WheelScrollState.enabled && Math.abs(this.wheelDeltaXSum) >= deltaThreshold) {
                const domain = this.facet.domain;
                const view = this.facet.view;
                let distance;
                if (this.wheelDeltaXSum > 0) {
                    distance = Math.min(1, domain[1] - view[1]);
                    this.wheelDeltaXSum -= deltaThreshold;
                } else {
                    distance = Math.max(-1, domain[0] - view[0]);
                    this.wheelDeltaXSum += deltaThreshold;
                }

                if (distance) {
                    this.facet.view = [view[0] + distance, view[1] + distance];
                    this.requestUpdate();
                }
            }
        }
    }

    private animatedScrollTo(distance: number, duration: number = 200): void {
        if (this.facet) {
            const startTime = performance.now();
            const milliStep = distance / duration;
            const start = this.facet.view;
            this.animatedScrolling = true;
            window.requestAnimationFrame((time: number): void => this._animatedScrollTo(
                start,
                distance,
                0,
                milliStep,
                time,
                time - startTime,
            ));
        }
    }

    private _animatedScrollTo(start: [number, number], distance: number, current: number, milliStep: number, time: number, delta: number): void {
        if (this.facet && this.animatedScrolling && current !== distance) {
            let newCurrent = current + milliStep * delta;
            if (Math.abs(newCurrent) >= Math.abs(distance)) {
                newCurrent = distance;
            }

            const offset = Math.floor(newCurrent);
            const view = this.facet.view;
            const newView: [number, number] = [start[0] + offset, start[1] + offset];
            if (view[0] !== newView[0] || view[1] !== newView[1]) {
                this.facet.view = newView;
                this.requestUpdate();
            }

            window.requestAnimationFrame((newTime: number): void => {
                this._animatedScrollTo(
                    start,
                    distance,
                    newCurrent,
                    milliStep,
                    newTime,
                    newTime - time,
                );
            });
        } else {
            this.animatedScrolling = false;
        }
    }
}
