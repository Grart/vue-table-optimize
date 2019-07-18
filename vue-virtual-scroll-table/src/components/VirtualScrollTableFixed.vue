<template>
    <!--表格左右固定列组件-->
    <section :style='fixedStyle'
             :class="tableFiexedClass">
        <section class='c-table-wrapper__header-wrapper'
                 :class='headerClass'
                 :style='{width: fixedWidth+"px"}'>
            <virtual-scroll-table-fixed-header :columns-config='columnsConfig'
                                               :columns-width="fixedWidth"
                                               :height='headerHeight'
                                               :scroll-syncl-data="scrollSynclData">
            </virtual-scroll-table-fixed-header>
        </section>

        <virtual-scroll-table-fixed-body :virtual-items='virtualItems'
                                         :table-owner="tableOwner"
                                         :record-key='recordKey'
                                         :columns-config='columnsConfig'
                                         :item-height='itemHeight'
                                         :body-height='bodyHeight'
                                         :viewport-height='fixedHeight'
                                         :viewport-width='fixedWidth'
                                         :scroll-syncl-data="scrollSynclData"
                                         :enable-select-style="enableSelectStyle">
        </virtual-scroll-table-fixed-body>
    </section>
</template>

<script lang="ts">
    import _ from 'lodash';
    import VirtualScrollTableFixedHeader from './VirtualScrollTableFixedHeader';
    import VirtualScrollTableFixedBody from './VirtualScrollTableFixedBody';

    export default {
        name: 'VirtualScrollTableFixed',
        components: { VirtualScrollTableFixedHeader, VirtualScrollTableFixedBody },
        props: {
            //主表体组件this
            tableOwner : Object,
            headerClass: String,
            tableFiexedClass: String,
            fixedStyle: Object,
            columnsConfig: Array,
            virtualItems: Object,
            recordKey: String,
            itemHeight: Number,
            headerHeight: Number,
            bodyHeight: Number,
            fixedHeight: Number,
            fixedWidth: Number,
            scrollSynclData: Object,
            //是否启用选中样式
            enableSelectStyle: {
                type: Boolean,
                default: false
            }
        },
        data()
        {
            return {
            };
        }
    };
</script>
