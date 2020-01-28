import {customElement, TemplateResult, html, CSSResult, css, unsafeCSS} from 'lit-element';
import {FacetBarsBase} from '../facet-bars-base/FacetBarsBase';

// @ts-ignore
import FacetTimelineStyle from './FacetTimeline.css';

@customElement('facet-timeline')
export class FacetTimeline extends FacetBarsBase {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(FacetTimelineStyle)}
        `);
        return styles;
    }


}

