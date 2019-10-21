import {customElement, property, LitElement, TemplateResult, html} from 'lit-element';
import {FacetBlueprint} from '../facet-blueprint/FacetBlueprint';
import {MutationWrapper} from '../tools/MutationWrapper';

const kSlotsKey = Symbol('FacetTemplate::Slots');
const kDataKey = Symbol('FacetTemplate::Data');

export interface TemplateComponents {
    strings: string[];
    values: (string | symbol)[];
}

@customElement('facet-template')
export class FacetTemplate extends LitElement {
    @property({type: String})
    public target: string = '';

    private readonly slots: TemplateComponents[];

    private templateAttributes: Map<string, string | null>;
    private tagComponents: TemplateComponents;
    private mutationObserver: MutationWrapper;

    public constructor() {
        super();
        this.slots = [];
        this.templateAttributes = new Map<string, string | null>();
        this.tagComponents = {
            strings: [],
            values: [],
        };
        this.mutationObserver = new MutationWrapper(this, false);
        this.mutationObserver.nodesAdded = this._processAddedNodes.bind(this);
    }

    public getHTML(data: any): TemplateResult {
        return this._getHTML(data, this.tagComponents);
    }

    public connectedCallback(): void {
        super.connectedCallback();

        this._initializeTemplateTag();

        this.mutationObserver.start();
        this._processAddedNodes(this.childNodes);
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this.mutationObserver.stop();
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

        this.tagComponents.values.push(kDataKey);
        this.tagComponents.values.push(kSlotsKey);

        this.tagComponents.strings[this.tagComponents.strings.length - 1] += ' .data="';
        this.tagComponents.strings.push('">');
        this.tagComponents.strings.push(`</${type}>`);
    }

    private _processAddedNodes(nodes: NodeList): void {
        for (let i = 0, n = nodes.length; i < n; ++i) {
            if (nodes[i] instanceof HTMLElement) {
                const child = nodes[i] as HTMLElement;
                if (child.hasAttribute('slot')) {
                    const slotComponents: TemplateComponents = {
                        strings: [],
                        values: [],
                    };

                    const slotHTML = child.outerHTML.replace(
                        /template-(.*?):/gm,
                        (match: string, inner: string): string => `${inner}:`
                    );
                    this._processHtmlParts(slotHTML, slotComponents);
                    this.slots.push(slotComponents);

                    if (this.parentNode instanceof FacetBlueprint) {
                        this.parentNode.requestUpdate();
                    }
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

    private _getHTML(data: any, components: TemplateComponents): TemplateResult {
        const values: any[] = [];
        for (let i = 0, n = components.values.length; i < n; ++i) {
            values.push(this._readData(data, components.values[i]));
        }
        return html(components.strings as any, ...values);
    }

    private _readData(data: any, key: string | symbol): any {
        if (key === kDataKey) {
            return data;
        } else if (key === kSlotsKey) {
            const slots: TemplateResult[] = [];
            for (let i = 0, n = this.slots.length; i < n; ++i) {
                slots.push(this._getHTML(data, this.slots[i]));
            }
            return slots;
        }

        const route = (key as string).split('.');
        let value = data;
        for (let i = 0, n = route.length; i < n; ++i) {
            value = value[route[i]];
        }
        return value;
    }
}
