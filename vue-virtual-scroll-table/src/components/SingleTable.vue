<template>
    <div style="width:inherit"
                 ref='tableWrapper'>
        <article class='c-table-wrapper'
                 ref='tableHeader'
                 :style='getTableWrapperStyle'>

            <!--表格非固定列(表头)-->
            <table-header v-if="bodyVisable"
                          :header-class='headerClass'
                          :columns-config='getUnFixedColumnsConfig'
                          :height='headerHeight'
                          :un-fixed-width="getUnFixedWidth"
                          :fixed-left-width="getFixedLeftWidth"
                          :fixed-right-width="getFixedRightWidth"
                          :viewport-width='tableWidth'
                          :scroll-syncl-data="scrollSynclData">
            </table-header>

            <!--表格非固定列-->
            <virtual-scroll-table-body v-if="bodyVisable"
                                       :hidden-vertical-scroll="hiddenVerticalScroll"
                                       :data='data'
                                       :record-key='recordKey'
                                       :columns-config='getUnFixedColumnsConfig'
                                       :un-fixed-width="getUnFixedWidth"
                                       :fixed-left-width="getFixedLeftWidth"
                                       :fixed-right-width="getFixedRightWidth"
                                       :item-height='recordHeight'
                                       :viewport-height='bodyHeight'
                                       :viewport-width='tableWidth'
                                       :scroll-syncl-data="scrollSynclData">
            </virtual-scroll-table-body>

            <!--表格左固定列-->
            <virtual-scroll-table-fixed :fixedStyle="getFixedLeftStyle"
                                        :table-fiexed-class="getFixedLeftClass"
                                        :headerClass="headerClass"
                                        :virtual-items='scrollSynclData.virtualItems'
                                        :scroll-syncl-data="scrollSynclData"
                                        :record-key='recordKey'
                                        :columns-config='getFixedLeftColumnsConfig'
                                        :header-height='headerHeight'
                                        :item-height='recordHeight'
                                        :body-height='getBodyHeight'
                                        :fixed-height='bodyHeight'
                                        :fixed-width='getFixedLeftWidth'>
            </virtual-scroll-table-fixed>

            <!--表格右固定列-->
            <virtual-scroll-table-fixed :fixedStyle="getFixedRightStyle"
                                        :table-fiexed-class="getFixedRightClass"
                                        :headerClass="headerClass"
                                        :virtual-items='scrollSynclData.virtualItems'
                                        :scroll-syncl-data="scrollSynclData"
                                        :record-key='recordKey'
                                        :columns-config='getFixedRightColumnsConfig'
                                        :header-height='headerHeight'
                                        :item-height='recordHeight'
                                        :body-height='getBodyHeight'
                                        :fixed-height='bodyHeight'
                                        :fixed-width='getFixedRightWidth'>
            </virtual-scroll-table-fixed>

        </article>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import elementResizeDetectorMaker from 'element-resize-detector';

    import TableHeader from './SingleTableHeader';
    import TableBody from './SingleTableBody';
    import RequestAnimationFrameTableBody from './RequestAnimationFrameTableBody';
    import VirtualScrollTableBody from './VirtualScrollTableBody';
    import VirtualScrollTableFixed from './VirtualScrollTableFixed';
    /**
     * 计算列宽
     */
    function getColumnsWidth(columnsConfig)
    {
        let _bodyWidth = 0;
        let _cfg = columnsConfig;
        for (let _c = 0; _c < _cfg.length; _c++)
        {
            let _col = _cfg[_c];
            let _columnWidth = parseInt(_col.cWidth ? _col.cWidth.replace('px', '') : _col.width);
            _bodyWidth += _columnWidth;
            _col.cWidth = `${_columnWidth}px`;
        }
        return _bodyWidth;
    }

    const SelectionComponent = {
        props: {
            checkSyncObject: Object
        },
        data()
        {
            return this.checkSyncObject;//直接把输入属性做绑定对像绑定
        },
        render: function (h, params)
        {
            let _$this = this;
            let _checked = _$this.checked;
            let _synObject = _$this.checkSyncObject;
            console.log('render selection');
            return h(
                "div",
                {
                    on: {
                        click: function (e)
                        {
                            _synObject.checked = _$this.checked = !_checked;
                            if (_synObject.onCheckedChange)
                            {
                                _synObject.onCheckedChange(_$this.checked);
                            }
                            console.log(_$this.checked);
                        }
                    }
                },
                [
                    h("span", {
                        staticClass: true == _checked ? "iconfont icon-checkbox_on" : "iconfont icon-check-box-outline-bl",
                        staticStyle: {
                            'font-size': '18px',
                            'width': '40px',
                            'color': '#2d8cf0'
                        },
                        attrs: {}
                    })
                ]
            );
        }
    };

    export default {
        components: {
            TableHeader,
            TableBody,
            RequestAnimationFrameTableBody,
            VirtualScrollTableBody,
            VirtualScrollTableFixed,
        },
        name: 'SingleTable',
        props: {
            columnsConfig: Array,
            data: Array,
            recordKey: String,
            headerHeight: Number,
            bodyHeight: Number,
            tableWidth: Number,
            recordHeight: Number,
            headerClass: {
                type: String,
                default: 'c-table-header__default'
            },
        },
        data()
        {
            return {
                //滚动条同步对像,body通过这个对像将同步信息传给header
                scrollSynclData: {
                    scrollTop: 0,
                    scrollLeft: 0,
                    scrollbarWidth: 16,
                    offsetWidth: 0,
                    focus_vkey: -1,
                    clicked_vkey: -1,
                    virtualItems: {
                        renderData: [],
                        newItems: [],
                        replaceItemsIndex: 0
                    }
                },
                bodyVisable: false,
                hiddenVerticalScroll: false,
                bodyWidth: 0
            };
        },
        computed: {
            getColumnsConfig: function ()
            {
                if (!this.columnsConfig)
                {
                    return [];
                }
                let _selectionDict = {};
                let _toggleSelectObject = {
                    checked: false,
                    onCheckedChange: function (checked)
                    {
                        console.log('onCheckedChange', checked);
                        for (let _key in _selectionDict)
                        {
                            _selectionDict[_key].checked = checked;
                        }
                    }
                };
                let _selection = {
                    title: '选择',
                    sortable: true,
                    width: 29,//右边框1px
                    disableDrag: true,
                    fixed: 'left',
                    renderHeader: function (h, params)
                    {
                        console.log(params);
                        return h(
                            SelectionComponent,
                            {
                                props: {
                                    checkSyncObject: _toggleSelectObject
                                }
                            }
                        );
                    },
                    render: function (h, params)
                    {
                        let _row = params.row;
                        let _vkey = _row.__vkey;
                        //console.log('render _vkey=' + _vkey);
                        let _checkObject = _selectionDict[_vkey];
                        if (!_checkObject)
                        {
                            _selectionDict[_vkey] = _checkObject = { checked: false };
                        }
                        return h(
                            SelectionComponent,
                            {
                                props: {
                                    checkSyncObject: _checkObject
                                }
                            }
                        );
                    },
                    key: 'status',
                    noNeedVertical: true,
                    enableEllipsis: true,
                };
                return [_selection, ... this.columnsConfig];
            },
            getUnFixedColumnsConfig: function ()
            {
                return this.getColumnsConfig.filter(
                    m => m.fixed != 'right' && m.fixed != 'left'
                );
            },
            getFixedLeftColumnsConfig: function ()
            {
                return this.getColumnsConfig.filter(
                    m => m.fixed == 'left'
                );
            },
            getFixedRightColumnsConfig: function ()
            {
                return this.getColumnsConfig.filter(
                    m => m.fixed == 'right'
                );
            },
            getFixedLeftWidth: function ()
            {
                return getColumnsWidth(this.getFixedLeftColumnsConfig);
            },
            getFixedRightWidth: function ()
            {
                return getColumnsWidth(this.getFixedRightColumnsConfig);
            },
            getUnFixedWidth: function ()
            {
                return getColumnsWidth(this.getUnFixedColumnsConfig);
            },
            getAllColumnsWidth: function ()
            {
                return getColumnsWidth(this.columnsConfig);
            },
            getBodyHeight: function ()
            {
                return this.data.length * this.recordHeight;
            },

            getTableWrapperStyle: function ()
            {
                //最外层嵌套元素样式
                let _width = this.bodyVisable ? (this.tableWidth ? this.tableWidth : this.bodyWidth) : 0;
                return {
                    width: 0 != _width ? `${_width}px` : 'inherit',
                    position: "relative"
                };
            },

            getHeaderStyle: function ()
            {
                let _totalWidth = this.getUnFixedWidth + this.getFixedLeftWidth + this.getFixedRightWidth;
                console.log(this.scrollSynclData.offsetWidth);
                return {
                    width: (this.tableWidth ? `${this.tableWidth}px` : (this.bodyVisable ? `${this.bodyWidth - 18}px` : 'inherit')),
                    "overflow-x": "hidden",
                    "overflow-y": "hidden"
                }

                //return `${(this.scrollSynclData ? this.scrollSynclData.offsetWidth : this.tableWidth)}px`;
            },
            getHeaderColumnWidth: function ()
            {
                return `${(this.scrollSynclData ? this.scrollSynclData.offsetWidth : this.tableWidth) - this.scrollSynclData.scrollbarWidth - 4}px`;
            },
            getTableHeight: function ()
            {
                return this.bodyHeight + this.headerHeight;
            },
            getFixedRightClass: function ()
            {
                return this.hiddenVerticalScroll ? '' : 'c-table-fiexed-right';
            },
            getFixedRightStyle: function ()
            {
                let _height = this.getTableHeight;
                if (!this.hiddenVerticalScroll)
                {
                    _height = _height - this.scrollSynclData.scrollbarWidth + 2;
                }
                return {
                    top: `${0}px`,
                    right: `${this.scrollSynclData.scrollbarWidth + 1}px`,
                    width: `${this.getFixedRightWidth}px`,
                    height: `${_height}px`,
                    position: 'absolute',//顶层要用position: relative;
                    'background-color': 'ghostwhite',
                    "overflow-x": "hidden",
                    "overflow-y": "hidden",
                    'box-sizing': 'order-box'
                };
            },
            getFixedLeftClass: function ()
            {
                return this.hiddenVerticalScroll ? '' : 'c-table-fiexed-left';
            },
            getFixedLeftStyle: function ()
            {
                let _height = 0;
                if (this.hiddenVerticalScroll)
                {
                    //为了显示左冻结列，右方的表格线条
                    _height = this.data.length * this.recordHeight;
                }
                else
                {
                    _height = this.getTableHeight - this.scrollSynclData.scrollbarWidth + 2;
                }
                return {
                    'border-right': this.hiddenVerticalScroll ? '1px solid #dddddd' : '',
                    top: `${0}px`,
                    left: `${1}px`,
                    width: `${this.getFixedLeftWidth}px`,
                    height: `${_height}px`,
                    position: 'absolute',//顶层要用position: relative;
                    'background-color': 'ghostwhite',
                    "overflow-x": "hidden",
                    "overflow-y": "hidden",
                    'box-sizing': 'order-box'
                };
            },
            getFloatRightHeaderStyle: function ()
            {
                console.log(`${this.headerHeight}px`);
                return {
                    height: `${this.headerHeight}px`
                };
            }
        },
        methods: {
            handleResize()
            {
                let _$this = this;
                _$this.bodyWidth = _$this.$refs.tableWrapper.clientWidth;//tableHeader
                if (0 == _$this.bodyWidth)
                {
                    _$this.bodyWidth = _$this.$refs.tableWrapper.scrollWidth;
                }
                _$this.bodyWidth = 0 == _$this.bodyWidth ? 0 : (_$this.bodyWidth - 1);

                console.log(_$this.bodyWidth);
                let _getAllColumnsWidth = _$this.getAllColumnsWidth;
                let _getUnFixedWidth = _$this.getUnFixedWidth;
                _$this.hiddenVerticalScroll = (_$this.bodyWidth > _getAllColumnsWidth);
                console.log(_$this.hiddenVerticalScroll);
                if (_$this.hiddenVerticalScroll)
                {
                    //如果长度超过设定宽度，调整列宽度
                    console.log(_$this.bodyWidth);
                    console.log(_getAllColumnsWidth);
                    let _defWidth = _$this.bodyWidth - _getAllColumnsWidth;
                    let _lessWidth = _defWidth;
                    console.log(_defWidth);
                    for (let _c = 0; _c < _$this.columnsConfig.length; _c++)
                    {
                        let _col = _$this.columnsConfig[_c];
                        if (_col.fixed != 'right' && _col.fixed != 'left')
                        {
                            let _w = parseInt(_col.cWidth ? _col.cWidth.replace('px', '') : _col.width);
                            let _w2 = parseInt(_w / _getUnFixedWidth * _defWidth);
                            console.log(_w2);
                            _col.width = _w + (_lessWidth > _w2 ? _w2 : _lessWidth);
                            _lessWidth -= _w2;
                            _col.cWidth = `${_col.width}px`;
                            console.log(_col.cWidth);
                        }
                    }
                    console.log(getColumnsWidth(_$this.columnsConfig));
                    //Vue.set(_$this.columnsConfig, _$this.columnsConfig);
                }

                //console.log(_$this.$refs.tableHeader.offsetWidth);
                //console.log(_$this.$refs.tableHeader.clientWidth);

                _$this.bodyVisable = !!_$this.$refs.tableHeader;
            }
        },
        mounted: function ()
        {
            let _$this = this;

            _$this.handleResize();
            //////_$this.$nextTick(() => _$this.ready = true);

            //on(window, 'resize', _$this.handleResize);
            //_$this.observer = elementResizeDetectorMaker();
            //_$this.observer.listenTo(_$this.$el, _$this.handleResize);

            //_$this.$on('on-visible-change', (val) =>
            //{
            //    if (val)
            //    {
            //        _$this.handleResize();
            //    }
            //});
        },
        beforeDestroy()
        {
            //off(window, 'resize', this.handleResize);
            //this.observer.removeListener(this.$el, this.handleResize);
        }
    };


    const isServer = Vue.prototype.$isServer;
    /* istanbul ignore next */
    const on = (function ()
    {
        if (!isServer && document.addEventListener)
        {
            return function (element, event, handler)
            {
                if (element && event && handler)
                {
                    element.addEventListener(event, handler, false);
                }
            };
        } else
        {
            return function (element, event, handler)
            {
                if (element && event && handler)
                {
                    element.attachEvent('on' + event, handler);
                }
            };
        }
    })();

    /* istanbul ignore next */
    const off = (function ()
    {
        if (!isServer && document.removeEventListener)
        {
            return function (element, event, handler)
            {
                if (element && event)
                {
                    element.removeEventListener(event, handler, false);
                }
            };
        } else
        {
            return function (element, event, handler)
            {
                if (element && event)
                {
                    element.detachEvent('on' + event, handler);
                }
            };
        }
    })();
</script>
<style>
    @import "../styles/iconfont.css" 
</style>
<style>

    .c-table-fiexed-right,
    .c-table-fiexed-right:after,
    .c-table-fiexed-right:before {
        box-shadow: -2px 0 6px -2px rgba(0,0,0,.2);
    }

    .c-table-fiexed-left,
    .c-table-fiexed-left:after,
    .c-table-fiexed-left:before {
        box-shadow: 2px 0 6px -2px rgba(0,0,0,.2);
    }

    ul {
        padding-left: 0;
        margin: 0;
    }

        ul > li {
            padding-left: 0;
            margin: 0;
            list-style: none;
        }

    .c-table-wrapper {
        width: inherit;
        overflow: hidden;
        font-size: 12px;
        border: 0px solid #dddddd;
        border-right-width: 1px;
    }

    .c-table-wrapper__header-wrapper {
        width: 100%;
        border: 1px solid #dddddd;
        border-bottom: 0;
        /*隐藏超过表体宽度的列*/
        overflow-x: hidden;
    }

    .c-table-wrapper__body-wrapper {
        overflow-y: scroll;
        /*width: 100%;*/
        border: 1px solid #dddddd;
    }

    .c-table-wrapper__header-wrapper,
    .c-table-wrapper__body-wrapper {
        display: flex;
        flex-direction: column;
    }

    .c-table-header__record,
    .c-table-body__record {
        display: flex;
    }

    .c-table-header__record {
        padding-right: 0px;
        /* padding-right: 17px; */
    }

    .c-table-header-column,
    .c-table-body-column {
        display: flex;
        align-items: center;
        border-right: 1px solid #dddddd;
        padding-left: 6px;
        overflow: hidden;
        white-space: nowrap;
        flex: 1 1 auto;
    }

    .c-table-header-column__container,
    .c-table-body-column__container {
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .c-table-body__record {
        border-bottom: 1px solid #dddddd;
    }

    .c-table-body-container:last-child .c-table-body__record {
        /*border-bottom: 0;*/
    }

    .c-table-header__default {
        background-color: #f8f8f9;
        color: #495060;
        font-size: 12px;
        font-weight: 700;
    }
</style>
