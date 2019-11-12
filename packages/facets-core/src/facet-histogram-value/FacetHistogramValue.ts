import {css, CSSResult, customElement, unsafeCSS, html, TemplateResult} from 'lit-element';
import {FacetHoverable} from '../facet-hoverable/FacetHoverable';

// @ts-ignore
import facetHistogramValueStyle from './FacetHistogramValue.css';

export interface FacetHistogramValueData {
    ratio: number;
    labels?: {
        left: string;
        right: string;
    };
    metadata?: any;
}

const kDefaultData: FacetHistogramValueData = { ratio: 0 };

@customElement('facet-histogram-value')
export class FacetHistogramValue extends FacetHoverable {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(facetHistogramValueStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
        };
    }

    private _data: FacetHistogramValueData = kDefaultData;
    public set data(newData: FacetHistogramValueData) {
        const oldData = this._data;
        this._data = newData;
        this.requestUpdate('data', oldData);
    }
    public get data(): FacetHistogramValueData {
        return this._data;
    }

    protected renderContent(): TemplateResult | void {
        const height = Math.round(Math.max(Math.min(this._data.ratio, 1), 0) * 100);
        return html`
        <div class="facet-bars-value-background">
            <div class="facet-bars-value-bar" style="height: ${height}%"></div>
        </div>
        `;
    }

    protected firstUpdated(_changedProperties: Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);
        let node: HTMLElement | null = this.renderRoot.querySelector('.facet-histogram-value-bar');
        while (node) {
            node = node.parentElement || (node as any).__shady_native_parentElement;
        }
    }
}
