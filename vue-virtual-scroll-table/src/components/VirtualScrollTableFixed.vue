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
                          :virtual-scroll-data="virtualScrollData">
      </virtual-scroll-table-fixed-header>
    </section>

    <virtual-scroll-table-fixed-body :virtual-items='virtualItems'
                                     :record-key='recordKey'
                                     :columns-config='columnsConfig'
                                     :item-height='itemHeight'
                                     :body-height='bodyHeight'
                                     :viewport-height='fixedHeight'
                                     :viewport-width='fixedWidth'
                                     :virtual-scroll-data="virtualScrollData">
    </virtual-scroll-table-fixed-body>
  </section>
</template>

<script>
  import _ from 'lodash';
  import VirtualScrollTableFixedHeader from './VirtualScrollTableFixedHeader';
  import VirtualScrollTableFixedBody from './VirtualScrollTableFixedBody';

  export default {
    name: 'VirtualScrollTableFixed',
    components: { VirtualScrollTableFixedHeader, VirtualScrollTableFixedBody},
    props: {
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
      virtualScrollData: {
        type: Object,
        default: {
          scrollTop: 0,
          scrollLeft: 0,
          scrollbarWidth: 16,
          offsetWidth: 0
        }
      }
    },
    data () {
      return {
      };
    }
  };
</script>
