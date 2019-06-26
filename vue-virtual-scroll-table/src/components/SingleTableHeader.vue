<template>
  <section class='c-table-wrapper__header-wrapper'
           :class='headerClass'>
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
              <render-header v-else :render='column.renderHeader' :column='column' :index='index'></render-header>
            </div>
          </li>
        </ul>
      </div>
      </div>
</section>

</template>

<script>
  import RenderHeader from './tableHelper/expand';
  import {ID_NAME} from './tableHelper/constant';

  export default {
    name: 'SingleTableHeader',
    components: {RenderHeader},
    props: {
      fixedLeftWidth: Number,
      fixedRightWidth: Number,
      unFixedWidth: Number,
      viewportWidth: Number,
      columnsConfig: Array,
      height: Number,
      virtualScrollData: {
        type: Object,
        default: {
          scrollTop: 0,
          scrollLeft: 0
        }
      },
      headerClass: {
        type: String,
        default: 'c-table-header-default'
      },
    },
    data () {
      return {
        cIdKey: ID_NAME,
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
        let _translateX = `translateX(${-this.virtualScrollData.scrollLeft}px)`;
        return {
          transform: _translateX,
          height: `${this.height}px`,
          width: `${_bodyWidht}px`
        };
      },
      getHeaderWrapperStyle: function ()
      {
        return {
          'margin-left': `${this.fixedLeftWidth}px`,//左右固定的那些列是不显示的
          'margin-right': `${this.fixedRightWidth}px`,
          width: `${this.unFixedWidth}px`,//表体宽度
          position: 'relative',
          //"border-bottom": this.renderData.length > 0 ? "1px solid #dddddd" : ""
        };
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
  };
</script>

<style scoped>

</style>
