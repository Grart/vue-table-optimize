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
    import _Vm from './SingleTable.Vm'
    export default _Vm;
</script>
<style>
    @import "../styles/iconfont.css";
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
