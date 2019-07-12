<template>
    <section class='c-table-wrapper__body-wrapper c-table-body-wrapper__virtual'
             ref='virtualScrollBody'
             @scroll.passive='onVirtualScroll'
             :style='getTableWrapperStyle'>
        <!--用总宽度撑出正确的横向滚动条-->
        <div :style='{width:(unFixedWidth+fixedLeftWidth + fixedRightWidth)+"px"}'>
            <!--表行-->
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

        </div>
    </section>
</template>

<script lang="ts">
    import RenderBody from './tableHelper/expand';
    import { VIRTUAL_REMAIN_COUNT } from './tableHelper/constant';
    import _ from 'lodash';
    import { calDomItemsHeight } from './tableHelper/tableUtil';
    export default {
        name: 'VirtualScrollTableBody',
        components: { RenderBody },
        props: {
            hiddenVerticalScroll: Boolean,
            columnsConfig: Array,
            data: Array,
            recordKey: String,
            fixedLeftWidth: Number,
            fixedRightWidth: Number,
            unFixedWidth: Number,
            itemHeight: Number,
            viewportHeight: Number,
            viewportWidth: Number,
            scrollSynclData: Object
        },
        watch: {
            data: {
                handler: function (val)
                {
                    this.virtualData = _.cloneDeep(val);
                    this.refreshRenderData();
                },
                immediate: true,
                deep: true,
            },
        },
        data()
        {
            const renderItems = Math.ceil(this.viewportHeight / this.itemHeight) + 2 * VIRTUAL_REMAIN_COUNT;
            return {
                virtualData: {},
                renderData: [],
                minItemKeyHeight: -1,
                maxItemKeyHeight: -1,
                remainHeight: VIRTUAL_REMAIN_COUNT * this.itemHeight,
                renderItems: renderItems,
                renderItemsHeight: renderItems * this.itemHeight,
            };
        },
        computed: {
            getTableWrapperStyle: function ()
            {
                console.log(this.hiddenVerticalScroll);
                return {
                    height: `${this.viewportHeight}px`,
                    width: `${this.viewportWidth}px`,
                    'overflow-x': this.hiddenVerticalScroll ? 'hidden' : 'scroll'//hidden

                };
            },
            getRecordHeight: function ()
            {
                return `${this.itemHeight}px`;
            },
            getBodyWrapperStyle: function ()
            {
                return {
                    'margin-left': `${this.fixedLeftWidth}px`,//左右固定的那些列是不显示的
                    'margin-right': `${this.fixedRightWidth}px`,
                    height: `${this.data.length * this.itemHeight}px`,
                    width: `${this.unFixedWidth}px`,//表体宽度
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
                console.log('click', _vkey, JSON.stringify(record));
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
            buildRenderData: function (minHeight, maxHeight)
            {
                const minItemKey = minHeight / this.itemHeight;
                const maxItemKey = maxHeight / this.itemHeight;
                const startIndex = minItemKey > 0 ? minItemKey : -1;
                const endIndex = maxItemKey > this.virtualData.length ? this.data.length : maxItemKey;
                const renderData = [];
                for (let index = startIndex + 1; index < endIndex; index++)
                {
                    const item = this.virtualData[index];
                    const recordIndexHight = `${index * this.itemHeight}`;
                    item.__vkey = index;
                    item.translateY = `${recordIndexHight}px`;
                    renderData.push(item);
                }
                return renderData;
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
            buildNewItems: function (newData)
            {
                const newItems = [];
                for (const newRecord of newData)
                {
                    if (_.findIndex(this.renderData, { __vkey: newRecord.__vkey }) < 0)
                    {
                        newItems.push(newRecord);
                    }
                }
                return newItems;
            },
            buildOutDateItems: function (newData)
            {
                const replaceItemsIndex = [];
                for (let index = 0; index < this.renderData.length; index++)
                {
                    const record = this.renderData[index];
                    if (_.findIndex(newData, { __vkey: record.__vkey }) < 0)
                    {
                        replaceItemsIndex.push(index);
                    }
                }
                return replaceItemsIndex;
            },
            refreshVirtualItems: function (newItems, replaceItemsIndex)
            {
                if (newItems.length === this.renderData.length)
                {
                    this.renderData = newItems;
                    return;
                }
                for (let index = 0; index < newItems.length; index++)
                {
                    if (index < replaceItemsIndex.length)
                    {
                        this.$set(this.renderData, replaceItemsIndex[index], newItems[index]);
                        continue;
                    }
                    this.renderData.push(newItems[index]);
                }
            },
            updateRenderData: function (newData)
            {
                let newItems = [];
                let replaceItemsIndex = [];
                if (this.renderData.length === 0)
                {
                    this.renderData = newData;
                }
                else
                {
                    newItems = this.buildNewItems(newData);
                    replaceItemsIndex = this.buildOutDateItems(newData);
                    this.refreshVirtualItems(newItems, replaceItemsIndex);
                }
                this.scrollSynclData.virtualItems = { renderData: this.renderData };
                //this.$emit(
                //    'on-refresh-virtual-items',
                //    this.renderData
                //);
            },
            refreshRenderData: function ()
            {
                const virtualScrollBody = this.$refs.virtualScrollBody;
                const scrollTop = virtualScrollBody ? virtualScrollBody.scrollTop : 0;
                const scrollLeft = virtualScrollBody ? virtualScrollBody.scrollLeft : 0;
                const [minItemHeight, maxItemHeight] = calDomItemsHeight(
                    this.itemHeight,
                    this.remainHeight,
                    this.viewportHeight,
                    this.renderItemsHeight,
                    scrollTop
                );
                this.updateRenderData(
                    this.buildRenderData(minItemHeight, maxItemHeight)
                );
                this.scrollSynclData.scrollTop = scrollTop;
                this.scrollSynclData.scrollLeft = scrollLeft;
                this.scrollSynclData.scrollbarWidth = virtualScrollBody
                    //https://www.cnblogs.com/panjun-Donet/articles/1294033.html
                    ? (virtualScrollBody.offsetWidth - virtualScrollBody.clientWidth - 2 * virtualScrollBody.clientLeft)
                    : 16;
                this.scrollSynclData.offsetWidth = virtualScrollBody ? virtualScrollBody.offsetWidth : (this.viewportWidth + 2);

            },
            onVirtualScroll(e)
            {
                let _$this = this;
                window.requestAnimationFrame(_$this.refreshRenderData);


                //if (!_$this.throttleVirtualScroll)
                //{
                //    _$this.throttleVirtualScroll = throttle(
                //        () =>
                //        {
                //            console.log(+new Date());
                //            _$this.refreshRenderData();
                //        },
                //        125
                //    );
                //}
                //_$this.throttleVirtualScroll();
            }
        },
    };


    ///**
    // * 节流函数
    // */
    //function throttle(fn, delay)
    //{
    //    let _timer = null
    //    let _previous = null
    //    return function ()
    //    {
    //        let _now = +new Date()
    //        if (null == _previous)
    //        {
    //            _previous = _now;
    //            fn();
    //        }
    //        else
    //        {
    //            let _delay = _now - _previous;
    //            console.log(_delay);
    //            if (_delay < delay)
    //            {
    //                _timer = setTimeout(
    //                    function ()
    //                    {
    //                        _previous = _now;
    //                        fn();
    //                        _timer = null;
    //                    },
    //                    delay - _delay
    //                );
    //            }
    //            else
    //            {
    //                _previous = _now;
    //                fn();
    //            }
    //        }
    //    }
    //}

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
