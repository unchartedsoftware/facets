import {CSSResult, customElement, LitElement, TemplateResult} from 'lit-element';
import {CSSOptions} from '@uncharted.software/css-options';

@customElement('facet-element')
export class FacetElement extends LitElement {
    protected mOptions: CSSOptions;

    public static get styles(): CSSResult[] {
        return [];
    }

    protected static getSuperStyles(): CSSResult[] {
        const proto = Object.getPrototypeOf(this);
        const desc = Object.getOwnPropertyDescriptor(proto, 'styles');
        return desc && desc.get ? desc.get.call(proto) : [];
    }

    public constructor() {
        super();
        this.mOptions = new CSSOptions(this);
    }

    public get options(): CSSOptions {
        return this.mOptions;
    }

    protected computeStyle(): TemplateResult | void {
        return undefined;
    }

    protected createRenderRoot(): Element | ShadowRoot {
        const useShadowDOM = this.getAttribute('use-shadow-dom');
        if (useShadowDOM && useShadowDOM.toLowerCase() === 'false') {
            return this;
        }
        return super.createRenderRoot();
    }
}
