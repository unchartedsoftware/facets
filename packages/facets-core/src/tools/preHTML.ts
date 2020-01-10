import {html, TemplateResult} from 'lit-element';

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
// example: <${'div'}>${'this is example'}</${'div'}> => <div>${'this is example'}</div>
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
                    cachedStrings[i].strings as any,
                    ...dropIndices(values, needlessValues),
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
                index: i,
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
        needlessValues,
    });

    return html(newStrings as any, ...dropIndices(values, needlessValues));
}
