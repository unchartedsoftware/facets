/* */

function main() {
    /* facet-05 */
    const facet05 = document.getElementById('facet-05');
    const facet05Data = [];
    const facet05Length = 365;
    const date = new Date();
    date.setUTCMilliseconds(-86400000 * facet05Length);
    for (let i = 0; i < facet05Length; ++i) {
        const value = {
            ratio: Math.random(),
            label: [
                date.toLocaleDateString('default', { weekday: 'short', day: 'numeric' }),
                date.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
            ],
        };
        value.minDateLabel = date.toLocaleString();
        date.setUTCMilliseconds(86400000);
        value.maxDateLabel = date.toLocaleString();

        facet05Data.push(value);
    }
    facet05.data = facet05Data;
}

window.addEventListener('load', function () {
    main();
});
