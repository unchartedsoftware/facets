import {css, CSSResult, customElement, unsafeCSS, html, TemplateResult} from 'lit-element';
import {FacetHoverable} from '../facet-hoverable/FacetHoverable';

// @ts-ignore
import facetTermStyle from './FacetTerm.css';

export interface FacetTermData {
    ratio: number;
    label?: string;
    value?: number | string;
    annotation?: string;
    metadata?: any;
}

const kDefaultData: FacetTermData = { ratio: 0 };

@customElement('facet-term')
export class FacetTerm extends FacetHoverable {
    public static get styles(): CSSResult[] {
        const styles = super.styles;
        styles.push(css`
            ${unsafeCSS(facetTermStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
        };
    }

    public barRenderer: (value: FacetTerm) => TemplateResult | void = this.renderBar;
    public labelRenderer: (value: FacetTerm) => TemplateResult | void = this.renderLabel;
    public annotationRenderer: (value: FacetTerm) => TemplateResult | void = this.renderAnnotation;
    public valueRenderer: (value: FacetTerm) => TemplateResult | void = this.renderValue;

    private _data: FacetTermData = kDefaultData;
    public set data(newData: FacetTermData) {
        const oldData = this._data;

        this.labelAnimation = '';
        this.annotationAnimation = '';
        this.valueAnimation = '';

        if (oldData !== kDefaultData) {
            let delay = 0;
            if (oldData.label !== newData.label) {
                delay = 100;
                this.labelAnimation = 'facet-term-text-out';
            }
            if (oldData.annotation !== newData.annotation) {
                delay = 100;
                this.annotationAnimation = 'facet-term-text-out';
            }
            if (oldData.value !== newData.value) {
                delay = 100;
                this.valueAnimation = 'facet-term-text-out';
            }
            this.requestUpdate();
            setTimeout((): void => {
                if (this.labelAnimation) {
                    this.labelAnimation = 'facet-term-text-in';
                }
                if (this.annotationAnimation) {
                    this.annotationAnimation = 'facet-term-text-in';
                }
                if (this.valueAnimation) {
                    this.valueAnimation = 'facet-term-text-in';
                }
                this._data = newData;
                this.requestUpdate('data', oldData);
            }, delay);
        } else {
            this._data = newData;
            this.requestUpdate('data', oldData);
        }
    }
    public get data(): FacetTermData {
        return this._data;
    }

    private labelAnimation: string = '';
    private annotationAnimation: string = '';
    private valueAnimation: string = '';

    protected renderContent(): TemplateResult | void {
        return html`
        <div class="facet-term-container">
            <div class="facet-term-bar"><slot name="bar">${this.barRenderer(this)}</slot></div>
            <div class="facet-term-details">
                <div class="facet-term-label ${this.labelAnimation}"><slot name="label">${this.labelRenderer(this)}</slot></div>
                <div class="facet-term-annotation ${this.annotationAnimation}"><slot name="annotation">${this.annotationRenderer(this)}</slot></div>
                <div class="facet-term-value ${this.valueAnimation}"><slot name="value">${this.valueRenderer(this)}</slot></div>
            </div>
        </div>
        `;
    }

    protected renderBar(): TemplateResult | void {
        return html`
        <div class="facet-term-bar-background">
            <div class="facet-term-bar-ratio" style="width: ${Math.round(Math.max(Math.min(this.data.ratio, 1), 0) * 100)}%"></div>
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
