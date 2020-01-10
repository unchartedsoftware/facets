import {css, CSSResult, customElement, html, TemplateResult, unsafeCSS} from 'lit-element';
import {repeat} from 'lit-html/directives/repeat';
import {DirectiveFn} from 'lit-html/lib/directive';
import {FacetBlueprint} from '../../facet-blueprint/FacetBlueprint';
import {FacetBarsValueData, kFacetVarsValueNullData} from './facet-bar-value/FacetBarsValue';
import {FacetBarsValuesSelection} from './selection/FacetBarsValuesSelection';

// @ts-ignore
import facetBarsValuesStyle from './FacetBarsValues.css';
// @ts-ignore
import facetBarsValuesSelectionStyle from './selection/FacetBarsValuesSelection.css';
// @ts-ignore
import facetBarsValueStyle from './facet-bar-value/FacetBarsValue.css';
// @ts-ignore
import buttonsStyle from '../../tools/buttons.css';

export interface FacetBarsValuesData { [key: number]: FacetBarsValueData | null }
export interface FacetBarsValuesSubselection { [key: number]: number }

export const kFacetBarsValuesDefaultValues: FacetBarsValuesData = [null, null, null, null, null, null, null, null, null, null];
export const kFacetBarsValuesNullView: [number, number] = [null as unknown as number, null as unknown as number];
export const kFacetBarsValuesNullDomain: [number, number] = [null as unknown as number, null as unknown as number];

const kRangeValueHasChanged = (newVal: [number, number], oldVal: [number, number]): boolean => newVal[0] !== oldVal[0] || newVal[1] !== oldVal[1];

@customElement('facet-bars-values')
export class FacetBarsValues extends FacetBlueprint {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(buttonsStyle)}
            ${unsafeCSS(facetBarsValueStyle)}
            ${unsafeCSS(facetBarsValuesStyle)}
            ${unsafeCSS(facetBarsValuesSelectionStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            values: { type: Object },
            domain: { type: Array, hasChanged: kRangeValueHasChanged },
            view: { type: Array, hasChanged: kRangeValueHasChanged },
            selection: { type: Array},
            subselection: { type: Array },
            actionButtons: { type: Number, attribute: 'action-buttons' },
        };
    }

    public selection: [number, number] | null = null;
    public subselection: FacetBarsValuesSubselection | null = null;
    public actionButtons: number = 2;

    public get barAreaElement(): HTMLElement | null {
        return this.renderRoot.querySelector('.facet-bars-values-container');
    }

    private _values: FacetBarsValuesData = kFacetBarsValuesDefaultValues;
    public get values(): FacetBarsValuesData {
        return this._values;
    }
    public set values(newData: FacetBarsValuesData) {
        const oldData = this._values;
        this._values = newData;
        this.valueKeys = Object.keys(this._values).map((key: string): number => parseInt(key, 10));
        this.valueKeys.sort((a: number, b: number): number => a - b);
        this.requestUpdate('values', oldData);
    }

    private _domain: [number, number] = kFacetBarsValuesNullDomain;
    public get domain(): [number, number] {
        if (this._domain === kFacetBarsValuesNullDomain || this._domain === this.nullDomain) {
            if (this.valueKeys.length) {
                this.nullDomain[0] = this.valueKeys[0];
                this.nullDomain[1] = this.valueKeys[this.valueKeys.length - 1] + 1;
            } else {
                this.nullDomain[0] = 0;
                this.nullDomain[1] = 0;
            }
            this._domain = this.nullDomain;
        }
        return this._domain;
    }
    // @ts-ignore
    public set domain(value: [number, number] | null) {
        const oldValue = this._domain;
        if (!value || value === kFacetBarsValuesNullDomain || value === this.nullDomain) {
            this._domain = this.nullDomain;
        } else {
            this._domain = [Math.max(value[0], 0), Math.max(value[1], 0)];
        }
        this.requestUpdate('domain', oldValue);
    }

    private _view: [number, number] = kFacetBarsValuesNullView;
    public get view(): [number, number] {
        if (this._view === kFacetBarsValuesNullView || this._view === this.nullView) {
            const domain = this.domain;
            this.nullView[0] = domain[0];
            this.nullView[1] = domain[1];
            this._view = this.nullView;
        }
        return this._view;
    }
    // @ts-ignore
    public set view(value: [number, number] | null) {
        const oldValue = this._view;
        if (!value || value === kFacetBarsValuesNullView || value === this.nullView) {
            this._view = this.nullView;
        } else {
            this._view = [Math.max(value[0], 0), Math.max(value[1], 0)];
        }
        this.requestUpdate('view', oldValue);
    }

    private _activeView: [number, number] = this._view;
    private get activeView(): [number, number] {
        if (this._activeView === kFacetBarsValuesNullView) {
            if (this._activeView !== this._view) {
                return this.view;
            } else if (this.valueKeys.length) {
                return this.domain;
            }
            return [0, 0];
        }
        return this._activeView;
    }

    private readonly nullDomain: [number, number] = [0, 0];
    private readonly nullView: [number, number] = [0, 0];

    private valueKeys: number[] = Object.keys(kFacetBarsValuesDefaultValues).map((key: string): number => parseInt(key, 10));
    private viewValues: FacetBarsValuesData = {};
    private facetSelection: FacetBarsValuesSelection = new FacetBarsValuesSelection();
    private facetSelectionHandler: (evt: MouseEvent) => void = this.facetSelection.getMouseHandler(this);

    protected renderContent(): TemplateResult | void {
        const actionButtons = this.actionButtons.toString();
        const view: [number, number] = this.view;
        const values = this._values;
        const htmlTemplate: DirectiveFn = this.getValuesHTML(
            this._getViewValues(values, view),
            actionButtons,
            view[0],
        );

        this._activeView = view;
        this.viewValues = values;

        return html`
        <div class="facet-bars-values-container"
            @click="${this.facetSelectionHandler}"
            @mousedown="${this.facetSelectionHandler}"
            @mousemove="${this.facetSelectionHandler}"
            @mouseleave="${this.facetSelectionHandler}"
            @mouseup="${this.facetSelectionHandler}"
        >
            ${htmlTemplate}
            ${this.facetSelection.render(this)}
        </div>
        `;
    }

    protected getValuesHTML(
        values: (FacetBarsValueData|null)[],
        actionButtons: string,
        offset: number,
    ): DirectiveFn {
        let id = 0;

        return repeat(values, (): number => (id++) + offset, (value, i): TemplateResult => {
            const computedState = this.selection ? ((i + offset) >= this.selection[0] && (i + offset) < this.selection[1] ? 'highlighted' : 'muted') : 'normal'; // eslint-disable-line no-nested-ternary
            const subselection = this.subselection ? `${this.subselection[i + offset]}` : 'false';
            const overrideState = value === null || value.ratio === null ? 'loading' : null;

            return html`
            <facet-bars-value
                id="${i + offset}"
                facet-value-state="${overrideState !== null ? overrideState : computedState}"
                action-buttons="${actionButtons}"
                subselection="${subselection}"
                .data="${value || kFacetVarsValueNullData}">
            </facet-bars-value>`;
        });
    }

    private _getViewValues(values: FacetBarsValuesData, view: [number, number]): (FacetBarsValueData|null)[] {
        const result: (FacetBarsValueData|null)[] = [];
        for (let i = view[0], n = view[view.length - 1]; i < n; ++i) {
            if (values[i]) {
                result.push(values[i]);
            } else {
                result.push(null);
            }
        }
        return result;
    }

    private _findValueIndex(value: FacetBarsValueData): number {
        for (let i = 0, n = this.valueKeys.length; i < n; ++i) {
            if (this._values[this.valueKeys[i]] === value) {
                return this.valueKeys[i];
            }
        }
        return -1;
    }
}
