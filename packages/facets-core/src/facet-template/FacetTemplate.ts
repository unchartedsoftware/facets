/*
 *  Copyright (c) 2020 Uncharted Software Inc.
 *  http://www.uncharted.software/
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy of
 *  this software and associated documentation files (the "Software"), to deal in
 *  the Software without restriction, including without limitation the rights to
 *  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 *  of the Software, and to permit persons to whom the Software is furnished to do
 *  so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *
 */

import {LitElement, TemplateResult, html} from 'lit';
import {directive, Directive} from 'lit/directive.js';
import {MutationWrapper} from '../tools/MutationWrapper';
import { createTemplateStringsArray } from '../tools/utilities';

declare global {
    interface HTMLElementTagNameMap {
        'facet-template': FacetTemplate;
    }
}

const kSlotsKey = Symbol('FacetTemplate::Slots');
const kDataKey = Symbol('FacetTemplate::Data');

export interface TemplateComponents {
    strings: string[];
    values: (string | symbol)[];
}

class XLinkDirective extends Directive {
    render(value: string) {
        return (part: any): void => {
            if (part.element) {
                part.element.setAttributeNS('http://www.w3.org/1999/xlink', part.name, value);
            }
        };
    }
}

export class FacetTemplate extends LitElement {
    public static connectedEvent = 'facet-template-connected';
    public static disconnectedEvent = 'facet-template-disconnected';

    public static get properties(): any {
        return {
            target: {type: String},
            escapeRegex: {type: String, attribute: 'escape-regex'}
        };
    }
    public target: string = '';

    private _escapeRegex: RegExp = new RegExp('\\${(.*?)}', 'gm');
    public get escapeRegex(): string {
        return this._escapeRegex.source;
    }
    public set escapeRegex(value: string) {
        this._escapeRegex = new RegExp(value, 'gm');
    }

    private _host: LitElement|null = null;
    public get host(): LitElement|null {
        return this._host;
    }
    public set host(value: LitElement|null) {
        this._host = value;
    }

    private readonly slots: TemplateComponents[];

    private templateAttributes: Map<string, string | null>;
    private xlinkAttributes: Map<symbol, TemplateComponents>;
    private customAttributesNames: Map<string, symbol>;
    private customAttributesKeys: Map<symbol, string>;
    private tagComponents: TemplateComponents;
    private mutationObserver: MutationWrapper;
    private xlinkDirective = directive(XLinkDirective);

    public constructor() {
        super();
        this.slots = [];
        this.templateAttributes = new Map<string, string | null>();
        this.xlinkAttributes = new Map<symbol, TemplateComponents>();
        this.customAttributesNames = new Map<string, symbol>();
        this.customAttributesKeys = new Map<symbol, string>();
        this.tagComponents = {
            strings: [],
            values: []
        };
        this.mutationObserver = new MutationWrapper(this as unknown as Element, false);
        this.mutationObserver.nodesAdded = this._processAddedNodes.bind(this);
    }

    public generateTemplate(data: any, customAttributes: {[key: string]: any} = {}): TemplateResult {
        return this._getHTML(data, this.tagComponents, customAttributes);
    }

    public addCustomAttribute(name: string): void {
        if (!this.customAttributesNames.has(name)) {
            const key = Symbol(`FacetTemplate::CustomAttribute::${this.target}::${name}`);
            this.customAttributesNames.set(name, key);
            this.customAttributesKeys.set(key, name);
            this.tagComponents = {
                strings: [],
                values: []
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
                values: []
            };
            this._initializeTemplateTag();
        }
    }

    public async connectedCallback(): Promise<void> {
        super.connectedCallback();

        await new Promise(requestAnimationFrame);

        this._initializeTemplateTag();

        this.mutationObserver.start();
        this._processAddedNodes(this.childNodes);

        const parent = this.parentElement;
        if (parent) {
            // stupid IE11...
            const dispatchEvent = (): void => {
                parent.dispatchEvent(new CustomEvent(FacetTemplate.connectedEvent, {
                    bubbles: true,
                    detail: {
                        template: this
                    }
                }));
            };
            if ((window as any).ShadyDOM && (window as any).ShadyDOM.inUse) {
                requestAnimationFrame(dispatchEvent);
            } else {
                dispatchEvent();
            }
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
                    plugin: this
                }
            }));
        }
    }

    protected override createRenderRoot(): HTMLElement {
        return this;
    }

    private _initializeTemplateTag(): void {
        const attributes = this.attributes;
        for (let i = 0, n = attributes.length; i < n; ++i) {
            if (attributes[i].nodeName !== 'target' && attributes[i].nodeName !== 'escape-regex') {
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
            values: []
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
                    values: []
                };

                const slotHTML = child.outerHTML.replace(
                    /\stemplate-(.*?\s?)=/gm,
                    (match: string, inner: string): string => ` ${inner}=`
                ).replace(
                    /(<\/?)template-(.*?)>/gm,
                    (match: string, open: string, inner: string): string => `${open}${inner}>`
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
        return this._processXlinkAttributes(rawHTML, components);
    }

    private _processXlinkAttributes(rawHTML: string, components: TemplateComponents): TemplateComponents {
        const parts = rawHTML.split(/xlink:href="(.*?)"/gm);
        for (let i = 0, n = parts.length; i < n; ++i) {
            if (i % 2) {
                components.strings[components.strings.length - 1] += 'xlink:href="';
                parts[i + 1] = `"${parts[i + 1]}`;
                const xlinkComponents = this._processEscapedValues(parts[i], { strings: [], values: [] });
                const key = Symbol(`FacetTemplate::XlinkAttribute::${this.target}::${parts[i]}`);
                this.xlinkAttributes.set(key, xlinkComponents);
                components.values.push(key);
            } else {
                this._processEscapedValues(parts[i], components);
            }
        }
        return components;
    }

    private _processEscapedValues(rawHTML: string, components: TemplateComponents): TemplateComponents {
        const parts = rawHTML.split(this._escapeRegex);
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
                } else if (this.xlinkAttributes.has(key)) {
                    values.push(this._getXlinkValue(this.xlinkAttributes.get(key) as TemplateComponents, data));
                } else if (
                    this.customAttributesKeys.has(key) &&
                    Object.prototype.hasOwnProperty.call(customAttributes, this.customAttributesKeys.get(key) as string)
                ) {
                    values.push(customAttributes[this.customAttributesKeys.get(key) as string]);
                } else {
                    values.push('');
                }
            } else {
                values.push(this._getEscapedValue(data, components.values[i]));
            }
        }
        return html(createTemplateStringsArray(components.strings), ...values);
    }

    private _getSlotsHTML(data: any): TemplateResult[] {
        const slots: TemplateResult[] = [];
        for (let i = 0, n = this.slots.length; i < n; ++i) {
            slots.push(this._getHTML(data, this.slots[i], {}));
        }
        return slots;
    }

    private _getXlinkValue(components: TemplateComponents, data: any): any {
        let value = '';
        for (let i = 0, n = components.strings.length; i < n; ++i) {
            value += components.strings[i];
            if (i < components.values.length) {
                value += this._getEscapedValue(data, components.values[i]);
            }
        }
        return this.xlinkDirective(value);
    }

    private _getEscapedValue(data: any, key: string | symbol): any {
        const valueStr = key as string;
        const funcCall = valueStr.split(/\((.*?)\)/g, 2);
        let result = this._readValueFromRoute(funcCall[0], data);
        if (funcCall.length === 2 && typeof result === 'function') {
            // it's important to pass `null` as `this` to avoid leaking data when possible so disable es-lint
            if (funcCall[1]) {
                result = result.call(null, this._readValueFromRoute(funcCall[1], data));
            } else {
                result = result.call(null);
            }
        }
        return result;
    }

    private _readValueFromRoute(route: string, data: any): any {
        const components = route.split('.');
        let value = data;
        for (let i = 0, n = components.length; i < n; ++i) {
            value = value[components[i]];
        }
        return value;
    }
}

// Register the custom element if it hasn't been registered yet
if (!customElements.get('facet-template')) {
    customElements.define('facet-template', FacetTemplate);
}
