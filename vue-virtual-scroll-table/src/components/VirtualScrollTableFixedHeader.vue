<template>
    <!--表格左右固定列列头-->
    <ul class='c-table-header__record'
        :style='getHeaderStyle'>
        <li class='c-table-header-column'
            v-for='(column, index) in columnsConfig'
            :key='column[cIdKey]'
            :columnKey='column[cIdKey]'
            :title='column.title'
            :style='getColumnStyle(column)'>
            <div class='c-table-header-column__container'>
                <span v-if='!column.renderHeader'>{{column.title}}</span>
                <render-header v-else :render='column.renderHeader' :column='column' :column-index='index'></render-header>
            </div>
        </li>
    </ul>

</template>

<script lang="ts">
    import RenderHeader from './tableHelper/expand';
    import { ID_NAME } from './tableHelper/constant';

    export default {
        name: 'VirtualScrollTableFixedHeader',
        components: { RenderHeader },
        props: {
            columnsConfig: Array,
            columnsWidth: Number,
            height: Number,
            scrollSynclData: Object
        },
        data()
        {
            return {
                cIdKey: ID_NAME,
            };
        },
        watch: {
            columnsConfig: {
                handler: function (
                    config
                )
                {
                    console.log('handler VirtualScrollTableFixedHeader columnsConfig');
                },
                immediate: true,
                //deep: true,
            }
        },
        computed: {
            getHeaderStyle: function ()
            {
                return {
                    height: `${this.height}px`,
                    width: `${this.columnsWidth}px`
                };
            },
        },
        methods: {
            getColumnStyle: function (column)
            {
                return {
                    width: column.cWidth,
                    //width: `${200}px`,
                    height: `${this.height}px`,
                };
            },
        },
    };
</script>

<style scoped>
</style>
