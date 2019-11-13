import {css, CSSResult, customElement, unsafeCSS, html, TemplateResult} from 'lit-element';
import {FacetHoverable} from '../facet-hoverable/FacetHoverable';

// @ts-ignore
import facetBarsValueStyle from './FacetBarsValue.css';

export interface FacetBarsValueData {
    ratio: number;
    range?: {
        min: number|string;
        max: number|string;
    };
    metadata?: any;
}

const kDefaultData: FacetBarsValueData = { ratio: 0 };

@customElement('facet-bars-value')
export class FacetBarsValue extends FacetHoverable {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(facetBarsValueStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
            transition: { type: String },
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
        };
    }

    private _data: FacetBarsValueData = kDefaultData;
    public get data(): FacetBarsValueData {
        return this._data;
    }
    public set data(newData: FacetBarsValueData) {
        const oldData = this._data;
        this._data = newData;
        this.requestUpdate('data', oldData);

        switch (this.transition) {
            case 'shrink':
            case 'grow':
                if (this.transitionValue < 1) {
                    this.transitionValue = 0;
                } else {
                    this.transitionValue = 0;
                    this.performTransition(0);
                }
                break;

            default:
                this.transitionValue = 1;
                this.style.flexGrow = '1';
                this.style.marginRight = '1px';
                break;
        }
    }

    private _transition: string = 'default';
    public get transition(): string {
        return this._transition;
    }
    public set transition(value: string) {
        const oldValue = this._transition;
        this._transition = value;
        this.requestUpdate('transition', oldValue);
        /* trigger a data update in case a transition needs to be applied */
        // this.data = this._data;
    }

    public subselection: number = NaN;

    private transitionValue: number = 1;
    private transitionStepMs: number = 0.0078125;

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

    /* unfortunately IE11 can't apply animations to `flex-grow` so it has to be done in JS */
    private performTransition(ms: number): void {
        this.transitionValue = Math.min(this.transitionValue + this.transitionStepMs * ms, 1);

        if (this.transition === 'shrink') {
            this.style.flexGrow = (1 - this.transitionValue).toFixed(2);
            this.style.marginRight = `${(1 - this.transitionValue).toFixed(2)}px`;
        } else {
            this.style.flexGrow = this.transitionValue.toFixed(2);
            this.style.marginRight = `${this.transitionValue.toFixed(2)}px`;
        }

        if (this.transitionValue < 1) {
            const time = window.performance.now();
            requestAnimationFrame((): void => {
                this.performTransition(window.performance.now() - time);
            });
        } else {
            this.dispatchEvent(new CustomEvent('transitionEnded', {
                detail: {
                    type: this.transition,
                },
            }));
        }
    }
}
