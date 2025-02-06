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

// @ts-ignore
import blueprintHTML from './facet-blueprint/example.html?raw';
// @ts-ignore
import blueprintCSS from './facet-blueprint/style.css?raw';
// @ts-ignore
import blueprintJS from './facet-blueprint/source.example?raw';

// @ts-ignore
import termHTML from './facet-terms/example.html?raw';
// @ts-ignore
import termCSS from './facet-terms/style.css?raw';
// @ts-ignore
import termJS from './facet-terms/source.example?raw';

// @ts-ignore
import barsHTML from './facet-bars/example.html?raw';
// @ts-ignore
import barsCSS from './facet-bars/style.css?raw';
// @ts-ignore
import barsJS from './facet-bars/source.example?raw';

// @ts-ignore
import timelineHTML from './facet-timeline/example.html?raw';
// @ts-ignore
import timelineCSS from './facet-timeline/style.css?raw';
// @ts-ignore
import timelineJS from './facet-timeline/source.example?raw';

// @ts-ignore
import listHTML from './facet-list/example.html?raw';
// @ts-ignore
import listCSS from './facet-list/style.css?raw';
// @ts-ignore
import listJS from './facet-list/source.example?raw';

// @ts-ignore
import templateHTML from './facet-template/example.html?raw';
// @ts-ignore
import templateCSS from './facet-template/style.css?raw';
// @ts-ignore
import templateJS from './facet-template/source.example?raw';

// @ts-ignore
import pluginHTML from './facet-plugin/example.html?raw';
// @ts-ignore
import pluginCSS from './facet-plugin/style.css?raw';
// @ts-ignore
import pluginJS from './facet-plugin/source.example?raw';

// @ts-ignore
import buildHTML from './build-a-facet/example.html?raw';
// @ts-ignore
import buildCSS from './build-a-facet/style.css?raw';
// @ts-ignore
import buildJS from './build-a-facet/source.example?raw';

export const examples: Record<string, any> = {
    'facet-blueprint': {
        html: blueprintHTML,
        css: blueprintCSS,
        js: blueprintJS
    },
    'facet-terms': {
        html: termHTML,
        css: termCSS,
        js: termJS
    },
    'facet-bars': {
        html: barsHTML,
        css: barsCSS,
        js: barsJS
    },
    'facet-timeline': {
        html: timelineHTML,
        css: timelineCSS,
        js: timelineJS
    },
    'facet-list': {
        html: listHTML,
        css: listCSS,
        js: listJS
    },
    'facet-template': {
        html: templateHTML,
        css: templateCSS,
        js: templateJS
    },
    'facet-plugin': {
        html: pluginHTML,
        css: pluginCSS,
        js: pluginJS
    },
    'build-a-facet': {
        html: buildHTML,
        css: buildCSS,
        js: buildJS
    }
};
