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
    import _Vm from './VirtualScrollTableBody.Vm'
    export default _Vm;

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
