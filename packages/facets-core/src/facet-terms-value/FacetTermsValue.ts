import {css, CSSResult, customElement, unsafeCSS, html, TemplateResult} from 'lit-element';
import {FacetHoverable} from '../facet-hoverable/FacetHoverable';

// @ts-ignore
import facetTermValueStyle from './FacetTermsValue.css';

export interface FacetTermsValueData {
    ratio: number;
    label?: string;
    value?: number | string;
    annotation?: string;
    metadata?: any;
}

const kDefaultData: FacetTermsValueData = { ratio: 0 };

@customElement('facet-terms-value')
export class FacetTermsValue extends FacetHoverable {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(facetTermValueStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
            state: { type: String, reflect: true },
            contrast: { type: Object, reflect: true },
            subselection: { type: Number },
        };
    }

    public state: string | null = null;
    public contrast: boolean = false;
    public subselection: number | null = null;

    private _data: FacetTermsValueData = kDefaultData;
    public set data(newData: FacetTermsValueData) {
        const oldData = this._data;
        this._data = newData;
        this.requestUpdate('data', oldData);
    }
    public get data(): FacetTermsValueData {
        return this._data;
    }

    protected renderContent(): TemplateResult | void {
        return html`
        <div class="facet-term-container">
            <div class="facet-term-bar"><slot name="bar">${this.renderBar()}</slot></div>
            <div class="facet-term-details">
                <div class="facet-term-label"><slot name="label">${this.renderLabel()}</slot></div>
                <div class="facet-term-annotation"><slot name="annotation">${this.renderAnnotation()}</slot></div>
                <div class="facet-term-value"><slot name="value">${this.renderValue()}</slot></div>
            </div>
        </div>
        `;
    }

    protected renderBar(): TemplateResult | void {
        const ratio = (Math.max(Math.min(this.data.ratio, 1), 0) * 100).toFixed(2);
        const selected = this.subselection ? (Math.max(Math.min(this.subselection, 1), 0) * 100).toFixed(2) : ratio;
        return html`
        <div class="facet-term-bar-background">
            <div class="facet-term-bar-ratio" style="width:${ratio}%"></div>
            <div class="facet-term-bar-selected" style="width:${selected}%"></div>
        </div>
        `;
    }

    protected renderLabel(): TemplateResult {
        return html`<span>${this.data.label}</span>`;
    }

    protected renderAnnotation(): TemplateResult {
        return html`<span>${this.data.annotation}</span>`;
    }

    protected renderValue(): TemplateResult {
        return html`<span>${this.data.value}</span>`;
    }
}
