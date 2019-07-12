<template>
    <!--表格左右固定列表体-->
    <section class='c-table-wrapper__body-wrapper c-table-body-wrapper__virtual'
             :style='{height: getBodyHeight,width:getBodyWidth,"overflow-x":"hidden","overflow-y":"hidden","border": "1px solid #dddddd"}'>
        <div :style='getBodyWrapperStyle'>
            <div class='c-table-body-container c-table-body-container__virtual'
                 v-for='record in renderData'
                 :key='record[recordKey]'
                 :style='getRowContainerStyle(record)'
                 @click="handleRowClick(record)"
                 @dblclick="handleRowDblClick(record)"
                 @mouseenter.stop="handleMouseIn(record.__vkey)"
                 @mouseleave.stop="handleMouseOut(record.__vkey)">
                <ul class='c-table-body__record'
                    :style='{height: getRecordHeight}'>
                    <li class='c-table-body-column'
                        v-for='(column, index) in columnsConfig'
                        :key='index'
                        :columnKey='column.key'
                        :title='record[column.key]'
                        :style='getColumnStyle(column)'>
                        <div class='c-table-body-column__container'>
                            <span v-if='!column.render'>{{record[column.key]}}</span>
                            <render-body v-else :key='column.key' :row='record' :render='column.render' :index='index' :column='column'></render-body>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
    import RenderBody from './tableHelper/expand';
    import _ from 'lodash';

    export default {
        name: 'VirtualScrollTableFixedBody',
        components: { RenderBody },
        props: {
            columnsConfig: Array,
            virtualItems: Object,
            recordKey: String,
            itemHeight: Number,
            bodyHeight: Number,
            viewportHeight: Number,
            viewportWidth: Number,
            scrollSynclData: Object
        },
        watch: {
            virtualItems: {
                handler: function (val)
                {
                    this.renderData = _.cloneDeep(val.renderData);
                    //console.log('watch virtualItems', val);
                },
                immediate: true,
                deep: true,
            },
        },
        data()
        {
            return {
                renderData: [],
            };
        },
        computed: {
            getRecordHeight: function ()
            {
                return `${this.itemHeight}px`;
            },
            getBodyHeight: function ()
            {
                return `${this.viewportHeight}px`;
            },
            getBodyWidth: function ()
            {
                return `${this.viewportWidth}px`;
            },
            getBodyWrapperStyle: function ()
            {
                //表体宽度
                return {
                    //overflow-y: scroll 元素Y坐标自动向上偏移的。
                    //"overflow-y":"hidden" 元素Y坐标是固定的。
                    transform: `translateY(${-this.scrollSynclData.scrollTop}px)`,
                    height: `${this.bodyHeight}px`,
                    width: `${this.viewportWidth}px`,
                    position: 'relative',
                    //"border-bottom": this.renderData.length > 0 ? "1px solid #dddddd" : ""
                };
            },
        },
        methods: {
            handleRowClick(record)
            {
                let _vkey = record.__vkey;
                this.scrollSynclData.clicked_vkey = _vkey;
                //console.log('click', _vkey, JSON.stringify(record));
                this.$emit('on-row-click', JSON.parse(JSON.stringify(record)), _vkey);
            },
            handleRowDblClick(record)
            {
                let _vkey = record.__vkey;
                console.log('dblClick');
                this.$emit('on-row-dblclick', JSON.parse(JSON.stringify(record)), _vkey);
            },
            handleMouseIn(vkey)
            {
                this.scrollSynclData.focus_vkey = vkey;
            },
            handleMouseOut(vkey)
            {
                this.scrollSynclData.focus_vkey = -1;
            },
            getColumnStyle: function (column)
            {
                return {
                    width: column.cWidth,
                    height: `${this.itemHeight}px`
                };
            },
            getRowContainerStyle: function (record)
            {
                let _isHover = this.scrollSynclData.focus_vkey == record.__vkey
                    || this.scrollSynclData.clicked_vkey == record.__vkey;
                let _color = _isHover ? "#ebf7ff" : "";
                return {
                    transform: `translateY(${record.translateY})`,
                    height: `${this.itemHeight}px`,
                    'background-color': _color,
                    'margin-top': _isHover ? "-1px" : "",
                    'border-top': _isHover ? "1px solid #dddddd" : ""//背景会挡住上一行的下边框显示
                };
            },
        },
    };
</script>

<style scoped>
    .c-table-body-wrapper__virtual {
        display: inherit;
    }

    .c-table-body-container__virtual {
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        will-change: transform;
    }
</style>
