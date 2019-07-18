import RenderBody from './tableHelper/expand';
import { VIRTUAL_REMAIN_COUNT } from './tableHelper/constant';
import _ from 'lodash';
import { calDomItemsHeight } from './tableHelper/tableUtil';
import Vue from 'vue'
type VmThis = VmProps & VmWatch & VmMethods & VmData & VmComputed & Vue;
class VmProps
{
	//主表体组件this
	tableOwner = Object as any as Vue
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
			let _$this = this;
			_$this.renderData.splice(0, _$this.renderData.length);
			_$this.virtualData = _.cloneDeep(val);
			_$this.refreshRenderData();
			const _virtualScrollBody = _$this.$refs.virtualScrollBody as HTMLElement;
			if (_virtualScrollBody)
			{
				_$this.$nextTick(
					() =>
					{
						if (_virtualScrollBody.scrollTo)
						{
							_virtualScrollBody.scrollTo(0, 0);
						}
						else
						{
							//IE 下用这方法重置滚动条，能触发scroll事件
							_virtualScrollBody.scrollTop = 0;
						}
					}
				);
			}

			console.log('handler VirtualScrollTableBody data');
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
		return {
			'height': `${this.viewportHeight}px`,
			'width': `${this.viewportWidth}px`,
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
			'height': `${this.data.length * this.itemHeight}px`,
			'width': `${this.unFixedWidth}px`,//表体宽度
			'position': 'relative',
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
		let _$this = this;
		let _index = record.__dataIndex;
		_$this.scrollSynclData.clicked_index = _index;
		_$this.tableOwner.$emit('on-row-click', JSON.parse(JSON.stringify(record)), _index);
	};
	handleRowDblClick = function (
		this: VmThis,
		record
	)
	{
		let _$this = this;
		let _index = record.__dataIndex;
		console.log('dblClick');
		_$this.tableOwner.$emit('on-row-dblclick', JSON.parse(JSON.stringify(record)), _index);
	};
	handleMouseIn = function (
		this: VmThis,
		vkey
	)
	{
		this.scrollSynclData.hover_index = vkey;
	};
	handleMouseOut = function (
		this: VmThis,
		vkey
	)
	{
		this.scrollSynclData.hover_index = -1;
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
		const _minItemKey = minHeight / this.itemHeight;
		const _maxItemKey = maxHeight / this.itemHeight;
		const _startIndex = _minItemKey > 0 ? _minItemKey : -1;
		const _endIndex = _maxItemKey > this.virtualData.length ? this.data.length : _maxItemKey;
		const _renderData = [];
		for (let _index = _startIndex + 1; _index < _endIndex; _index++)
		{
			const _item = this.virtualData[_index];
			const _recordIndexHight = `${_index * this.itemHeight}`;
			_item.__dataIndex = _index;
			_item.translateY = `${_recordIndexHight}px`;
			_renderData.push(_item);
		}
		return _renderData;
	};
	getRowWrapperStyle = function (
		this: VmThis,
		record
	)
	{
		let _$this = this;
		let _isChecked = _$this.scrollSynclData.clicked_index == record.__dataIndex;;
		let _isHover = _isChecked || _$this.scrollSynclData.hover_index == record.__dataIndex;
		let _color = _isHover ? "#ebf7ff" : "";
		return {
			'transform': `translateY(${record.translateY})`,
			'box-shadow': _isHover ? '0px 2px 6px -2px rgba(0,0,0,.2)' : '',
			'height': `${_$this.itemHeight}px`,
			'background-color': _color,
			'margin-top': _isHover ? "-1px" : "",
			'border-top': _isHover ? "1px solid #dddddd" : ""//背景会挡住上一行的下边框显示
		};
	};
	getRowContainerStyle = function (record)
	{
		let _$this = this;
		let _isChecked = _$this.scrollSynclData.clicked_index == record.__dataIndex;;
		let _isHover = _isChecked || _$this.scrollSynclData.hover_index == record.__dataIndex;
		return {
			'box-shadow': _isHover ? '0px 2px 6px 0px rgba(0,0,0,.2)' : '',
			'height': _$this.getRecordHeight
		};
	};
	buildNewItems = function (
		this: VmThis,
		newData
	)
	{
		const _newItems = [];
		for (const _newRecord of newData)
		{
			if (_.findIndex(this.renderData, { __dataIndex: _newRecord.__dataIndex }) < 0)
			{
				_newItems.push(_newRecord);
			}
		}
		return _newItems;
	};
	buildOutDateItems = function (
		this: VmThis,
		newData
	)
	{
		const _replaceItemsIndex = [];
		for (let _index = 0; _index < this.renderData.length; _index++)
		{
			const _record = this.renderData[_index];
			if (_.findIndex(newData, { __dataIndex: _record.__dataIndex }) < 0)
			{
				_replaceItemsIndex.push(_index);
			}
		}
		return _replaceItemsIndex;
	};
	refreshVirtualItems = function (
		this: VmThis,
		newItems,
		replaceItemsIndex
	)
	{
		let _$this = this;
		if (newItems.length === _$this.renderData.length)
		{
			_$this.renderData = newItems;
			return;
		}
		"debug code"
		console.log('refreshVirtualItems', replaceItemsIndex, newItems)
		"end debug code"
		for (let index = 0; index < newItems.length; index++)
		{
			if (index < replaceItemsIndex.length)
			{
				_$this.$set(_$this.renderData, replaceItemsIndex[index], newItems[index]);
				continue;
			}
			_$this.renderData.push(newItems[index]);
		}
	};
	updateRenderData = function (
		this: VmThis,
		newData
	)
	{
		let _$this = this;
		let _newItems = [];
		let _replaceItemsIndex = [];
		if (_$this.renderData.length === 0)
		{
			_$this.renderData = newData;
		}
		else
		{
			_newItems = _$this.buildNewItems(newData);
			_replaceItemsIndex = _$this.buildOutDateItems(newData);
			_$this.refreshVirtualItems(_newItems, _replaceItemsIndex);
		}
		_$this.scrollSynclData.virtualItems = { renderData: _$this.renderData };
	};
	refreshRenderData = function (
		this: VmThis
		)
	{
		let _$this = this;
		const _virtualScrollBody = _$this.$refs.virtualScrollBody as HTMLElement;
		const _scrollTop = _virtualScrollBody ? _virtualScrollBody.scrollTop : 0;
		const _scrollLeft = _virtualScrollBody ? _virtualScrollBody.scrollLeft : 0;
		const [_minItemHeight, _maxItemHeight] = calDomItemsHeight(
			_$this.itemHeight,
			_$this.remainHeight,
			_$this.viewportHeight,
			_$this.renderItemsHeight,
			_scrollTop
		);
		_$this.updateRenderData(
			_$this.buildRenderData(_minItemHeight, _maxItemHeight)
		);
		_$this.scrollSynclData.scrollTop = _scrollTop;
		_$this.scrollSynclData.scrollLeft = _scrollLeft;
		_$this.scrollSynclData.scrollbarWidth = _virtualScrollBody
			//https://www.cnblogs.com/panjun-Donet/articles/1294033.html
			? (_virtualScrollBody.offsetWidth - _virtualScrollBody.clientWidth - 2 * _virtualScrollBody.clientLeft)
			: 16;
		_$this.scrollSynclData.offsetWidth = _virtualScrollBody ? _virtualScrollBody.offsetWidth : (_$this.viewportWidth + 2);

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