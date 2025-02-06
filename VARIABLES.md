<div align="center">

![Uncharted Facets](assets/logo_320.png)

</div>

# CSS Variables
---  
This is the complete list of the CSS variables from facets-core at time of writing. These can be overridden to customize facets. If there's a customization you would like to make this is not in this table, unfortunately you cannot apply it. If you are unsure how any of these variables appear in a final facet set them to a bold color such as red or green (avoid blue and greys as the defaults tend towards blue and grey) and see the result.
A `theme.css` file is also in the distribution of facets-core, and another in facets-plugins. (This table doesn't include facets-plugins variables.)

| Variable Name | Description | Default |
|---------------|-------------|:-------:|
| --facet-font-family | The font family used by the facets. i.e. CSS `font-family`.<br>NOTE: Font sizes cannot be changed. | "IBM Plex Sans", sans-serif |
| --facet-blueprint-background | The background color for the facets. i.e. CSS `background-color`. | #FFFFFF |
| --facet-blueprint-border | The color of the top border (divider) for facets. i.e. `border-top` color.<br>NOTE: The divider is a fixed solid 1px line. There are no variables to change this. | #D9DADB |
| --facet-container-surface-foreground | The foreground color (text color) of the facet title. i.e. `color`. | #1A1B1C |
| **facet-bars** | *Variables that only apply to `facet-bars` facets.* |
| --facet-bars-labels-foreground | The text color of individual bar labels. | #B2B3B4 |
| --facet-bars-labels-tick-background | The background color of bar ticks. | #B2B3B4 |
| --facet-bars-labels-marker-border | The label marker border color. | #D9DADB |
| --facet-bars-blueprint-border | The color assigned to the vertical hover highlight bar that appears when hovering over `facet-bars`. i.e. `border-left` color<BR>NOTE: The bar is a fixed 4px solid line. | #255DCC |
| --facet-bars-value-loading-background-stop-1 | `facet-bars` can be used to create a 'loading' animation. This is the background color at 0%.<br>NOTE: There do not appear to be examples of using this. | #F7F7F7 |
| --facet-bars-value-loading-background-stop-2 | `facet-bars` can be used to create a 'loading' animation. This is the background color at 50%.<br>NOTE: There do not appear to be examples of using this. | #F3F3F3|
| --facet-bars-value-loading-background-stop-3 | `facet-bars` can be used to create a 'loading' animation. This is the background color at 100%.<br>NOTE: There do not appear to be examples of using this. | #F7F7F7 |
| --facet-bars-value-background-loading | The dominant color during a 'loading' animation. | #F7F7F7 |
| --facet-bars-value-bar-1-background-loading | The alternate color during a 'loading' animation. | #ECECEC |
| --facet-bars-value-background | The color of individual bars when not selected. |  #EAEBEC |
| --facet-bars-value-background-contrast | The contrast color of individual bars when not selected. (Used for subselections?) | #F7F7F7 |
| --facet-bars-value-background-selected | The color of individual bars when selected. | #EBF1FC |
| --facet-bars-value-background-contrast-selected | The contrast color of individual bars when selected. | #EAEBEC |
| --facet-bars-value-background-contrast-selected-hover | The contrast color of individual bars when selected and hovered over | #EAEBEC |
| --facet-bars-value-background-unselected | The color of individual bars when unselected. | #EAEBEC |
| --facet-bars-value-background-contrast-unselected | The contrast color of individual bars when unselected. | #F7F7F7 |
| -facet-bars-value-background-contrast-unselected-hover | The contrast color of individual bars during hover when unselected. | #EBF1FC |
| --facet-bars-value-background-muted | The muted color of facet bars. | #EAEBEC |
| --facet-bars-value-background-contrast-muted |The muted contrast color of facet bars. | #F7F7F7 |
| --facet-bars-value-background-contrast-muted-hover | The muted contrast color of facet bars during hovers. | #EBF1FC |
| --facet-bars-0-normal | The normal color of a bar.<br>NOTE: There was an intent to have multiple bar colors but this was not fully implemented. So you will see a '0' in the names but effectively there are no alternatives. | #255DCC |
| --facet-bars-0-normal-contrast | The normal contrast color of a bar. | #A4C2FC |
| --facet-bars-0-normal-contrast-hover | The normal contrast color while hovering over a bar. | #255DCC |
| --facet-bars-0-selected | The color of a bar when selected. | #255DCC |
| --facet-bars-0-selected-contrast | The contrast color of a bar when selected. | #A4C2FC |
| --facet-bars-0-unselected | The unselected color of a bar. | #C2C3C4 |
| --facet-bars-0-unselected-contrast | The unselected contrast color. #D9DADB |
| --facet-bars-0-unselected-contrast-hover | The unselected contrast color while hovering over a bar. | #255DCC |
| --facet-bars-0-muted | The muted color of a bar. | #C2C3C4 |
| --facet-bars-0-muted-contrast | The muted contrast color. | #D9DADB |
| --facet-bars-0-muted-contrast-hover | The muted contrast color during hover. | #255DCC |
| **facet-terms** | *Variables that only apply to `facet-terms` facets.* |
| --facet-term-label | The text color of the individual term facet labels. | #1A1B1C |
| --face-term-annotation | The text color of the individual term annotations. | #727375 |
| --facet-term-value | The text color of the individual term values. | #1A1B1C |
| --facet-terms-tick-color | The hover tick color. This appears to be the color of the hover indicator at the left of a term facet, similar to `--facet-bars-blueprint-border` above. i.e. `border-left` color<BR>NOTE: The bar is a fixed 4px solid line.| #255DCC |
| --facet-blueprint-hover-background | The background color while hovering over a term. | #F7F7F7 |
| --facet-terms-selected-background | The background color or a selected term. | #EBF1FC |
| --facet-term-bar-background-normal | The normal background color of a term bar. | #EAEBEC |
| --facet-term-bar-background-contrast-normal | The normal contrast color of a term bar. (The subselection?) |  #F7F7F7 |
| --facet-term-bar-background-contrast-normal-hover | The normal contrast color of a term bar while hovering over it. | #EAEBEC |
| --facet-term-bar-background-selected | The background color of a selected term bar. | #D9DADB |
| --facet-term-bar-background-contrast-selected | The background contrast color of a selected bar. | #EAEBEC |
| --facet-term-bar-background-contrast-selected-hover |The background contrast color of a selected bar while hovering.| #D9DADB |
| --facet-term-bar-background-muted | The muted color of a bar. | #EAEBEC |
| --facet-term-bar-background-contrast-muted | The muted contrast color of a bar. | #F7F7F7 |
| --facet-term-bar-background-contrast-muted-hover | The muted contrast color of a bar while hovering. | #EAEBEC |
| --facet-terms-bar-0-normal | The normal color of a terms bar.<br>Like the `facet-bars` above there had been plans for multiple bar colors hence the '0' in the name. This wasn't implemented. | #255DCC |
| --facet-terms-bar-0-normal-contrast | The normal contrast color. | #A4C2FC |
| --facet-terms-bar-0-normal-contrast-hover | The normal contrast color during bar hover. | #255DCC |
| --facet-terms-bar-0-selected-contrast | The selected contrast color. | #A4C2FC |
| --facet-terms-bar-0-selected-contrast-hover | The selected contrast color during hover. | #255DCC |
| --facet-terms-bar-0-muted | The muted bar color. | #C2C3C4 |
| --facet-terms-bar-0-muted-contrast | The muted contrast color. | #D9DADB |
| --facet-terms-bar-0-muted-contrast-hover | The muted contrast color while hovering over a bar. | #255DCC |
| **facet buttons** | *i.e. <svg width="14" height="14" viewBox="0 0 576 512" style=""><path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path></svg>&nbsp;<svg width="12" height="12" viewBox="0 0 512 512" style=""><path d="M256 8C119.034 8 8 119.033 8 256s111.034 248 248 248 248-111.034 248-248S392.967 8 256 8zm130.108 117.892c65.448 65.448 70 165.481 20.677 235.637L150.47 105.216c70.204-49.356 170.226-44.735 235.638 20.676zM125.892 386.108c-65.448-65.448-70-165.481-20.677-235.637L361.53 406.784c-70.203 49.356-170.226 44.736-235.638-20.676z"></path></svg>* |
| --facet-button-background-gradient-stop-1 | There is a linear gradient applied to the background of these two buttons. This is the start color for the gradient | #F2F3F3 |
| --facet-button-background-gradient-stop-2 | The end color for the background gradient. | #EAEBEC |
| --facet-button-border | The color of the border around the buttons.<br>NOTE: The border is a fixed 1px solid line. | #D9DADB |
| **facet-plugin-scrollbar** | *A facet plugin for adding a horizontal scrollbar to a facet. The final `facet-timeline` example demonstrates this.* ||
| --facets-plugin-scrollbar-background | The background color of the scrollbar. | rgb(248,248,248) |
| --facets-plugin-scrollbar-border | The color of the top and bottom border of the scroll bar.<br>NOTE: The border is a fixed solid 1px line. | rgb(231,231,231) |
| --facets-plugin-scrollbar-background-round | The background color of the scrollbar. | rgb(244,244,244) |
| --facets-plugin-scrollbar-filter-background | The background color of the scrollbar's filter. | rgba(164,194,252,0.5) |
| --facets-plugin-scrollbar-thumb-background | The background color of the thumb controls at the ends of the scrollbar. | rgb(195,195,195) |
| --facets-plugin-scrollbar-thumb-background-hover | The background color of the thumb controls while hovering over them. | rgb(125,125,125) |
| **facet-plugin-zoom-bar** | *A facet plugin similar to a scrollbar but allows zooming in on a portion of a facet. Several of the `facet-bars` examples demonstrate its use.* ||
| --facets-plugins-zoom-bar-background | The background color of the zoom bar. | #EAEBEC |
| --facets-plugins-zoom-bar-selection-background | The background color of the selected portion of the zoom bar. | #A4C2FC |
| --facets-plugins-zoom-bar-thumb-background | The background color of the zoom bar thumb controls. | #C2C3C4 |
| --facets-plugins-zoom-bar-handle-border | The left and right borders of the handle between the handle and the thumb controls.<br>NOTE: This border is a solid 1px line. | white |
| **facet-plugin-zoom-controls** | *This plugin allows zooming in on a facet. The final `facet-timeline` example demonstrates its use.* ||
| --facets-plugins-zoom-controls-button-border | The border color of the zoom buttoms.<br>NOTE: This border is a solid 1px line. | #A7A7A8 |
| --facets-plugins-zoom-controls-button-background | The background color behind the zoom control buttons. | #F0F1F2 |
