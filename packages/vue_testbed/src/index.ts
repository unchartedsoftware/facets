import Vue, {VNode} from 'vue';
import * as Facets from '@uncharted.software/facets-core';
export {Facets}; // keep facets code from tree shaking

// @ts-ignore
import App from './App.vue';

Vue.config.ignoredElements = [
    /^slot-/,
];

const app = new Vue({
    render: (h: any): VNode => h(App),
});

export { app };
