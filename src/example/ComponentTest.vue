<template>
    <div>
        <div>
            <h2>GRART</h2>
        </div>
        <div>
            <input type="text" v-model="name" />
        </div>
        <cmp1 :name="name">
        </cmp1>
        <!--<cmp2>
    </cmp2>-->
        <button @click="onCreate">create</button>

        <button @click="onDestroy">destroy</button>



        <hr />
        <br />
        <br />
        <br />
        <br />
        <simp-table :data="data"
                    :columns="columns"
                    :keyField="keyField">
        </simp-table>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import result from './data/schedule';
    import SimpTable from './SimpTable';
    const _Dict = {};
    const _colAry = [
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
                            placeholder: "ÇëÊäÈë",
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
    ];
    let _cmp1_id = 1;
    const cmp1 = {
        data() {
            return {
                val: 1
            }
        },
        props: {
            name: String
        },
        render: function (h, params) {
            let _$this = this;
            _Dict[_$this] = 1;

            console.log(_Dict);
            let _d = _cmp1_id++;
            console.log(`render cmp1 [${_$this.name}]`, _$this);
            return h(
                "div",
                {
                    on: {
                        click: function (e) {
                            console.log(_d);
                            _$this.val++;
                        }
                    }
                },
                `${_$this.name}:${_$this.val}`
            );
        },
        mounted: function () {
            console.log('mounted cmp1');
        }
    };

    const cmp2 = {
        data() {
            return {
                val: 1
            }
        },
        render: function (h, params) {
            let _$this = this;
            console.log(`render cmp2 [${_$this.name}]`, _$this);
            return h(
                "div",
                {
                },
                [
                    h(
                        "button",
                        {
                            on: {
                                click: function (e) {
                                    _$this.val++;
                                }
                            }
                        },
                        "Cmp2 - " + _$this.val
                    ),
                    h(
                        cmp1,
                        {
                            props: {
                                name: "A" + _$this.val
                            }
                        }
                    ),
                    h(
                        cmp1,
                        {
                            props: {
                                name: "B" + _$this.val
                            }
                        }
                    ),
                    h(
                        cmp1,
                        {
                            props: {
                                name: "C" + _$this.val
                            }
                        }
                    ),
                ]
            );
        },
        mounted: function () {
            console.log('mounted cmp2');
        }
    };


    let _cmpInstance = null;
    let _el: HTMLElement = null;

    export default {
        name: 'VirtualScrollTable',
        components: { cmp1, cmp2, SimpTable },
        data() {
            return {
                name:'grart',
                data: result,
                columns: _colAry,
                keyField: '_id'
            };
        },
        methods: {
            onCreate: function () {
                if (null == _el) {
                    _el = document.createElement('div');
                    document.body.append(_el);
                }
                if (null == _cmpInstance) {
                    _cmpInstance = new InnerVueCls(
                        {
                            propsData: {
                                data: result,
                                columns: _colAry,
                                pageCount: 20
                            }
                        });
                    _cmpInstance.$mount();
                    _el.append(_cmpInstance.$el);
                    console.log(_cmpInstance);
                }

            },
            onDestroy: function () {

                if (null != _cmpInstance) {
                    let _el = _cmpInstance.$el;
                    if (_el.remove) {
                        console.log('remove');
                        _el.remove();
                    }
                    else if (_el.parentNode && _el.parentNode.removeChild) {
                        console.log('removeChild');
                        _el.parentNode.removeChild(_el);
                    }
                    _el.remove();
                    _el = null;
                    _cmpInstance.$destroy();
                    _cmpInstance = null;
                }
            }
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

    .ivu-poptip-popper{
        width:500px;
        height:400px;
        overflow:hidden;
        font-size:12px;
    }

    .ivu-poptip-popper td,
    .ivu-poptip-popper th{
        border-width:0.3px;
        border-style:solid;
        padding:5px;
    }
</style>
