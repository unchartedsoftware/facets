const kLabelsTemplate = [
    [
        {
            count: 2,
            values: [
                'Q1',
                'Q2',
                'Q3',
                'Q4',
            ],
        },
        {
            count: 8,
            values: [
                '1990',
                '1991',
                '1992',
                '1993',
                '1994',
                '1995',
                '1996',
                '1997',
                '1998',
                '1999',
                '2000',
                '2001',
                '2002',
                '2003',
                '2004',
                '2005',
                '2006',
                '2007',
                '2008',
                '2009',
                '2010',
                '2011',
                '2012',
                '2013',
                '2014',
                '2015',
                '2016',
                '2017',
                '2018',
                '2019',
            ],
        },
        {
            count: 80,
            values: [
                '90\'s',
                '00\'s',
                '10\'s',
            ],
        },
    ],
    [
        {
            count: 3,
            values: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ],
        },
        {
            count: 9,
            values: [
                'Q1',
                'Q2',
                'Q3',
                'Q4',
            ],
        },
        {
            count: 36,
            values: [
                '1990',
                '1991',
                '1992',
                '1993',
                '1994',
                '1995',
                '1996',
                '1997',
                '1998',
                '1999',
                '2000',
                '2001',
                '2002',
                '2003',
                '2004',
                '2005',
                '2006',
                '2007',
                '2008',
                '2009',
                '2010',
                '2011',
                '2012',
                '2013',
                '2014',
                '2015',
                '2016',
                '2017',
                '2018',
                '2019',
            ],
        },
    ],
    [
        {
            count: 1,
            values: [
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '11',
                '12',
                '13',
                '14',
                '15',
                '16',
                '17',
                '18',
                '19',
                '20',
                '21',
                '22',
                '23',
                '24',
                '25',
                '26',
                '27',
                '28',
                '29',
                '30',
            ],
        },
        {
            count: 30,
            values: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ],
        },
        {
            count: 360,
            values: [
                '1990',
                '1991',
                '1992',
                '1993',
                '1994',
                '1995',
                '1996',
                '1997',
                '1998',
                '1999',
                '2000',
                '2001',
                '2002',
                '2003',
                '2004',
                '2005',
                '2006',
                '2007',
                '2008',
                '2009',
                '2010',
                '2011',
                '2012',
                '2013',
                '2014',
                '2015',
                '2016',
                '2017',
                '2018',
                '2019',
            ],
        },
    ],
];

const kZoomLevelViews = [
    {
        min: 8,
        max: 100000,
    },
    {
        min: 6,
        max: 40,
    },
    {
        min: 0,
        max: 75,
    },
];

function getLabel(zoomLevel, detailLevel, i) {
    return kLabelsTemplate[zoomLevel][detailLevel]
        .values[Math.floor(
            i / kLabelsTemplate[zoomLevel][detailLevel].count
        ) % kLabelsTemplate[zoomLevel][detailLevel].values.length];
}


function getDummyData(range, zoomLevel, oldData = { values: {} } ) {
    const values = Object.assign({}, oldData.values);
    for (let i = range[0]; i < range[1]; ++i) {
        values[i] = {
            ratio: Math.random(),
            labels: [
                getLabel(zoomLevel, 0, i),
                getLabel(zoomLevel, 1, i),
                getLabel(zoomLevel, 2, i),
            ],
        };
    }
    return {
        label: 'Zoom Interactions',
        values,
    };
}

function nullifyValues(oldData) {
    const values = Object.assign({}, oldData.values);
    const keys = Object.keys(values);
    for (let i = 0, n = keys.length; i < n; ++i) {
        values[keys[i]].ratio = null;
    }
    return {
        label: 'Zoom Interactions',
        values,
    };
}

function changeZoomLevel(facet, zoomBar, data, oldZoom, newZoom, loaded, loadCount) {
    return new Promise(resolve => {
        const oldZoomLength = kLabelsTemplate[oldZoom][2].count * kLabelsTemplate[oldZoom][2].values.length;
        const newZoomLength = kLabelsTemplate[newZoom][2].count * kLabelsTemplate[newZoom][2].values.length;
        const view = facet.view;
        const min = Math.max(0, Math.round((view[0] / oldZoomLength) * newZoomLength));
        const max = Math.min(newZoomLength, Math.round((view[1] / oldZoomLength) * newZoomLength));
        const selection = facet.selection;
        facet.data = nullifyValues(data);
        facet.selection = null;
        zoomBar.enabled = false;

        setTimeout(() => {
            loaded[0] = Math.max(min - loadCount, 0);
            loaded[1] = Math.min(max + loadCount, newZoomLength);
            const newData = getDummyData(loaded, newZoom);
            facet.data = newData;
            facet.view = [min, max];

            // facet.domain = [0, newZoomLength];
            facet.domain = newZoom === 0 ? [0, newZoomLength] : loaded;

            if (selection) {
                facet.selection = [
                    Math.max(0, Math.floor((selection[0] / oldZoomLength) * newZoomLength)),
                    Math.min(newZoomLength, Math.ceil((selection[1] / oldZoomLength) * newZoomLength)),
                ];
            }

            zoomBar.enabled = true;
            resolve(newData);
        }, 1000);
    });
}

function main() {
    const facet = document.querySelector('#facet06');
    if (facet) {
        const zoomBar = document.createElement('facet-plugin-zoom-bar');
        zoomBar.setAttribute('slot', 'footer');
        facet.append(zoomBar);

        const loadCount = 40;
        const loaded = [0, loadCount];
        let zoomLevel = 0;
        let data = getDummyData(loaded, zoomLevel);
        facet.data = data;
        facet.view = [0, 32];
        facet.domain = [0, kLabelsTemplate[zoomLevel][2].count * kLabelsTemplate[zoomLevel][2].values.length];

        facet.addEventListener('facet-element-updated', evt => {
            if (evt.detail.changedProperties.has('view')) {
                const domain = facet.domain;
                const view = facet.view;
                const length = view[1] - view[0];

                if (length >= kZoomLevelViews[zoomLevel].max) {
                    changeZoomLevel(facet, zoomBar, data, zoomLevel, zoomLevel - 1, loaded, loadCount).then(newData => {
                        data = newData;
                        --zoomLevel;
                    });
                } else if (length <= kZoomLevelViews[zoomLevel].min) {
                    changeZoomLevel(facet, zoomBar, data, zoomLevel, zoomLevel + 1, loaded, loadCount).then(newData => {
                        data = newData;
                        ++zoomLevel;
                    });
                } else {
                    const maxOOV = Math.round(length * 0.5);
                    let dataUpdated = false;

                    if (view[0] < loaded[0] - maxOOV) {
                        const bound = Math.max(domain[0], loaded[0] - loadCount);
                        data = getDummyData([bound, loaded[0]], zoomLevel, data);
                        dataUpdated = true;
                        loaded[0] = bound;
                    }

                    if (view[1] > loaded[1] + maxOOV) {
                        const bound = Math.min(domain[1], loaded[1] + loadCount);
                        data = getDummyData([loaded[1], bound], zoomLevel, data);
                        dataUpdated = true;
                        loaded[1] = bound;
                    }

                    if (dataUpdated) {
                        facet.data = data;
                    }
                }
            }
        });
    }
}

window.addEventListener('load', function () {
    setTimeout(main, 2000);
});
