import {css, CSSResult, customElement, unsafeCSS, html, TemplateResult} from 'lit-element';
import {FacetHoverable} from '../facet-hoverable/FacetHoverable';

// @ts-ignore
import facetBarsValueStyle from './FacetBarsValue.css';

export interface FacetBarsValueData {
    ratio: number;
    range?: {
        min: number;
        max: number;
    };
    metadata?: any;
}

const kDefaultData: FacetBarsValueData = { ratio: 0 };

@customElement('facet-bars-value')
export class FacetBarsValue extends FacetHoverable {
    public static get styles(): CSSResult[] {
        const styles = super.styles;
        styles.push(css`
            ${unsafeCSS(facetBarsValueStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
            subselection: {
                type: Number,
                converter: {
                    fromAttribute: (value: string): number => {
                        if (!value) {
                            return NaN;
                        }
                        return parseFloat(value);
                    },
                    toAttribute: (value: number): string => {
                        return value.toString();
                    },
                },
            },
        };
    }

    private _data: FacetBarsValueData = kDefaultData;
    public set data(newData: FacetBarsValueData) {
        const oldData = this._data;
        this._data = newData;
        this.requestUpdate('data', oldData);
    }
    public get data(): FacetBarsValueData {
        return this._data;
    }

    public subselection: number = NaN;

    protected renderContent(): TemplateResult | void {
        const totalHeight = Math.round(Math.max(Math.min(this._data.ratio, 1), 0) * 100);
        const selectionHeight = isNaN(this.subselection) ? totalHeight : Math.round(Math.max(Math.min(this.subselection, 1), 0) * 100);
        return html`
        <div class="facet-bars-value-background">
            <div class="facet-bars-value-bar-total" style="height: ${totalHeight}%"></div>
            <div class="facet-bars-value-bar" style="height: ${selectionHeight}%"></div>
        </div>
        `;
    }
}
