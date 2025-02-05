/*
 *  Copyright (c) 2025 Uncharted Software Inc.
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

/**
 * LIT's html template string function now requires TemplateStringsArray as input. When the facets library was originally written this was not necessary.
 * A proper solution would be to refactor the facets library to use TemplateStringArrays rather than string arrays (string[]) but that would require a lot
 * of work. Instead this function converts a string array into a TemplateStringsArray that is acceptable to the LIT html template string function.
 * @param strings HTML string pieces
 * @returns a TemplateStringArray made from the HTML
 */
export const createTemplateStringsArray = (strings: string[]): TemplateStringsArray => {
    // TemplateStringsArrays are immutable objects so their contents must be frozen.
    return Object.freeze(Object.assign([...strings], { raw: Object.freeze([...strings]) })) as TemplateStringsArray;
}
