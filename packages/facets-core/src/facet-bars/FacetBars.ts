import {customElement, TemplateResult, html, CSSResult, css, unsafeCSS} from 'lit-element';
import {FacetBarsBase, FacetBarsBaseData, kFacetBarsBaseDefaultValues} from '../facet-bars-base/FacetBarsBase';

// @ts-ignore
import facetBarsStyle from './FacetBars.css';

export interface FacetBarsData {
    values: FacetBarsBaseData;
    label?: string;
    metadata?: any;
}

const kDefaultData: FacetBarsData = { values: kFacetBarsBaseDefaultValues };

@customElement('facet-bars')
export class FacetBars extends FacetBarsBase {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(facetBarsStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
        };
    }

    private _data: FacetBarsData = kDefaultData;
    public get data(): FacetBarsData {
        return this._data;
    }
    // @ts-ignore
    public set data(value: FacetBarsData | null) {
        const oldValue = this._data;
        if (!value || value === kDefaultData) {
            this._data = kDefaultData;
        } else {
            this._data = value;
        }
        this.values = this._data.values;
        this.requestUpdate('data', oldValue);
    }

    public connectedCallback(): void {
        super.connectedCallback();

        const labels = this.createSlottedElement('labels', 'facet-bars-labels');
        if (labels) {
            labels.setAttribute('id', 'facet-bars-labels');
        }

        const selection = this.createSlottedElement('selection', 'facet-bars-selection');
        if (selection) {
            selection.setAttribute('id', 'facet-bars-selection');
        }
    }

    protected renderHeaderLabel(): TemplateResult | void {
        return html`<span>${this.data.label}</span>`;
    }

    protected renderContent(): TemplateResult {
        return html`
        ${super.renderContent()}
        <slot name="labels"></slot>
        `;
    }
}
