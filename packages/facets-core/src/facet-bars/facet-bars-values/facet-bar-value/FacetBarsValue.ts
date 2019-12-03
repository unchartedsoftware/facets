import {customElement, html, TemplateResult} from 'lit-element';
import {FacetElement} from '../../../facet-element/FacetElement';
import {renderButtonIcon, renderButtons} from '../../../tools/buttons';

export interface FacetBarsValueData {
    ratio: number;
    labels?: string[];
    metadata?: any;
}

export const kFacetVarsValueNullData: FacetBarsValueData = { ratio: 0 };

@customElement('facet-bars-value')
export class FacetBarsValue extends FacetElement {
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
                    toAttribute: (value: number): string => value.toString(),
                },
            },
            actionButtons: { type: Number, attribute: 'action-buttons' },
        };
    }

    private _data: FacetBarsValueData = kFacetVarsValueNullData;
    public get data(): FacetBarsValueData {
        return this._data;
    }
    public set data(newData: FacetBarsValueData) {
        const oldData = this._data;
        this._data = newData;
        this.requestUpdate('data', oldData);
    }

    public subselection: number = NaN;
    public actionButtons: number = 2;

    public buttonsRenderer: (facet: any) => TemplateResult | void = renderButtons;
    public buttonIconRenderer: (facet: any, index: number, total: number) => TemplateResult | void = renderButtonIcon;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): TemplateResult | void {
        const totalHeight = Math.round(Math.max(Math.min(this._data.ratio, 1), 0) * 100);
        const selectionHeight = isNaN(this.subselection) ? totalHeight : Math.round(Math.max(Math.min(this.subselection, 1), 0) * 100);
        return html`
        <div class="facet-bars-value-background">
            <div class="facet-bars-value-bar-total" style="height: ${totalHeight}%"></div>
            <div class="facet-bars-value-bar" style="height: ${selectionHeight}%"></div>
        </div>
        <div class="facet-hoverable-buttons"><slot name="buttons">
            ${this.buttonsRenderer(this)}
        </slot></div>
        `;
    }
}
