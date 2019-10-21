<template>
    <div class="view">
        <span>The facets group below is populated with a vue for loop</span>
        <facet-list :data="JSON.stringify(facetList)">
            <span slot="header">NO MAMES, POR QUE?!</span>
            <facet-template target="facet-histogram">
                <slot-header>
                    <div class="facet-slot-label">
                        <span>${metadata.header.label}</span>
                    </div>
                </slot-header>
            </facet-template>

            <facet-template target="facet-term">
                <slot-left>
                    <div style="width: 50px; height: 50px; background-color: #A4C2FC; margin: 2px;"></div>
                </slot-left>
            </facet-template>
        </facet-list>

        <facet-term v-for="facet in facets" :key="facet.id" :data="JSON.stringify({...facet, percentage: facet.value})" actionButtons="3">
            <span slot="annotation" class="facet-slot-label">*Annotation</span>
<!--            <span slot="button_0">i</span>-->
        </facet-term>

        <facet-form slot="footer" @add:facet="addFacet"></facet-form>
    </div>
</template>

<style>
    .view {
        color: teal;
        width: 300px;
    }
    .facet-slot-label {
        font-family: "IBM Plex Sans", sans-serif;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.02em;
        color: #EAEBEC;
        background-color: #727375;
        height: 100%;
        padding: 2px 10px;
    }
</style>

<script>
    import FacetForm from "./FacetForm.vue";
    import nickGenerator from 'nick-generator';
    let counter = 0;

    const facetList = [];

    for (let i = 0; i < 15; ++i) {
        if (Math.random() >= 0.85) {
            const histogram = {
                metadata: {
                    header: {
                        label: nickGenerator(),
                        color: '#0f0f0f',
                        background: '#D9DADB',
                    },
                },
                buckets: [],
            };
            let value = 0;
            let step = 12 + Math.round(Math.random() * 1000);
            for (let i = 0; i < 10; ++i) {
                histogram.buckets.push({
                    percentage: Math.round(Math.random() * 100),
                    values: [value, value + step],
                });
                value += step;
            }
            facetList.push({
                type: 'facet-histogram',
                data: histogram,
            });
        } else {
            const rand = Math.random();
            const term = {
                percentage: Math.round(rand * 100),
                label: nickGenerator(),
                value: Math.round(rand * 9999),
            };
            facetList.push({
                type: 'facet-term',
                data: term,
            });
        }
    }

    export default {
        name: 'AppBody',
        components: { FacetForm },
        data() {
            return {
                facets: [
                ],
                facetList: facetList,
            }
        },
        methods: {
            addFacet(facet) {
                const id = counter++;
                const newFacet = {...facet, id };
                this.facets = [...this.facets, newFacet];
            },
            deleteFacet(id) {
                this.facets = this.facets.filter(facet => facet.id !== id);
            }
        },
    };
</script>
