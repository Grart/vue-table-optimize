<template>
    <section ref="tableHeader"
             class='c-table-wrapper__header-wrapper'
             :class='headerClass'>
        <div :style='getHeaderShowStyle'>
            <div :style='{width:(unFixedWidth+fixedLeftWidth + fixedRightWidth)+"px"}'>

                <div :style='getHeaderWrapperStyle'>
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
                                <render-header v-else
                                               :render='column.renderHeader'
                                               :column='column'
                                               :column-index='index'></render-header>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    </section>

</template>

<script lang="ts">
    import RenderHeader from './tableHelper/expand';
    import { ID_NAME } from './tableHelper/constant';

    export default {
        name: 'SingleTableHeader',
        components: { RenderHeader },
        props: {
            fixedLeftWidth: Number,
            fixedRightWidth: Number,
            unFixedWidth: Number,
            viewportWidth: Number,
            columnsConfig: Array,
            height: Number,
            scrollSynclData: Object,
            headerClass: {
                type: String,
                default: 'c-table-header__default'
            },
        },
        data()
        {
            return {
                cIdKey: ID_NAME,
                headerShowWidth: 0
            };
        },
        computed: {
            getHeaderStyle: function ()
            {
                //表体宽度
                let _bodyWidht = 0;
                let _cfg = this.columnsConfig;
                for (let _c = 0; _c < _cfg.length; _c++)
                {
                    let _col = _cfg[_c];
                    _bodyWidht += parseInt(_col.cWidth ? _col.cWidth.replace('px', '') : _col.width);
                }
                let _translateX = `translateX(${-this.scrollSynclData.scrollLeft}px)`;
                return {
                    'transform': _translateX,
                    'height': `${this.height}px`,
                    'width': `${_bodyWidht}px`
                };
            },
            getHeaderWrapperStyle: function ()
            {
                return {
                    'margin-left': `${this.fixedLeftWidth}px`,//左右固定的那些列是不显示的
                    'margin-right': `${this.fixedRightWidth}px`,
                    'width': `${this.unFixedWidth}px`,//表体宽度
                    'position': 'relative',
                    //"border-bottom": this.renderData.length > 0 ? "1px solid #dddddd" : ""
                };
            },
            getHeaderShowStyle: function ()
            {
                //如果存在右冻结列需要减去滚动条宽度，用于拦住滚动后的列头
                let _$this = this;
                console.log('fixedRightWidth=',_$this.fixedRightWidth);
                let _width = _$this.headerShowWidth;
                
                return {
                    'width': _$this.fixedRightWidth > 0 && 0 != _width ? `${_width - 16}px` : 'inherit',
                    'overflow': 'hidden'
                }
            },
        },
        methods: {
            getColumnStyle: function (column)
            {
                return {
                    width: column.cWidth,
                    height: `${this.height}px`,
                };
            },
        },
        mounted: function (
        )
        {
            let _$this = this;
            _$this.$nextTick(
                () =>
                {
                    let _width = 0;
                    let _tableWraper = _$this.$refs.tableHeader as HTMLElement;
                    if (_tableWraper)
                    {
                        _width = _tableWraper.clientWidth;//tableHeader
                        if (0 == _width)
                        {
                            _width = _tableWraper.scrollWidth;
                        }
                    }
                    _$this.headerShowWidth = _width;
                }
            );
        },
    };
</script>

