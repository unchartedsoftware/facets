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
