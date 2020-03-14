import {css, CSSResult, customElement, html, TemplateResult, unsafeCSS} from 'lit-element';
import {FacetBlueprint} from '../facet-blueprint/FacetBlueprint';
import {renderButtons} from '../tools/buttons';
// @ts-ignore
import buttonsStyle from '../tools/buttons.css';

// @ts-ignore
import FacetBarsValueStyle from './FacetBarsValue.css';
// @ts-ignore
import FacetBarsValueDefaultTheme from './FacetBarsValue.default.css';
// @ts-ignore
import FacetBarsValueTimelineTheme from './FacetBarsValue.timeline.css';

function getBarColorStyle(theme: string, state: string, index: number, value: string): string {
    return `:host(${theme}[facet-value-state="${state}"]) .facet-bars-value-background .facet-bars-value-bar-${index} { background-color:${value} }`;
}

const kBarStylePrefix = 'facet-bars-';
const kBarStyleGenerators: {[key: string]: any} = {
    '-normal': (theme: string, index: number, value: string): string => getBarColorStyle(theme, 'normal', index, value),
    '-normal-contrast': (value: string): TemplateResult => html`${value}`,
    '-normal-contrast-hover': (value: string): TemplateResult => html`${value}`,
    '-selected': (value: string): TemplateResult => html`${value}`,
    '-selected-contrast': (value: string): TemplateResult => html`${value}`,
    '-selected-contrast-hover': (value: string): TemplateResult => html`${value}`,
    '-unselected': (value: string): TemplateResult => html`${value}`,
    '-unselected-contrast': (value: string): TemplateResult => html`${value}`,
    '-unselected-contrast-hover': (value: string): TemplateResult => html`${value}`,
    '-muted': (value: string): TemplateResult => html`${value}`,
    '-muted-contrast': (value: string): TemplateResult => html`${value}`,
    '-muted-contrast-hover': (value: string): TemplateResult => html`${value}`,
};
const kBarStyleSuffixes = Object.keys(kBarStyleGenerators);

export interface FacetBarsValueData {
    ratio: number | null;
    label?: string | string[];
    metadata?: any;
}

export const kFacetVarsValueNullData: FacetBarsValueData = { ratio: 0 };

@customElement('facet-bars-value')
export class FacetBarsValue extends FacetBlueprint {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(buttonsStyle)}
            ${unsafeCSS(FacetBarsValueStyle)}
            ${unsafeCSS(FacetBarsValueDefaultTheme)}
            ${unsafeCSS(FacetBarsValueTimelineTheme)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
            values: {
                type: Array,
                converter: {
                    fromAttribute: (value: string): number[] => {
                        if (!value) {
                            return [];
                        }
                        const arr = JSON.parse(value);
                        for (let i = 0, n = arr.length; i < n; ++i) {
                            arr[i] = parseFloat(arr[i]);
                        }
                        return arr;
                    },
                    toAttribute: (value: number): string => `[${value.toString()}]`,
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

    public values: number[] = [];
    public actionButtons: number = 2;
    private barStyles: TemplateResult|void|null = null;

    protected renderContent(): TemplateResult | void {
        return html`
        <div class="facet-bars-value-background">
            ${this.renderBars()}
        </div>
        <div class="facet-hoverable-buttons"><slot name="buttons">
            ${renderButtons(this)}
        </slot></div>
        `;
    }

    protected renderBars(): TemplateResult[] {
        const result = [];
        for (let i = 0, n = this.values.length; i < n; ++i) {
            const value = this.values[i];
            if (!isNaN(value)) {
                const height = Math.round(Math.max(Math.min(value, 1), 0) * 100);
                result.push(html`
                <div class="facet-bars-value-bar-${n - i - 1}" style="height: ${height}%"></div>
                `);
            }
        }
        return result;
    }

    protected computeStyle(): TemplateResult | void {
        if (this.barStyles === null) {
            const theme = this.getAttribute('theme');
            const hostTheme = theme ? `[theme="${theme}"]` : ':not([theme])';

            const cssOptions = this.cssOptions;
            const styles = [];
            for (let i = 0, n = this.values.length; i < n; ++i) {
                for (let ii = 0, nn = kBarStyleSuffixes.length; ii < nn; ++ii) {
                    const option = `${kBarStylePrefix}${i}${kBarStyleSuffixes[ii]}`;
                    const optionValue = cssOptions.read(option);
                    if (optionValue !== undefined) {
                        styles.push(kBarStyleGenerators[kBarStyleSuffixes[ii]](hostTheme, i, optionValue));
                    }
                }
            }

            if (styles.length) {
                this.barStyles = html`<style>${styles}</style>`;
            } else {
                this.barStyles = undefined;
            }
        }
        return this.barStyles;
    }
}
