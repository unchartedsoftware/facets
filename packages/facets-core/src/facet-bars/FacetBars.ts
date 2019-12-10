import {customElement, TemplateResult, html, CSSResult, css, unsafeCSS} from 'lit-element';
import {FacetContainer} from '../facet-container/FacetContainer';
import {
    FacetBarsValuesData, FacetBarsValuesSubselection,
    kFacetBarsValuesDefaultValues,
    kFacetBarsValuesNullDomain,
    kFacetBarsValuesNullView,
} from './facet-bars-values/FacetBarsValues';

// @ts-ignore
import facetBarsStyle from './FacetBars.css';

export interface FacetBarsData {
    values: FacetBarsValuesData;
    label?: string;
    metadata?: any;
}

const kDefaultData: FacetBarsData = { values: kFacetBarsValuesDefaultValues };
const kFWPropertiesKey = Symbol('FacetBars::PropertiesKey');

@customElement('facet-bars')
export class FacetBars extends FacetContainer {
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
            domain: { type: Array },
            view: { type: Array },
            selection: { type: Array},
            subselection: { type: Object },
            actionButtons: { type: Number, attribute: 'action-buttons' },
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
        this.requestUpdate('data', oldValue);
    }

    public get domain(): [number, number] {
        return this._forwardGetProperty('#facet-bars-values-imp', 'domain');
    }
    public set domain(value: [number, number]) {
        this._forwardSetProperty('#facet-bars-values-imp', 'domain', value);
    }

    public get view(): [number, number] {
        return this._forwardGetProperty('#facet-bars-values-imp', 'view');
    }
    public set view(value: [number, number]) {
        this._forwardSetProperty('#facet-bars-values-imp', 'view', value);
    }

    public get selection(): [number, number] | null {
        return this._forwardGetProperty('#facet-bars-values-imp', 'selection');
    }
    public set selection(value: [number, number] | null) {
        this._forwardSetProperty('#facet-bars-values-imp', 'selection', value);
    }

    public get subselection(): FacetBarsValuesSubselection | null {
        return this._forwardGetProperty('#facet-bars-values-imp', 'subselection');
    }
    public set subselection(value: FacetBarsValuesSubselection | null) {
        this._forwardSetProperty('#facet-bars-values-imp', 'subselection', value);
    }

    public get actionButtons(): number {
        return this._forwardGetProperty('#facet-bars-values-imp', 'actionButtons');
    }
    public set actionButtons(value: number) {
        this._forwardSetProperty('#facet-bars-values-imp', 'actionButtons', value);
    }

    public get values(): FacetBarsValuesData {
        return this.data.values;
    }

    public get barAreaElement(): HTMLElement | null {
        return this.renderRoot.querySelector('.facet-bars-values');
    }

    private [kFWPropertiesKey]: {[key: string]: unknown};

    public constructor() {
        super();
        this[kFWPropertiesKey] = {
            domain: kFacetBarsValuesNullDomain,
            view: kFacetBarsValuesNullView,
            selection: null,
            subselection: null,
            actionButtons: 2,
        };
    }

    public connectedCallback(): void {
        super.connectedCallback();

        const labels = this.createSlottedElement('labels', 'facet-bars-labels');
        if (labels) {
            labels.setAttribute('id', 'facet-bars-labels');
        }
    }

    protected renderHeaderLabel(): TemplateResult | void {
        return html`<span class="facet-bars-header-label">${this.data.label}</span>`;
    }

    protected renderContent(): TemplateResult | void {
        return html`
        <div class="facet-bars-container">
            <div class="facet-bars-hover-tab"></div>
            <div class="facet-bars-content">
                <div class="facet-bars-values">
                    <facet-bars-values
                        id="facet-bars-values-imp"
                        .values="${this.data.values}"
                        .domain="${this.domain}"
                        .view="${this.view}"
                        .selection="${this.selection}"
                        .subselection="${this.subselection}"
                        .actionButtons="${this.actionButtons}"
                        @facet-element-updated="${this._handleUpdatedEvent}"
                    ></facet-bars-values>
                </div>
                <div class="facet-bars-labels"><slot name="labels"></slot></div>
            </div>
        </div>
        `;
    }

    protected renderFooter(): TemplateResult | void {
        return html`
        <div style="height: 16px"></div>
        `;
    }

    private _forwardGetProperty<T>(selector: string, prop: string): T {
        const element = this.renderRoot.querySelector(selector);
        if (element) {
            return (element as any)[prop];
        }
        return this[kFWPropertiesKey][prop] as T;
    }

    private _forwardSetProperty<T>(selector: string, prop: string, value: T): void {
        const element = this.renderRoot.querySelector(selector);
        if (element) {
            (element as any)[prop] = value;
        }
        this[kFWPropertiesKey][prop] = value;
    }

    private _handleUpdatedEvent(event: CustomEvent): void {
        if (event.detail.changedProperties) {
            event.detail.changedProperties.forEach((value: unknown, key: string): void => {
                if (FacetBars.properties.hasOwnProperty(key)) {
                    requestAnimationFrame((): void => {
                        this.requestUpdate(key, value);
                    });
                }
            });
        }
    }
}
