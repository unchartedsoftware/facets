<template>
    <div id="facet-form">
        <form @submit.prevent="handleSubmit">
            <span>Vue Form (slot: facets-container-footer)</span><br />
            <label>Facet Name:</label>
            <input v-model="facet.label" type="text" />
            <label>Facet Value (0 - 100):</label>
            <input v-model="facet.value" type="text" />
            <button>Add Facet</button>
        </form>
    </div>
</template>

<script>
    export default {
        name: 'FacetForm',
        data() {
            return {
                facet: {
                    id: '',
                    label: '',
                    value: '',
                    meta: {},
                },
            }
        },
        methods: {
            handleSubmit() {
                this.$emit('add:facet', this.facet)
            },
        },
    }
</script>

<style scoped>
    form {
        padding: 5px;
        background-color: lightblue;
        color: #444;
    }
</style>
