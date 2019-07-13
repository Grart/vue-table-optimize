<template>
    <div id='app'>
        <nav class='left'>
            <h1>Body Render</h1>
            <ul>
                <li><a class='menu-link' :class='{active: commonLinkActive}' href='#/'>Common Body</a></li>
                <li><a class='menu-link' :class='{active: rafLinkActive}' href='#/requestAnimationFrame'>RequestAnimationFrame</a></li>
                <li><a class='menu-link' :class='{active: virtualLinkActive}' href='#/virtualScroll'>Virtual Scroll</a></li>
                <li><a class='menu-link' :class='{active: componentTestLinkActive}' href='#/componentTest'>Component Test</a></li>
            </ul>
        </nav>
        <article class='right'>
            <router-view />
        </article>
    </div>
</template>

<script lang="ts">
    export default {
        name: 'App',
        data()
        {
            return this.initLinkStatus();
        },
        methods: {
            initLinkStatus: function ()
            {
                let _pathAry = ["", "requestAnimationFrame", "virtualScroll", "componentTest"];
                let _path = this.$route.path;
                _path = _path.substring(_path.lastIndexOf('/') + 1);
                console.log(_path);
                let [commonLinkActive, rafLinkActive, virtualLinkActive, componentTestLinkActive] = _pathAry.map((val) => val == _path);
                return {
                    commonLinkActive: commonLinkActive,
                    rafLinkActive: rafLinkActive,
                    virtualLinkActive: virtualLinkActive,
                    componentTestLinkActive: componentTestLinkActive
                }
            },
            updateLinkStatus: function (to, from)
            {
                this.$nextTick(
                    () =>
                    {
                        let _status = this.initLinkStatus();
                        for (let _key in _status)
                        {
                            this[_key] = _status[_key];
                        }

                    });
            }
        },
        mounted: function ()
        {
            globalAppVmThis = this;
            if (-1 == this.$router.afterHooks.indexOf(globalRouterHook))
            {
                this.$router.afterEach(
                    globalRouterHook
                );
                console.log(this.$router.afterHooks);
            }

        }
    };
    let globalAppVmThis;
    function globalRouterHook(to, from)
    {
        globalAppVmThis && globalAppVmThis.updateLinkStatus();
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
        display: flex;
    }

    .left {
        width: 140px;
    }

        .left ul {
            padding-left: 0;
            margin: 0;
        }

            .left ul li {
                text-align: left;
                padding: 2px;
                float: right;
            }

    .menu-link {
        font-size: 12px;
        padding: 4px 10px;
        text-decoration: none;
        color: #767676;
    }

        .menu-link.active {
            color: #297EA3;
            font-weight: bold;
            border-right: 2px solid #297EA3;
        }

        .menu-link:hover {
            color: #297EA3;
            border-right: 1px solid #297EA3;
        }

    .right {
        flex: 1 1 auto;
    }
</style>
