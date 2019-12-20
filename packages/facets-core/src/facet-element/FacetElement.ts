import {CSSResult, customElement, LitElement, TemplateResult} from 'lit-element';
import {CSSOptions} from '@uncharted.software/css-options';
import {FacetPlugin} from '../facet-plugin/FacetPlugin';
import {FacetTemplate} from '../facet-template/FacetTemplate';

@customElement('facet-element')
export class FacetElement extends LitElement {
    protected mOptions: CSSOptions;
    protected plugins: Set<FacetPlugin> = new Set();
    protected templates: Map<string, FacetTemplate> = new Map();

    private boundAddOnEventHandler: EventHandlerNonNull = this._addOnEventHandler.bind(this);

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

    public connectedCallback(): void {
        super.connectedCallback();
        this._setupAddOnEvents();
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this._teardownAddOnEvents();
    }

    public get options(): CSSOptions {
        return this.mOptions;
    }

    protected updated(_changedProperties: Map<PropertyKey, unknown>): void {
        super.updated(_changedProperties);
        this.dispatchEvent(new CustomEvent('facet-element-updated', {
            bubbles: false,
            detail: {
                changedProperties: _changedProperties,
            },
        }));
    }

    protected connectPlugin(plugin: FacetPlugin): void {
        if (!this.plugins.has(plugin)) {
            this.plugins.add(plugin);
            plugin.host = this;
        }
    }

    protected disconnectPlugin(plugin: FacetPlugin): void {
        if (this.plugins.has(plugin)) {
            this.plugins.delete(plugin);
            plugin.host = null;
        }
    }

    protected setTemplateForTarget(target: string, template: FacetTemplate): void {
        this.templates.set(target, template);
        template.host = this;
        this.requestUpdate();
    }

    protected deleteTemplateForTarget(target: string, template: FacetTemplate): void {
        this.templates.delete(target);
        template.host = null;
        this.requestUpdate();
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

    private _setupAddOnEvents(): void {
        this.addEventListener(FacetPlugin.connectedEvent, this.boundAddOnEventHandler);
        this.addEventListener(FacetPlugin.disconnectedEvent, this.boundAddOnEventHandler);
        this.addEventListener(FacetTemplate.connectedEvent, this.boundAddOnEventHandler);
        this.addEventListener(FacetTemplate.disconnectedEvent, this.boundAddOnEventHandler);
        if (this.renderRoot !== this) {
            this.renderRoot.addEventListener(FacetPlugin.connectedEvent, this.boundAddOnEventHandler);
            this.renderRoot.addEventListener(FacetPlugin.disconnectedEvent, this.boundAddOnEventHandler);
            this.renderRoot.addEventListener(FacetTemplate.connectedEvent, this.boundAddOnEventHandler);
            this.renderRoot.addEventListener(FacetTemplate.disconnectedEvent, this.boundAddOnEventHandler);
        }
    }

    private _teardownAddOnEvents(): void {
        this.removeEventListener(FacetPlugin.connectedEvent, this.boundAddOnEventHandler);
        this.removeEventListener(FacetPlugin.disconnectedEvent, this.boundAddOnEventHandler);
        this.removeEventListener(FacetTemplate.connectedEvent, this.boundAddOnEventHandler);
        this.removeEventListener(FacetTemplate.disconnectedEvent, this.boundAddOnEventHandler);
        if (this.renderRoot !== this) {
            this.renderRoot.removeEventListener(FacetPlugin.connectedEvent, this.boundAddOnEventHandler);
            this.renderRoot.removeEventListener(FacetPlugin.disconnectedEvent, this.boundAddOnEventHandler);
            this.renderRoot.removeEventListener(FacetTemplate.connectedEvent, this.boundAddOnEventHandler);
            this.renderRoot.removeEventListener(FacetTemplate.disconnectedEvent, this.boundAddOnEventHandler);
        }
    }

    private _addOnEventHandler(evt: Event): void {
        if (evt instanceof CustomEvent) {
            if (evt.detail.hasOwnProperty('plugin')) {
                const plugin = evt.detail.plugin;
                if (plugin instanceof FacetPlugin) {
                    if (evt.type === FacetPlugin.connectedEvent) {
                        this.connectPlugin(plugin);
                        evt.stopPropagation();
                    } else if (evt.type === FacetPlugin.disconnectedEvent) {
                        this.disconnectPlugin(plugin);
                        evt.stopPropagation();
                    }
                }
            } else if (evt.detail.hasOwnProperty('template')) {
                const template = evt.detail.template;
                if (template instanceof FacetTemplate) {
                    if (evt.type === FacetTemplate.connectedEvent) {
                        this.setTemplateForTarget(template.target, template);
                        evt.stopPropagation();
                    } else if (evt.type === FacetTemplate.disconnectedEvent) {
                        this.deleteTemplateForTarget(template.target, template);
                        evt.stopPropagation();
                    }
                }
            }
        }
    }
}
