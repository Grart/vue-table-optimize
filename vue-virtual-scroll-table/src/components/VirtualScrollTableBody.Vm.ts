import RenderBody from './tableHelper/expand';
import { VIRTUAL_REMAIN_COUNT } from './tableHelper/constant';
import _ from 'lodash';
import { calDomItemsHeight } from './tableHelper/tableUtil';
type VmThis = VmProps & VmWatch & VmMethods & VmData & VmComputed;
class VmProps
{
	hiddenVerticalScroll = Boolean as any as boolean;
	columnsConfig = Array as any as any[];
	data= Array as any as any[];
	recordKey = String as any as string;
	fixedLeftWidth = Number as any as number;
	fixedRightWidth = Number as any as number;
	unFixedWidth = Number as any as number;
	itemHeight = Number as any as number;
	viewportHeight = Number as any as number;
	viewportWidth = Number as any as number;
	scrollSynclData = Object as any as ScrollSynclData;
}
class VmWatch
{
	data = {
		handler: function (
			this: VmThis,
			val
		)
		{
			this.virtualData = _.cloneDeep(val);
			this.refreshRenderData();
		},
		immediate: true,
		deep: true,
	}
}
class VmData
{
	constructor(
		vmThis: VmThis
	)
	{
		const renderItems = Math.ceil(vmThis.viewportHeight / vmThis.itemHeight) + 2 * VIRTUAL_REMAIN_COUNT;
		this.remainHeight = VIRTUAL_REMAIN_COUNT * vmThis.itemHeight;
		this.renderItems = renderItems;
		this.renderItemsHeight = renderItems * vmThis.itemHeight;
	}
	virtualData= {} as any as any[];
	renderData= [];
	minItemKeyHeight= -1;
	maxItemKeyHeight= -1;
	remainHeight:number;
	renderItems: number;
	renderItemsHeight: number;

}
class VmComputed
{
	getTableWrapperStyle = function (
		this: VmThis
		)
	{
		console.log(this.hiddenVerticalScroll);
		return {
			height: `${this.viewportHeight}px`,
			width: `${this.viewportWidth}px`,
			'overflow-x': this.hiddenVerticalScroll ? 'hidden' : 'scroll'//hidden

		};
	};
	getRecordHeight = function (
		this: VmThis
		)
	{
		return `${this.itemHeight}px`;
	};
	getBodyWrapperStyle = function (
		this: VmThis
		)
	{
		return {
			'margin-left': `${this.fixedLeftWidth}px`,//左右固定的那些列是不显示的
			'margin-right': `${this.fixedRightWidth}px`,
			height: `${this.data.length * this.itemHeight}px`,
			width: `${this.unFixedWidth}px`,//表体宽度
			position: 'relative',
			//"border-bottom": this.renderData.length > 0 ? "1px solid #dddddd" : ""
		};
	};
}

class VmMethods
{
	handleRowClick = function (
		this: VmThis,
		record
	)
	{
		let _vkey = record.__vkey;
		this.scrollSynclData.clicked_vkey = _vkey;
		console.log('click', _vkey, JSON.stringify(record));
		this.$emit('on-row-click', JSON.parse(JSON.stringify(record)), _vkey);
	};
	handleRowDblClick = function (
		this: VmThis,
		record
	)
	{
		let _vkey = record.__vkey;
		console.log('dblClick');
		this.$emit('on-row-dblclick', JSON.parse(JSON.stringify(record)), _vkey);
	};
	handleMouseIn = function (
		this: VmThis,
		vkey
	)
	{
		this.scrollSynclData.focus_vkey = vkey;
	};
	handleMouseOut = function (
		this: VmThis,
		vkey
	)
	{
		this.scrollSynclData.focus_vkey = -1;
	};
	getColumnStyle = function (
		this: VmThis,
		column
	)
	{
		return {
			width: column.cWidth,
			height: `${this.itemHeight}px`
		};
	};
	buildRenderData = function (
		this: VmThis,
		minHeight,
		maxHeight
	)
	{
		const minItemKey = minHeight / this.itemHeight;
		const maxItemKey = maxHeight / this.itemHeight;
		const startIndex = minItemKey > 0 ? minItemKey : -1;
		const endIndex = maxItemKey > this.virtualData.length ? this.data.length : maxItemKey;
		const renderData = [];
		for (let index = startIndex + 1; index < endIndex; index++)
		{
			const item = this.virtualData[index];
			const recordIndexHight = `${index * this.itemHeight}`;
			item.__vkey = index;
			item.translateY = `${recordIndexHight}px`;
			renderData.push(item);
		}
		return renderData;
	};
	getRowContainerStyle = function (
		this: VmThis,
		record
	)
	{
		let _isHover = this.scrollSynclData.focus_vkey == record.__vkey
			|| this.scrollSynclData.clicked_vkey == record.__vkey;
		let _color = _isHover ? "#ebf7ff" : "";
		return {
			transform: `translateY(${record.translateY})`,
			height: `${this.itemHeight}px`,
			'background-color': _color,
			'margin-top': _isHover ? "-1px" : "",
			'border-top': _isHover ? "1px solid #dddddd" : ""//背景会挡住上一行的下边框显示
		};
	};
	buildNewItems = function (
		this: VmThis,
		newData
	)
	{
		const newItems = [];
		for (const newRecord of newData)
		{
			if (_.findIndex(this.renderData, { __vkey: newRecord.__vkey }) < 0)
			{
				newItems.push(newRecord);
			}
		}
		return newItems;
	};
	buildOutDateItems = function (
		this: VmThis,
		newData
	)
	{
		const replaceItemsIndex = [];
		for (let index = 0; index < this.renderData.length; index++)
		{
			const record = this.renderData[index];
			if (_.findIndex(newData, { __vkey: record.__vkey }) < 0)
			{
				replaceItemsIndex.push(index);
			}
		}
		return replaceItemsIndex;
	};
	refreshVirtualItems = function (
		this: VmThis,
		newItems,
		replaceItemsIndex
	)
	{
		if (newItems.length === this.renderData.length)
		{
			this.renderData = newItems;
			return;
		}
		for (let index = 0; index < newItems.length; index++)
		{
			if (index < replaceItemsIndex.length)
			{
				this.$set(this.renderData, replaceItemsIndex[index], newItems[index]);
				continue;
			}
			this.renderData.push(newItems[index]);
		}
	};
	updateRenderData = function (
		this: VmThis,
		newData
	)
	{
		let newItems = [];
		let replaceItemsIndex = [];
		if (this.renderData.length === 0)
		{
			this.renderData = newData;
		}
		else
		{
			newItems = this.buildNewItems(newData);
			replaceItemsIndex = this.buildOutDateItems(newData);
			this.refreshVirtualItems(newItems, replaceItemsIndex);
		}
		this.scrollSynclData.virtualItems = { renderData: this.renderData };
		//this.$emit(
		//    'on-refresh-virtual-items',
		//    this.renderData
		//);
	};
	refreshRenderData = function (
		this: VmThis
		)
	{
		const virtualScrollBody = this.$refs.virtualScrollBody;
		const scrollTop = virtualScrollBody ? virtualScrollBody.scrollTop : 0;
		const scrollLeft = virtualScrollBody ? virtualScrollBody.scrollLeft : 0;
		const [minItemHeight, maxItemHeight] = calDomItemsHeight(
			this.itemHeight,
			this.remainHeight,
			this.viewportHeight,
			this.renderItemsHeight,
			scrollTop
		);
		this.updateRenderData(
			this.buildRenderData(minItemHeight, maxItemHeight)
		);
		this.scrollSynclData.scrollTop = scrollTop;
		this.scrollSynclData.scrollLeft = scrollLeft;
		this.scrollSynclData.scrollbarWidth = virtualScrollBody
			//https://www.cnblogs.com/panjun-Donet/articles/1294033.html
			? (virtualScrollBody.offsetWidth - virtualScrollBody.clientWidth - 2 * virtualScrollBody.clientLeft)
			: 16;
		this.scrollSynclData.offsetWidth = virtualScrollBody ? virtualScrollBody.offsetWidth : (this.viewportWidth + 2);

	};
	onVirtualScroll = function (
		this: VmThis,
		e
	)
	{
		let _$this = this;
		window.requestAnimationFrame(_$this.refreshRenderData);


		//if (!_$this.throttleVirtualScroll)
		//{
		//    _$this.throttleVirtualScroll = throttle(
		//        () =>
		//        {
		//            console.log(+new Date());
		//            _$this.refreshRenderData();
		//        },
		//        125
		//    );
		//}
		//_$this.throttleVirtualScroll();
	};
}

export default {
	name: 'VirtualScrollTableBody',
	components: { RenderBody },
	props: new VmProps(),
	watch: new VmWatch(),
	data()
	{
		return new VmData(this);
	},
	computed: new VmComputed(),
	methods: new VmMethods(),
};


///**
// * 节流函数
// */
//function throttle(fn, delay)
//{
//    let _timer = null
//    let _previous = null
//    return function ()
//    {
//        let _now = +new Date()
//        if (null == _previous)
//        {
//            _previous = _now;
//            fn();
//        }
//        else
//        {
//            let _delay = _now - _previous;
//            console.log(_delay);
//            if (_delay < delay)
//            {
//                _timer = setTimeout(
//                    function ()
//                    {
//                        _previous = _now;
//                        fn();
//                        _timer = null;
//                    },
//                    delay - _delay
//                );
//            }
//            else
//            {
//                _previous = _now;
//                fn();
//            }
//        }
//    }
//}