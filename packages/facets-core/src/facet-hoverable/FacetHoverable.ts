import {customElement, TemplateResult, html, CSSResult, css, unsafeCSS} from 'lit-element';
import {FacetBlueprint} from '../facet-blueprint/FacetBlueprint';
import {renderButtons} from '../tools/buttons';

// @ts-ignore
import buttonsStyle from '../tools/buttons.css';
// @ts-ignore
import facetHoverableStyle from './FacetHoverable.css';

@customElement('facet-hoverable')
export class FacetHoverable extends FacetBlueprint {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(buttonsStyle)}
            ${unsafeCSS(facetHoverableStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            actionButtons: { type: Number, attribute: 'action-buttons' },
        };
    }

    private _actionButtons: number = 2;
    public set actionButtons(value: number) {
        const oldValue = this._actionButtons;
        this._actionButtons = value;
        this.requestUpdate('actionButtons', oldValue);
    }
    public get actionButtons(): number {
        return this._actionButtons;
    }

    protected renderLayoutAdditions(): TemplateResult | void {
        return html`
        <div class="facet-hoverable-buttons"><slot name="buttons">
            ${renderButtons(this)}
        </slot></div>
        `;
    }

    public constructor() {
        super();
    }
}
