<template>
    <!--表格左右固定列表体-->
    <section class='c-table-wrapper__body-wrapper c-table-body-wrapper__virtual'
             :style='{height: getBodyHeight,width:getBodyWidth,"overflow-x":"hidden","overflow-y":"hidden","border": "1px solid #dddddd"}'>
        <div :style='getBodyWrapperStyle'>
            <div v-for='(record,rIndex) in renderData'
                 class='c-table-body-container c-table-body-container__virtual'
                 :key='recordKey?record[recordKey]:rIndex'
                 :style='getRowWrapperStyle(record)'
                 @click="handleRowClick(record)"
                 @dblclick="handleRowDblClick(record)"
                 @mouseenter.stop="handleMouseIn(record.__dataIndex)"
                 @mouseleave.stop="handleMouseOut(record.__dataIndex)">
                <ul class='c-table-body__record'
                    :style='getRowContainerStyle(record)'>
                    <li v-for='(column, index) in columnsConfig'
                        class='c-table-body-column'
                        :key='index'
                        :columnKey='column.key'
                        :title='column.key?record[column.key]:""'
                        :style='getColumnStyle(column)'>
                        <div class='c-table-body-column__container'>
                            <span v-if='!column.render'>{{record[column.key]}}</span>
                            <render-body v-else 
                                         :key='column.key' 
                                         :row='record' 
                                         :render='column.render' 
                                         :column-index='index' 
                                         :column='column'></render-body>
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
            //主表体组件this
            tableOwner: Object,
            columnsConfig: Array,
            virtualItems: Object,
            recordKey: String,
            itemHeight: Number,
            bodyHeight: Number,
            viewportHeight: Number,
            viewportWidth: Number,
            scrollSynclData: Object,
            //是否启用选中样式
            enableSelectStyle: {
                type: Boolean,
                default: false
            },
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
                let _index = record.__dataIndex;
                this.scrollSynclData.clicked_index = _index;
                //console.log('click', _index, JSON.stringify(record));
                this.tableOwner.$emit('on-row-click', JSON.parse(JSON.stringify(record)), _index);
            },
            handleRowDblClick(record)
            {
                let _index = record.__dataIndex;
                this.tableOwner.$emit('on-row-dblclick', JSON.parse(JSON.stringify(record)), _index);
            },
            handleMouseIn(vkey)
            {
                this.scrollSynclData.hover_index = vkey;
            },
            handleMouseOut(vkey)
            {
                this.scrollSynclData.hover_index = -1;
            },
            getColumnStyle: function (column)
            {
                return {
                    width: column.cWidth,
                    height: `${this.itemHeight}px`
                };
            },
            getRowWrapperStyle: function (record)
            {
                let _$this = this;
                let _isChecked = _$this.scrollSynclData.clicked_index == record.__dataIndex;;
                let _isHover = _isChecked || _$this.scrollSynclData.hover_index == record.__dataIndex;
                if (!_isHover)
                {
                    return {
                        'transform': `translateY(${record.translateY})`,
                        'height': `${_$this.itemHeight}px`,
                    };
                }
                //指中行样式
                return {
                    'transform': `translateY(${record.translateY})`,
                    'height': `${_$this.itemHeight}px`,
                    'box-shadow': '0px 2px 6px -2px rgba(0,0,0,.2)',
                    'background-color': "#ebf7ff",
                    'margin-top': "-1px",
                    'border-top':  "1px solid #dddddd" //背景会挡住上一行的下边框显示
                };
            },
            getRowContainerStyle: function (record)
            {
                let _$this = this;
                //不分左右了,取消 enableSelectStyle 判断
                //if (!_$this.enableSelectStyle)
                //{
                //    return {
                //        'height': _$this.getRecordHeight
                //    };
                //}
                let _isChecked = _$this.scrollSynclData.clicked_index == record.__dataIndex;;
                let _isHover = _isChecked || _$this.scrollSynclData.hover_index == record.__dataIndex;
                return {
                    'box-shadow': _isHover ? '0px 2px 6px 0px rgba(0,0,0,.2)' : '',
                    'height': _$this.getRecordHeight
                };
            }
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
