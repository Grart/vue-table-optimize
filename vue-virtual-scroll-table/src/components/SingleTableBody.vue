<template>
    <section class='c-table-wrapper__body-wrapper' :style='{height: getBodyHeight}'>
        <div class='c-table-body-container'
             v-for='(record,rIndex) in data'
             :key='recordKey?record[recordKey]:rIndex'>
            <ul class='c-table-body__record'
                :style='{height: getRecordHeight}'>
                <li v-for='(column, index) in columnsConfig'
                    class='c-table-body-column'
                    :key='index'
                    :columnKey='column.key' 
                    :title='record[column.key]'
                    :style='getColumnStyle(column)'>
                    <div class='c-table-body-column__container'>
                        <span v-if='!column.render'>{{record[column.key]}}</span>
                        <render-body v-else 
                                     :key='column.key' 
                                     :row='record' 
                                     :render='column.render' 
                                     :column-index='index'></render-body>
                    </div>
                </li>
            </ul>
        </div>
    </section>
</template>

<script lang="ts">
    import RenderBody from './tableHelper/expand';

    export default {
        name: 'SingleTableBody',
        components: { RenderBody },
        props: {
            columnsConfig: Array,
            data: Array,
            recordKey: String,
            recordHeight: Number,
            bodyHeight: Number,
        },
        data()
        {
            return {};
        },
        computed: {
            getRecordHeight: function ()
            {
                return `${this.recordHeight}px`;
            },
            getBodyHeight: function ()
            {
                return `${this.bodyHeight}px`;
            },
        },
        methods: {
            getColumnStyle: function (column)
            {
                return {
                    width: column.cWidth,
                    height: `${this.recordHeight}px`,
                };
            },
        },
    };
</script>

<style scoped>
</style>
