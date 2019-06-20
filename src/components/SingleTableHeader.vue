<template>
  <ul class='c-table-header__record' :style='getHeaderStyle'>
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
</template>

<script>
  import RenderHeader from './tableHelper/expand';
  import {ID_NAME} from './tableHelper/constant';

  export default {
    name: 'SingleTableHeader',
    components: {RenderHeader},
    props: {
      columnsConfig: Array,
      height: Number,
      virtualScrollData: {
        type: Object,
        default: {
          scrollTop: 0,
          scrollLeft: 0
        }
      }
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
