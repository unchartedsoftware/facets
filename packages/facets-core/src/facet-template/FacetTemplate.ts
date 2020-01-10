import {customElement, LitElement, TemplateResult, html} from 'lit-element';
import {MutationWrapper} from '../tools/MutationWrapper';

const kSlotsKey = Symbol('FacetTemplate::Slots');
const kDataKey = Symbol('FacetTemplate::Data');

export interface TemplateComponents {
    strings: string[];
    values: (string | symbol)[];
}

@customElement('facet-template')
export class FacetTemplate extends LitElement {
    public static connectedEvent = 'facet-template-connected';
    public static disconnectedEvent = 'facet-template-disconnected';

    public static get properties(): any {
        return {
            target: {type: String},
        };
    }
    public target: string = '';

    private _host: LitElement|null = null;
    public get host(): LitElement|null {
        return this._host;
    }
    public set host(value: LitElement|null) {
        this._host = value;
    }

    private readonly slots: TemplateComponents[];

    private templateAttributes: Map<string, string | null>;
    private customAttributesNames: Map<string, symbol>;
    private customAttributesKeys: Map<symbol, string>;
    private tagComponents: TemplateComponents;
    private mutationObserver: MutationWrapper;

    public constructor() {
        super();
        this.slots = [];
        this.templateAttributes = new Map<string, string | null>();
        this.customAttributesNames = new Map<string, symbol>();
        this.customAttributesKeys = new Map<symbol, string>();
        this.tagComponents = {
            strings: [],
            values: [],
        };
        this.mutationObserver = new MutationWrapper(this, false);
        this.mutationObserver.nodesAdded = this._processAddedNodes.bind(this);
    }

    public getHTML(data: any, customAttributes: {[key: string]: any} = {}): TemplateResult {
        return this._getHTML(data, this.tagComponents, customAttributes);
    }

    public addCustomAttribute(name: string): void {
        if (!this.customAttributesNames.has(name)) {
            const key = Symbol(`FacetTemplate::CustomAttribute::${this.target}::${name}`);
            this.customAttributesNames.set(name, key);
            this.customAttributesKeys.set(key, name);
            this.tagComponents = {
                strings: [],
                values: [],
            };
            this._initializeTemplateTag();
        }
    }

    public deleteCustomAttribute(name: string): void {
        if (this.customAttributesNames.has(name)) {
            this.customAttributesKeys.delete(this.customAttributesNames.get(name) as symbol);
            this.customAttributesNames.delete(name);
            this.tagComponents = {
                strings: [],
                values: [],
            };
            this._initializeTemplateTag();
        }
    }

    public connectedCallback(): void {
        super.connectedCallback();

        this._initializeTemplateTag();

        this.mutationObserver.start();
        this._processAddedNodes(this.childNodes);

        // stupid IE11...
        const parent = this.parentElement;
        if (parent) {
            requestAnimationFrame((): void => {
                parent.dispatchEvent(new CustomEvent(FacetTemplate.connectedEvent, {
                    bubbles: true,
                    detail: {
                        template: this,
                    },
                }));
            });
        }
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this.mutationObserver.stop();

        this.slots.length = 0;

        if (this.host) {
            this.host.dispatchEvent(new CustomEvent(FacetTemplate.disconnectedEvent, {
                bubbles: true,
                detail: {
                    plugin: this,
                },
            }));
        }
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    private _initializeTemplateTag(): void {
        const attributes = this.attributes;
        for (let i = 0, n = attributes.length; i < n; ++i) {
            if (attributes[i].nodeName !== 'target') {
                this.templateAttributes.set(attributes[i].nodeName, attributes[i].nodeValue);
            }
        }

        const type = this.target.split('#')[0];
        const tagHTML = `<${type}${this.templateAttributes.size ? ` ${((): string => {
            const result: string[] = [];
            this.templateAttributes.forEach(
                (value, key): number => result.push(
                    `${key.replace(/template-(.*?)/gm, '')}="${value}"`
                )
            );
            return result.join(' ');
        })()}` : ''}`;

        this.tagComponents = {
            strings: [],
            values: [],
        };

        this._processHtmlParts(tagHTML, this.tagComponents);

        /* the data should always be appended at the end of the attributes :/ */
        let appended = false;
        for (const entry of this.customAttributesNames) {
            if (!appended) {
                appended = true;
                this.tagComponents.strings[this.tagComponents.strings.length - 1] += ` ${entry[0]}="`;
            } else {
                this.tagComponents.strings.push(`" ${entry[0]}="`);
            }
            this.tagComponents.values.push(entry[1]);
        }

        if (!appended) {
            this.tagComponents.strings[this.tagComponents.strings.length - 1] += ' .data="';
        } else {
            this.tagComponents.strings.push('" .data="');
        }
        this.tagComponents.values.push(kDataKey);

        this.tagComponents.strings.push('">');
        this.tagComponents.values.push(kSlotsKey);
        this.tagComponents.strings.push(`</${type}>`);
    }

    private _processAddedNodes(nodes: NodeList): void {
        for (let i = 0, n = nodes.length; i < n; ++i) {
            if (nodes[i] instanceof HTMLElement) {
                const child = nodes[i] as HTMLElement;
                const slotComponents: TemplateComponents = {
                    strings: [],
                    values: [],
                };

                const slotHTML = child.outerHTML.replace(
                    /template-(.*?):/gm,
                    (match: string, inner: string): string => `${inner}:`
                );
                if (child.tagName.toLowerCase() === 'facet-template') {
                    slotComponents.strings.push(slotHTML);
                } else {
                    this._processHtmlParts(slotHTML, slotComponents);
                }
                this.slots.push(slotComponents);

                if (this.parentNode instanceof LitElement) {
                    this.parentNode.requestUpdate();
                }
            }
        }
    }

    private _processHtmlParts(rawHTML: string, components: TemplateComponents): TemplateComponents {
        const parts = rawHTML.split(/\${(.*?)}/gm);
        for (let i = 0, n = parts.length; i < n; ++i) {
            if (i % 2) {
                components.values.push(parts[i]);
            } else {
                components.strings.push(parts[i]);
            }
        }
        return components;
    }

    private _getHTML(data: any, components: TemplateComponents, customAttributes: {[key: string]: any}): TemplateResult {
        const values: any[] = [];
        for (let i = 0, n = components.values.length; i < n; ++i) {
            if (typeof components.values[i] === 'symbol') {
                const key = components.values[i] as symbol;
                if (key === kDataKey) {
                    values.push(data);
                } else if (key === kSlotsKey) {
                    values.push(this._getSlotsHTML(data));
                } else if (
                    this.customAttributesKeys.has(key) &&
                    customAttributes.hasOwnProperty(this.customAttributesKeys.get(key) as string)
                ) {
                    values.push(customAttributes[this.customAttributesKeys.get(key) as string]);
                } else {
                    values.push('');
                }
            } else {
                values.push(this._readData(data, components.values[i]));
            }
        }
        return html(components.strings as any, ...values);
    }

    private _getSlotsHTML(data: any): TemplateResult[] {
        const slots: TemplateResult[] = [];
        for (let i = 0, n = this.slots.length; i < n; ++i) {
            slots.push(this._getHTML(data, this.slots[i], {}));
        }
        return slots;
    }

    private _readData(data: any, key: string | symbol): any {
        const route = (key as string).split('.');
        let value = data;
        for (let i = 0, n = route.length; i < n; ++i) {
            value = value[route[i]];
        }
        return value;
    }
}
