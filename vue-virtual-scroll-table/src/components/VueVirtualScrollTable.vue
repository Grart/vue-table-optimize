<template>
    <div>
        <single-table v-if='!isMultHeaderRows'
                      ref="RefTable"
                      :table-owner="owner"
                      :data='filterResult'
                      :columns-config='cloneColumnsConfig'
                      :record-key='recordKey'
                      :header-height='headerHeight'
                      :body-height='bodyHeight'
                      :table-width='tableWidth'
                      :record-height='recordHeight'
                      :header-class='headerClass'
                      :multi-selection="multiSelection"
                      :init-row-selection="initRowSelection"
                      @on-selection-change="selectionChange">
                      
   
                <template slot="footer" v-if="hasFooterSlot()">
                    <slot name="footer"></slot>
                </template>
        </single-table>
    </div>
</template>

<script lang="ts">
    import './tableHelper/requestAnimationFrameUtil';
    import SingleTable from './SingleTable.vue';
    import _ from 'lodash';
    import
    {
        ID_NAME,
        SCROLL_WIDTH,
        DEFAULT_TABLE_HEIGHT,
        DEFAULT_TABLE_HEADER_HEIGHT,
        DEFAULT_TABLE_RECORD_HEIGHT,
    } from './tableHelper/constant';
    import { getRandomStr } from './tableHelper/tableUtil';

    export default {
        components: { SingleTable },
        name: 'VueVirtualScrollTable',
        props: {
            /*多选模式下用于初始化勾选状态*/
            initRowSelection: Function,
            columns: {
                type: Array,
                default()
                {
                    return [];
                },
            },
            data: {
                type: Array,
                default()
                {
                    return [];
                },
            },
            filters: {
                type: Array,
                default()
                {
                    return [];
                },
            },
            recordKey: {
                type: String,
                required: false,
            },
            height: {
                type: Number,
                default()
                {
                    return DEFAULT_TABLE_HEIGHT;
                },
            },
            headerHeight: {
                type: Number,
                default()
                {
                    return DEFAULT_TABLE_HEADER_HEIGHT;
                },
            },
            recordHeight: {
                type: Number,
                default()
                {
                    return DEFAULT_TABLE_RECORD_HEIGHT;
                },
            },
            headerClass: {
                type: String,
                default: function ()
                {
                    return 'c-table-header__default';
                },
            },

            tableWidth: Number,
            //是否启用多选
            multiSelection: {
                type: Boolean,
                default: false
            }
        },
        mounted()
        {
            this.handleResize();
        },
        watch: {
            height: {
                handler: function (val)
                {
                    this.bodyHeight = val - this.headerHeight;
                },
                immediate: true,
            },
            //columnsConfig
            columns: {
                handler: function (val)
                {
                    const cloneColumnsConfig = _.cloneDeep(val);
                    this.buildColumnUUID(cloneColumnsConfig);
                    this.cloneColumnsConfig = cloneColumnsConfig;
                },
                immediate: true,
                deep: true,
            },
            data: {
                handler: function (val)
                {
                    this.filterResult = _.cloneDeep(val);
                },
                immediate: true,
                deep: true,
            },
        },
        data()
        {
            return {
                owner: this,
                filterResult: [],
                cloneColumnsConfig: [],
                cloneColumnsRow: [],
                bodyHeight: DEFAULT_TABLE_HEIGHT - DEFAULT_TABLE_HEADER_HEIGHT
            };
        },
        computed: {
            isMultHeaderRows: function ()
            {
                return _.find(this.columns, function (column)
                {
                    return column.children;
                });
            },
        },
        methods: {
            hasFooterSlot:function(){
                console.log(this.$slots);
                return this.$slots.footer !== undefined;
            },
            getSelectionData: function ()
            {
                return this.$refs.RefTable.getSelectionData();
            },
            selectionChange: function (selectionArray)
            {
                console.log(this.$refs.RefTable.getSelectionData());
            },
            buildColumnUUID: function (columnsConfig)
            {
                return columnsConfig.map(item =>
                {
                    if ('children' in item) this.buildColumnUUID(item.children);
                    if (!item[ID_NAME])
                    {
                        item[ID_NAME] = getRandomStr(6);
                    }
                    return item;
                });
            },
            handleResize: function ()
            {
                const tableWidth = this.$el.offsetWidth - SCROLL_WIDTH;
                let width = 0;
                let widthCount = 0;
                let columnsConfig = _.cloneDeep(this.cloneColumnsConfig);
                for (const column of columnsConfig)
                {
                    if (column.width = column.width || column.minWidth)
                    {
                        width += column.width;
                        widthCount++;
                    }
                }
                const autoWidth = (tableWidth - width) / (columnsConfig.length - widthCount);
                for (const column of columnsConfig)
                {
                    column.cWidth = column.width ? `${column.width}px` : `${autoWidth}px`;
                }
                this.cloneColumnsConfig = columnsConfig;
            },
        },
    };
</script>

<style>
</style>
