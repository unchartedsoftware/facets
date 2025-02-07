<div align="center">

![Uncharted Facets](assets/logo_320.png)

</div>

# Using Facets in Javascript/Typescript
---

## Install

Use `yarn` to install the desired packages:
```shell script
yarn add @uncharted.software/facets-core
yarn add @uncharted.software/facets-plugins
```
or `npm`:
```shell script
npm install @uncharted.software/facets-core
npm install @uncharted.software/facets-plugins
```

## Instantiating Facets
First, import the libraries as usual.
```javascript
import * as Facets from '@uncharted.software/facets-core';
import * as Plugins from '@uncharted.software/facets-plugins';
```
Then instantiate facets as you would any web component.
```javascript
const termsFacet = document.createElement('facet-terms');
```
Next assign data to the facet's `data` property. (See the [HTML examples](https://unchartedsoftware.github.io/facets) for details of the data structures and requirements.)
```javascript
termsFacet.data = {
    label: "Simple Facets",
    values: [
        { "ratio": 0.05, "label": "5%" },
        { "ratio": 0.15, "label": "15%" },
        // etc.
    ]
};
```

## Facet Messages
Facets support a single message type, `facet-element-updated`. This message is dispatched whenever any of the properties of a facet changes. Subscribe to the message by adding a listener to the facet.
```javascript
termsFacet.addEventListener('facet-element-updated', (event) => { /* Do Stuff */ });
```
`event.detail.changedProperties` contains the list of properties that have changed. For example you can listen for selection changes by checking `event.detail.changedProperties.has('selection')`. After which you can check `termsFacet.selection` to see what is selected. The structure of the selection varies by facet type.
