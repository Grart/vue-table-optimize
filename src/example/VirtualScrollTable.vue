<template>
    <div>
        <!--<vue-virtual-scroll-table :columns-config='tableTitle'
                  :data='result'
                  :table-width="1000"
                  render-type='VIRTUAL'
                  record-key='_id'
                  header-class='header-title__virtual'></vue-virtual-scroll-table>-->
        <vue-virtual-scroll-table :columns='tableTitle'
                                  ref="RefTable"
                                  :multi-selection="true"
                                  :data='result'
                                  record-key='_id'
                                  header-class='header-title__virtual'
                                  @on-selection-change="selectionChange">
            <p slot="footer">
                <span style="margin-right:32px;">开票金额汇总:111</span>
                <span style="margin-right:32px;">开票税额汇总:333</span>
                <span style="margin-right:32px;">价税合计汇总:444</span>
                <span style="margin-right:32px;">发票数量汇总:555</span>
            </p>
        </vue-virtual-scroll-table>
    </div>
</template>

<script lang="ts">
    import VueVirtualScrollTable from '../../vue-virtual-scroll-table'
    import result from './data/schedule';
    //const result = [{
    //    "_id": "5c515da6b4e01b32e8cdf5ed",
    //    "key": "122731837",
    //    "direction": "W",
    //    "from": "TEST1",
    //    "to": "TEST2",
    //    "actualDeparture": "2019-01-28 03:44",
    //    "planArrival": "2019-01-31 14:00",
    //    "coastalArrival": "2019-01-31 14:00",
    //    "predictArrival": "2019-01-31 13:00",
    //    "actualDelay": 0,
    //    "deviations": "no plan",
    //    "potentialDelay": 7,
    //    "status": "Normal"
    //}];
    //import VueVirtualScrollTable from '../index';
    import
    {
        displayColor,
        displayDelayContent,
    } from './util/renderUtil';

    const DESC = 'desc';
    const ASC = 'asc';
    const NO_MATCH_STOP = 'no matched';


    export default {
        name: 'VirtualScrollTable',
        components: { VueVirtualScrollTable},
        data()
        {
            return {
                result: result,
                tableTitle: [
                    {
                        title: 'Status',
                        sortable: true,
                        width: 140,
                        disableDrag: true,
                        fixed: 'left',
                        getSortValue: function (a)
                        {
                            const statusMapping = {
                                Normal: 1,
                                Warning: 2,
                                Urgent: 3,
                            };
                            return statusMapping[a];
                        },
                        key: 'status',
                        noNeedVertical: true,
                        enableEllipsis: true,
                    },
                    {
                        title: 'From',
                        width: 140,
                        sortable: true,
                        key: 'from',
                        enableEllipsis: true,
                        render: (h, params) =>
                        {
                            return h(
                                'Input',
                                {
                                    attrs: {
                                        placeholder: "请输入",
                                        value: params.row.from,
                                    },
                                    props: {
                                        type: 'text',
                                        size: 'small',
                                    },
                                    style: {
                                        width: '100px'
                                    },
                                    on: {
                                        'input': event =>
                                        {
                                            console.log(event);
                                            if (event.ctrlKey)
                                            {
                                                return true;
                                            }
                                            let _index = params.index;
                                            let _target = event.target;
                                            let _val = _target.value;
                                            if (params.row.from === _val)
                                            {
                                                return;
                                            }
                                            this.$nextTick(
                                                () =>
                                                {
                                                    let _row = params.row;
                                                    _row.from = _val;
                                                }
                                            );
                                        }
                                    }
                                }
                            );
                        },
                    },
                    {
                        title: 'Actual Departure',
                        width: 140,
                        sortable: true,
                        key: 'actualDeparture',
                        enableEllipsis: true,
                        index: 6,
                    },
                    {
                        title: 'To',
                        width: 140,
                        sortable: true,
                        key: 'to',
                        enableEllipsis: true,
                    },
                    {
                        title: 'Estimate Arrival',
                        width: 140,
                        sortable: true,
                        enableEllipsis: true,
                        key: 'planArrival',
                        index: 8,
                    },
                    {
                        title: 'Coastal Arrival',
                        width: 140,
                        sortable: true,
                        key: 'coastalArrival',
                        enableEllipsis: true,
                        index: 9,
                    },
                    {
                        title: 'Actual Delay(Hrs)',
                        width: 140,
                        sortable: true,
                        key: 'actualDelay',
                        index: 10,
                        enableEllipsis: true,
                        render: (h, params) =>
                        {
                            return h('div', [
                                h('p', {
                                    style: {
                                        color: displayColor(params.row.actualDelay),
                                    },
                                }, displayDelayContent(params.row.actualDelay)),
                            ]);
                        },
                    },
                    {
                        title: 'Predict Arrival',
                        width: 140,
                        sortable: true,
                        key: 'predictArrival',
                        index: 12,
                        enableEllipsis: true,
                        fixed: 'right'
                    },
                    {
                        title: 'Potential Delay(Hrs)',
                        width: 140,
                        sortable: true,
                        key: 'potentialDelay',
                        index: 13,
                        enableEllipsis: true,
                        fixed: 'right',
                        render: (h, params) =>
                        {
                            return h('div', [
                                h('p', {
                                    style: {
                                        color: displayColor(params.row.potentialDelay),
                                    },
                                }, displayDelayContent(params.row.potentialDelay)),
                            ]);
                        },
                    },
                ],
                defaultSortingFields: [
                    {
                        sortKey: 'actualDelay',
                        key: 'actualDelay',
                        dir: DESC,
                    },
                    {
                        sortKey: item => this.getDeviationsValue(item['deviations'], DESC),
                        key: 'deviations',
                        dir: DESC,
                    },
                    {
                        sortKey: 'ctEta',
                        key: 'ctEta',
                        dir: ASC,
                    },
                ],
            };
        },
        methods: {
            selectionChange: function (selectionArray)
            {
                console.log(typeof selectionArray =='function' ? selectionArray() : selectionArray);
                console.log(this.$refs.RefTable.getSelectionData());
            },
            getDeviationsValue: function (a, dir)
            {
                if (a === NO_MATCH_STOP)
                {
                    return dir === DESC ? -Number.MAX_VALUE : Number.MAX_VALUE;
                }
                return a ? parseFloat(a) : null;
            },
        }
    };
</script>

<style>
    .header-title__virtual {
        background-color: #f8f8f9;
        color: #495060;
        font-size: 14px;
        font-weight: bold;
    }
</style>
