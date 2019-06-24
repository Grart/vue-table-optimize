<template>
  <!--表格左右固定列表体-->
  <section class='c-table-wrapper__body-wrapper c-table-body-wrapper__virtual'
           :style='{height: getBodyHeight,width:getBodyWidth,"overflow-x":"hidden","overflow-y":"hidden","border": "1px solid #dddddd"}'>
    <div :style='getBodyWrapperStyle'>
      <div class='c-table-body-container c-table-body-container__virtual'
           v-for='record in renderData'
           :key='record[recordKey]'
           :style='getBodyContainerStyle(record)'>
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

<script>
  import RenderBody from './tableHelper/expand';
  import {VIRTUAL_REMAIN_COUNT} from './tableHelper/constant';
  import _ from 'lodash';
  import {calDomItemsHeight} from './tableHelper/tableUtil';

  export default {
    name: 'VirtualScrollTableFixedBody',
    components: {RenderBody},
    props: {
      columnsConfig: Array,
      virtualItems: Object,
      recordKey: String,
      itemHeight: Number,
      bodyHeight: Number,
      viewportHeight: Number,
      viewportWidth: Number,
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
    watch: {
      virtualItems: {
        handler: function (val)
        {
          this.renderData = _.cloneDeep(val.renderData);
        },
        immediate: true,
        deep: true,
      },
    },
    data () {
      return {
        renderData: [],
      };
    },
    computed: {
      getRecordHeight: function () {
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
          transform: `translateY(${-this.virtualScrollData.scrollTop}px)`,
          height: `${this.bodyHeight}px`,
          width: `${this.viewportWidth}px`,
          position: 'relative',
          //"border-bottom": this.renderData.length > 0 ? "1px solid #dddddd" : ""
        };
      },
    },
    methods: {
      getColumnStyle: function (column) {
        return {
          width: column.cWidth,
          height: `${this.itemHeight}px`
        };
      },
      getBodyContainerStyle: function (record)
      {
        return {
          transform: `translateY(${record.translateY})`,
          height: `${this.itemHeight}px`
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
