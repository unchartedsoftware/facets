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
        {
            type: 'facet-histogram',
            data: {
                values: [
                    {ratio: 0.1, labels: {left: 0, right: 1}},
                    {ratio: 0.2, labels: {left: 1, right: 2}},
                    {ratio: 0.3, labels: {left: 2, right: 3}},
                    {ratio: 0.4, labels: {left: 3, right: 4}},
                    {ratio: 0.5, labels: {left: 4, right: 5}},
                    {ratio: 0.6, labels: {left: 5, right: 6}},
                    {ratio: 0.7, labels: {left: 6, right: 7}},
                    {ratio: 0.8, labels: {left: 7, right: 8}},
                    {ratio: 0.9, labels: {left: 8, right: 9}},
                    {ratio: 1.0, labels: {left: 9, right: 10}},
                ],
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
            {
                type: 'facet-histogram',
                data: {
                    values: [
                        {ratio: 1.0, labels: {left: 9, right: 10}},
                        {ratio: 0.9, labels: {left: 8, right: 9}},
                        {ratio: 0.8, labels: {left: 7, right: 8}},
                        {ratio: 0.7, labels: {left: 6, right: 7}},
                        {ratio: 0.6, labels: {left: 5, right: 6}},
                        {ratio: 0.5, labels: {left: 4, right: 5}},
                        {ratio: 0.4, labels: {left: 3, right: 4}},
                        {ratio: 0.3, labels: {left: 2, right: 3}},
                        {ratio: 0.2, labels: {left: 1, right: 2}},
                        {ratio: 0.1, labels: {left: 0, right: 1}},
                    ],
                },
            },
        ];
    }, 1000);
});
