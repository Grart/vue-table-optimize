<template>
    <div>
        <div>
            <h2>GRART</h2>
        </div>
        <div>
            <input type="checkbox" />
        </div>
        <!--<cmp1>
        </cmp1>-->
        <cmp2>
        </cmp2>
    </div>
</template>

<script lang="ts">

    const cmp1 = {
        data()
        {
            return {
                val: 1
            }
        },
        props: {
            name: String
        },
        render: function (h, params)
        {
            let _$this = this;
            console.log('render cmp1',_$this);
            return h(
                "div",
                {
                    on: {
                        click: function (e)
                        {
                            _$this.val++;
                        }
                    }
                },
                `${_$this.name}:${_$this.val}`
            );
        },
        mounted: function ()
        {
            console.log('mounted cmp1');
        }
    };


    const cmp2 = {
        data()
        {
            return {
                val: 1
            }
        },
        render: function (h, params)
        {
            let _$this = this;
            console.log('render cmp2');
            return h(
                "div",
                {
                },
                [
                    h(
                        "button",
                        {
                            on: {
                                click: function (e)
                                {
                                    _$this.val++;
                                }
                            }
                        },
                        "Cmp2 - "+_$this.val
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
        mounted: function ()
        {
            console.log('mounted cmp2');
        }
    };
    export default {
        name: 'VirtualScrollTable',
        components: {cmp1, cmp2},
        data()
        {
            return {
            };
        },
        methods: {
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
