import {CSSResult, customElement, LitElement, TemplateResult} from 'lit-element';
import {CSSOptions} from '@uncharted.software/css-options';
import {FacetPlugin} from '../facet-plugin/FacetPlugin';

@customElement('facet-element')
export class FacetElement extends LitElement {
    protected mOptions: CSSOptions;
    protected plugins: Set<FacetPlugin> = new Set();

    private boundPluginEventHandler: EventHandlerNonNull = this._pluginEventHandler.bind(this);

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
        this._setupPluginEvents();
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this._teardownPluginEvents();
    }

    public get options(): CSSOptions {
        return this.mOptions;
    }

    protected updated(_changedProperties: Map<PropertyKey, unknown>): void {
        this.dispatchEvent(new CustomEvent('facet-element-updated', {
            bubbles: false,
            detail: {
                changedProperties: _changedProperties,
            },
        }));
        super.updated(_changedProperties);
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

    private _setupPluginEvents(): void {
        this.addEventListener(FacetPlugin.connectedEvent, this.boundPluginEventHandler);
        this.addEventListener(FacetPlugin.disconnectedEvent, this.boundPluginEventHandler);
        if (this.renderRoot !== this) {
            this.renderRoot.addEventListener(FacetPlugin.connectedEvent, this.boundPluginEventHandler);
            this.renderRoot.addEventListener(FacetPlugin.disconnectedEvent, this.boundPluginEventHandler);
        }
    }

    private _teardownPluginEvents(): void {
        this.removeEventListener(FacetPlugin.connectedEvent, this.boundPluginEventHandler);
        this.removeEventListener(FacetPlugin.disconnectedEvent, this.boundPluginEventHandler);
        if (this.renderRoot !== this) {
            this.renderRoot.removeEventListener(FacetPlugin.connectedEvent, this.boundPluginEventHandler);
            this.renderRoot.removeEventListener(FacetPlugin.disconnectedEvent, this.boundPluginEventHandler);
        }
    }

    private _pluginEventHandler(evt: Event): void {
        if (evt instanceof CustomEvent) {
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
        }
    }
}
