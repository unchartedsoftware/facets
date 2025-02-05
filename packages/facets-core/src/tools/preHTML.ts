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

import {html, TemplateResult} from 'lit';
import { createTemplateStringsArray } from './utilities';

interface CachedNeedlessValue {
    value: any;
    index: number;
}

interface CachedTemplateStrings {
    strings: string[];
    needlessValues: CachedNeedlessValue[];
}

function dropIndices(arr: any[], needlessValues: CachedNeedlessValue[]): any[] {
    const newArr = [];
    let j = 0;

    for (let i = 0, n = arr.length; i < n; ++i) {
        if (needlessValues[j].index === i) {
            ++j;
        } else {
            newArr.push(arr[i]);
        }
    }

    return newArr;
}

const templateStringsCache = new WeakMap<TemplateStringsArray, CachedTemplateStrings[]>();

// Convert dynamic tags to template strings
// example: <${'div'}>${'this is an example'}</${'div'}> => <div>${'this is an example'}</div>
export function preHTML(strings: TemplateStringsArray, ...values: any[]): TemplateResult {
    // check cache !important return equal link at first argument
    let cachedStrings = templateStringsCache.get(strings) as CachedTemplateStrings[];
    if (cachedStrings) {
        for (let i = 0, n = cachedStrings.length; i < n; ++i) {
            const needlessValues = cachedStrings[i].needlessValues;
            let isSame = true;
            for (let ii = 0, nn = needlessValues.length; ii < nn; ++ii) {
                if (values[needlessValues[ii].index] !== needlessValues[ii].value) {
                    isSame = false;
                    break;
                }
            }

            if (isSame) {
                return html(
                    createTemplateStringsArray(cachedStrings[i].strings),
                    ...dropIndices(values, needlessValues)
                );
            }
        }
    }

    const needlessValues: CachedNeedlessValue[] = [];
    const newStrings: string[] = [];

    let str: string;
    for (let i = 0, n = strings.length; i < n; ++i) {
        str = strings[i];

        while (
            str[str.length - 1] === '<' // open tag
            || (str[str.length - 2] === '<' && str[str.length - 1] === '/') // close tag
        ) {
            needlessValues.push({
                value: values[i],
                index: i
            });
            str += values[i] + strings[++i];
        }

        newStrings.push(str);
    }

    if (!cachedStrings) {
        cachedStrings = [];
        templateStringsCache.set(strings, cachedStrings);
    }

    cachedStrings.push({
        strings: newStrings,
        needlessValues
    });

    return html(createTemplateStringsArray(newStrings), ...dropIndices(values, needlessValues));
}
