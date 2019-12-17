import {FacetContainer} from '../facet-container/FacetContainer';
import {FacetTemplate} from '../facet-template/FacetTemplate';
import {FacetTermsValueData} from '../facet-terms-value/FacetTermsValue';
import {css, CSSResult, customElement, html, TemplateResult, unsafeCSS} from 'lit-element';
import {repeat} from 'lit-element/node_modules/lit-html/directives/repeat';
import {preHTML} from '../tools/preHTML';
import {polyMatches} from '../tools/PolyMatches';

// @ts-ignore
import facetTermsStyle from './FacetTerms.css';

export interface FacetTermsValueDataTyped extends FacetTermsValueData {
    type?: string;
}

export interface FacetTermsSelection {
    [key: number]: boolean;
}

export interface FacetTermsSubselection {
    [key: number]: number;
}

export interface FacetTermsData {
    values: { [key: number]: FacetTermsValueDataTyped };
    label?: string;
    metadata?: any;
}

const kDefaultData = {values: []};

@customElement('facet-terms')
export class FacetTerms extends FacetContainer {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(facetTermsStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: {type: Object},
            selection: {type: Object},
            subselection: {type: Object},
            actionButtons: {type: Number, attribute: 'action-buttons'},
        };
    }

    public selection: FacetTermsSelection | null = null;
    public subselection: FacetTermsSubselection | null = null;

    private _data: FacetTermsData = kDefaultData;
    public get data(): FacetTermsData {
        return this._data;
    }
    // @ts-ignore
    public set data(value: FacetTermsData | null) {
        const oldValue = this._data;
        if (!value || value === kDefaultData) {
            this._data = kDefaultData;
            this.valueKeys = [];
        } else {
            this._data = value;
            this.valueKeys = Object.keys(this._data.values).map((key: string): number => parseInt(key, 10));
        }
        this.requestUpdate('data', oldValue);
    }

    private _hover: boolean = false;
    public get hover(): boolean {
        return this._hover;
    }
    public set hover(value: boolean) {
        const oldValue = this._hover;
        this._hover = value;
        this.requestUpdate('hover', oldValue);
    }

    private valueKeys: number[] = [];

    protected setTemplateForTarget(target: string, template: FacetTemplate): void {
        super.setTemplateForTarget(target, template);
        template.addCustomAttribute('id');
        template.addCustomAttribute('state');
        template.addCustomAttribute('contrast');
        template.addCustomAttribute('.subselection');
        template.addCustomAttribute('@click');
    }

    protected renderHeaderLabel(): TemplateResult | void {
        return html`<span>${this.data.label}</span>`;
    }

    protected renderContent(): TemplateResult | void {
        const contrast = this.hover;
        const keyFunction = (key: number): number => key;
        const htmlFunction = (key: number): TemplateResult | void => {
            const value = this._data.values[key];
            if (value) {
                const type = value.type || 'facet-terms-value';
                const state = this.selection ? this.selection[key] && 'highlighted' || 'muted' : 'normal';
                const subselection = this.subselection && this.subselection.hasOwnProperty(key) ? this.subselection[key] : null;
                const template = this.templates.get(type);
                if (template) {
                    return template.getHTML(value, {
                        'id': key,
                        'state': state,
                        'contrast': contrast,
                        '.subselection': subselection,
                        '@click': this.handleMouseClickEvent,
                    });
                } else if (type === 'facet-terms-value') {
                    return html`
                    <facet-terms-value
                        id="${key}"
                        state="${state}"
                        contrast="${contrast}"
                        .subselection="${subselection}"
                        .data="${value}"
                        @click="${this.handleMouseClickEvent}">
                    </facet-terms-value>`;
                }
                return preHTML`
                <${type}
                    id="${key}"
                    state="${state}"
                    contrast="${contrast}"
                    .subselection="${subselection}"
                    .data="${value}"
                    @click="${this.handleMouseClickEvent}">
                </${type}>`;
            }
            return undefined;
        };
        return html`
        <div class="facet-terms-container" @mouseenter="${this.handleMouseHoverEvent}" @mouseleave="${this.handleMouseHoverEvent}">
            ${repeat(this.valueKeys, keyFunction, htmlFunction)}
        </div>
        `;
    }

    private handleMouseHoverEvent(event: MouseEvent): void {
        if (event.target instanceof Element) {
            this.hover = polyMatches(event.target, ':hover');
        }
    }

    private handleMouseClickEvent(event: MouseEvent): void {
        if (event.currentTarget instanceof Element) {
            const id = parseInt(event.currentTarget.getAttribute('id') || '', 10);
            if (!isNaN(id)) {
                if (this.selection && this.selection[id]) {
                    this.selection = null;
                } else {
                    this.selection = { [id]: true };
                }
            }
        }
    }
}
