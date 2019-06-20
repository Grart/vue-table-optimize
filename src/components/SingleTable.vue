<template>
  <article class='c-table-wrapper'
           :style='{width: getHeaderWidth,position:"relative"}'>
    <section class='c-table-wrapper__header-wrapper'
             :class='headerClass'
             :style='{width: bodyWidth+"px"}'
             ref='tableHeader'>
      <div :style='{width: getHeaderColumnWidth,"overflow-x":"hidden","overflow-y":"hidden"}'>
        <table-header :columns-config='columnsConfig'
                      :height='headerHeight'
                      :virtual-scroll-data="virtualScrollData"></table-header>
      </div>
    </section>
    <virtual-scroll-table-body :data='data'
                               :record-key='recordKey'
                               :columns-config='columnsConfig'
                               :item-height='recordHeight'
                               :viewport-height='bodyHeight'
                               :viewport-width='bodyWidth'
                               :virtual-scroll-data="virtualScrollData"
                               @on-refresh-virtual-items='onRefreshVirtualItems'>
    </virtual-scroll-table-body>

    <section :style='getFloatRightStyle' class="fiexedRight">
      <section class='c-table-wrapper__header-wrapper'
               :class='headerClass'
               :style='{width: getFixedColumnsWidth+"px"}'
               ref='tableHeader'>
        <table-fixed-header
          :columns-config='getFixedColumnsConfig'
          :columns-width="getFixedColumnsWidth"
          :height='headerHeight'
          :virtual-scroll-data="virtualScrollData">
        </table-fixed-header>
      </section>

      <virtual-scroll-table-fixed-body
          :virtual-items='virtualItems'
          :record-key='recordKey'
          :columns-config='getFixedColumnsConfig'
          :item-height='recordHeight'
          :body-height='getBodyHeigth'
          :viewport-height='bodyHeight'
          :viewport-width='getFixedColumnsWidth'
          :virtual-scroll-data="virtualScrollData">
      </virtual-scroll-table-fixed-body>
    </section>
  </article>
</template>

<script>
  import TableHeader from './SingleTableHeader';
  import TableFixedHeader from './SingleTableFixedHeader';
  import TableBody from './SingleTableBody';
  import RequestAnimationFrameTableBody from './RequestAnimationFrameTableBody';
  import VirtualScrollTableBody from './VirtualScrollTableBody';
  import VirtualScrollTableFixedBody from './VirtualScrollTableFixedBody';

  export default {
    components: {
      TableHeader,
      TableFixedHeader,
      TableBody,
      RequestAnimationFrameTableBody,
      VirtualScrollTableBody,
      VirtualScrollTableFixedBody,
    },
    name: 'SingleTable',
    props: {
      columnsConfig: Array,
      data: Array,
      recordKey: String,
      headerHeight: Number,
      bodyHeight: Number,
      bodyWidth: Number,
      recordHeight: Number,
      renderType: String,
      headerClass: String,
    },
    data () {
      return {
        //滚动条同步对像,body通过这个对像将同步信息传给header
        virtualScrollData: {
          scrollTop: 0,
          scrollLeft: 0,
          scrollbarWidth: 16,
          offsetWidth: 0
        },
        virtualItems: {
          renderData: [],
          newItems: [],
          replaceItemsIndex: 0
        }
      };
    },
    computed: {
      getColumnsConfig: function ()
      {
        if (!this.columnsConfig)
        {
          return [];
        }
        return this.columnsConfig.filter(
          m => m.fixed != 'right' && m.fixed != 'left'
        );
      },
      getFixedColumnsConfig: function ()
      {
        if (!this.columnsConfig)
        {
          return [];
        }
        return this.columnsConfig.filter(
          m => m.fixed == 'right'
        );
      },
      getFixedColumnsWidth: function ()
      {
        let _bodyWidth = 0;
        let _cfg = this.getFixedColumnsConfig;
        for (let _c = 0; _c < _cfg.length; _c++)
        {
          let _col = _cfg[_c];
          _bodyWidth += parseInt(_col.cWidth ? _col.cWidth.replace('px', '') : _col.width);
        }
        return _bodyWidth;
      },
      getBodyHeigth: function ()
      {
        return this.data.length * this.recordHeight;
      },
      getHeaderWidth: function ()
      {
        return `${(this.virtualScrollData ? this.virtualScrollData.offsetWidth : this.bodyWidth)}px`;
      },
      getHeaderColumnWidth: function ()
      {
        return `${(this.virtualScrollData ? this.virtualScrollData.offsetWidth : this.bodyWidth) - this.virtualScrollData.scrollbarWidth - 4}px`;
      },
      getFloatRightStyle: function ()
      {
        return {
          top: `${0}px`,
          right: `${this.virtualScrollData.scrollbarWidth + 1}px`,
          width: `${this.getFixedColumnsWidth}px`,
          height: `${this.bodyHeight + this.headerHeight - this.virtualScrollData.scrollbarWidth + 2}px`,
          position: 'absolute',//顶层要用position: relative;
          'background-color': 'ghostwhite',
          "overflow-x": "hidden",
          "overflow-y": "hidden",
          'box-sizing':'order-box'
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
      showRender: function (type) {
        return this.renderType === type;
      },
      onRefreshVirtualItems: function (renderData)
      {
        this.virtualItems = { renderData };
      }
    },
  };
</script>

<style>
  .fiexedRight,
  .fiexedRight:after,
  .fiexedRight:before {
    box-shadow: -2px 0 6px -2px rgba(0,0,0,.2);
  }

  .fiexedLeft,
  .fiexedLeft:after,
  .fiexedLeft:before {
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
    overflow-x: scroll;
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
    padding-right: 17px;
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
    border-bottom: 0;
  }

  .c-table-header__default {
    background-color: #f8f8f9;
    color: #297EA3;
    font-weight: bold;
    font-size: 14px;
  }

</style>
