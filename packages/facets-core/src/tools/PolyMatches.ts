const kPolyMatches =
    Element.prototype.matches ||
    (Element.prototype as any).msMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    ((): void => {
        throw new Error('Browsers without a native implementation of `Element.prototype.matches` are not supported')
    })();

export function polyMatches(target: Element, selector: string): boolean {
    return kPolyMatches.call(target, selector);
}
