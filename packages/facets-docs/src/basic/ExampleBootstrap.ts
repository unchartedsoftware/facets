import {FacetExample} from './facet-example/FacetExample';

export function bootstrap(): void {
    const params = new URLSearchParams(window.location.search);
    const example = params.get('ex') as string;
    const element = new FacetExample(example);
    document.body.appendChild(element);
}
