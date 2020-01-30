import {css, CSSResult, customElement, unsafeCSS, TemplateResult, html} from 'lit-element';
import {FacetPlugin, makeIconSVG} from '@uncharted/facets-core';
import {faPlus} from '@fortawesome/free-solid-svg-icons/faPlus';
import {faMinus} from '@fortawesome/free-solid-svg-icons/faMinus';
import {faHome} from '@fortawesome/free-solid-svg-icons/faHome';

// @ts-ignore
import ZoomControlsStyle from './ZoomControls.css';

@customElement('facet-plugin-zoom-controls')
export class ZoomControls extends FacetPlugin {
    public static get styles(): CSSResult[] {
        return [
            css`${unsafeCSS(ZoomControlsStyle)}`,
        ];
    }

    protected render(): TemplateResult | void {
        if (this.host) {
            return html`
            <div class="zoom-controls-container">
                <div class="zoom-controls-buttons">
                    <div class="zoom-controls-button" @click="${this.dispatchClickEvent.bind(this, 'plus')}">
                        ${makeIconSVG(faPlus, 12, 12, '#A7A7A8')}
                    </div>
                    <div class="zoom-controls-button" @click="${this.dispatchClickEvent.bind(this, 'home')}">
                        ${makeIconSVG(faHome, 12, 12, '#DEDEDF')}
                    </div>
                    <div class="zoom-controls-button" @click="${this.dispatchClickEvent.bind(this, 'minus')}">
                        ${makeIconSVG(faMinus, 12, 12, '#A7A7A8')}
                    </div>
                </div>
            </div>`;
        }
        return html`${undefined}`;
    }

    private dispatchClickEvent(type: string): void {
        this.dispatchEvent(new CustomEvent('zoom-controls-clicked', {
            bubbles: false,
            detail: {
                type,
            },
        }));
    }
}
