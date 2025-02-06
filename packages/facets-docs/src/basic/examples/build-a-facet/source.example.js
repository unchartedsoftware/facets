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

window.addEventListener('load', function () {
    const facetList = document.querySelector('#example');
    facetList.data = [
        {
            type: 'facet-term',
            data: {
                ratio: 0.456,
                label: 'Example Facet',
                value: 456,
            },
        },
        {
            type: 'facet-term',
            data: {
                ratio: 0.456,
                label: 'Example Facet',
                value: 456,
            },
        },
        {
            type: 'facet-term',
            data: {
                ratio: 0.456,
                label: 'Example Facet',
                value: 456,
            },
        },
    ];

    setTimeout(function () {
        facetList.data = [
            {
                type: 'facet-term',
                data: {
                    ratio: 0.123,
                    label: 'Example Facet',
                    value: 123,
                },
            },
            {
                type: 'facet-term',
                data: {
                    ratio: 0.789,
                    label: 'Example Facet',
                    value: 789,
                },
            },
            {
                type: 'facet-term',
                data: {
                    ratio: 0.345,
                    label: 'Example Facet',
                    value: 345,
                },
            },
        ];
    }, 1000);
});
