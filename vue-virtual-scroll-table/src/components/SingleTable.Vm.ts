
import Vue from 'vue';
import elementResizeDetectorMaker from 'element-resize-detector';

import TableHeader from './SingleTableHeader';
import TableBody from './SingleTableBody';
import RequestAnimationFrameTableBody from './RequestAnimationFrameTableBody';
import VirtualScrollTableBody from './VirtualScrollTableBody';
import VirtualScrollTableFixed from './VirtualScrollTableFixed';
import { generateSelectionColumn } from './tableHelper/selectionUtil'
/**
 * 计算列宽
 */
function getColumnsWidth(columnsConfig)
{
	let _bodyWidth = 0;
	let _cfg = columnsConfig;
	for (let _c = 0; _c < _cfg.length; _c++)
	{
		let _col = _cfg[_c];
		let _columnWidth = parseInt(_col.cWidth ? _col.cWidth.replace('px', '') : _col.width);
		_col.cWidth = `${_columnWidth}px`;
		_bodyWidth += _columnWidth;
	}
	return _bodyWidth;
}
/**
 * 计算默认列宽
 */
function getAndInitColumnsDefaultWidth(
	columnsConfig
)
{
	let _bodyWidth = 0;
	let _cfg = columnsConfig;
	for (let _c = 0; _c < _cfg.length; _c++)
	{
		let _col = _cfg[_c];
		if (!_col.defaultWidth)
		{
			_col.defaultWidth = parseInt(_col.cWidth ? _col.cWidth.replace('px', '') : _col.width);
			_col.cWidth = `${_col.defaultWidth}px`;
		}
		_bodyWidth += _col.defaultWidth;
	}
	return _bodyWidth;
}


type VmThis = VmProps & VmWatch & VmMethods & VmData & VmComputed;

class VmProps
{
	columnsConfig = Array as any as ColumnConfig[]
	data = Array as any as any[]
	recordKey = String as any as number
	headerHeight = Number as any as number
	bodyHeight = Number as any as number
	tableWidth = Number as any as number
	recordHeight = Number as any as number
	headerClass = {
		type: String,
		default: 'c-table-header__default'
	} as any as string
}
class VmComputed
{
	getUnFixedColumnsConfig = function (
		this: VmThis
	)
	{
		return this.cloneColumnsConfig.filter(
			m => m.fixed != 'right' && m.fixed != 'left'
		);
	} as any as ColumnConfig[];
	getFixedLeftColumnsConfig = function (
		this: VmThis
	)
	{
		return this.cloneColumnsConfig.filter(
			m => m.fixed == 'left'
		);
	} as any as ColumnConfig[];
	getFixedRightColumnsConfig = function (
		this: VmThis
	)
	{
		return this.cloneColumnsConfig.filter(
			m => m.fixed == 'right'
		);
	} as any as ColumnConfig[];
	getFixedLeftWidth = function (
		this: VmThis
	)
	{
		return getColumnsWidth(this.getFixedLeftColumnsConfig);
	} as any as number;
	getFixedRightWidth = function (
		this: VmThis
	)
	{
		return getColumnsWidth(this.getFixedRightColumnsConfig);
	} as any as number;
	getUnFixedWidth = function (
		this: VmThis
	)
	{
		return getColumnsWidth(this.getUnFixedColumnsConfig);
	} as any as number;
	getAllColumnsWidth = function (
		this: VmThis
	)
	{
		return getColumnsWidth(this.cloneColumnsConfig);
	} as any as number;
	getBodyHeight = function (
		this: VmThis
	)
	{
		return this.data.length * this.recordHeight;
	} as any as number;

	getTableWrapperStyle = function (
		this: VmThis
	)
	{
		//最外层嵌套元素样式
		let _width = this.bodyVisable ? (this.tableWidth ? this.tableWidth : this.bodyWidth) : 0;
		return {
			width: 0 != _width ? `${_width}px` : 'inherit',
			position: "relative"
		};
	} as any as Object;

	getHeaderStyle = function (
		this: VmThis
	)
	{
		let _totalWidth = this.getUnFixedWidth + this.getFixedLeftWidth + this.getFixedRightWidth;
		console.log(this.scrollSynclData.offsetWidth);
		return {
			width: (this.tableWidth ? `${this.tableWidth}px` : (this.bodyVisable ? `${this.bodyWidth - 18}px` : 'inherit')),
			"overflow-x": "hidden",
			"overflow-y": "hidden"
		}

		//return `${(this.scrollSynclData ? this.scrollSynclData.offsetWidth : this.tableWidth)}px`;
	} as any as Object;
	getHeaderColumnWidth = function (
		this: VmThis
	)
	{
		return `${(this.scrollSynclData ? this.scrollSynclData.offsetWidth : this.tableWidth) - this.scrollSynclData.scrollbarWidth - 4}px`;
	} as any as string;
	getTableHeight = function (
		this: VmThis
	): number
	{
		return this.bodyHeight + this.headerHeight;
	} as any as number;
	getFixedRightClass = function (
		this: VmThis
	)
	{
		return this.hiddenVerticalScroll ? '' : 'c-table-fiexed-right';
	} as any as string;
	getFixedRightStyle = function (
		this: VmThis
	)
	{
		let _height = this.getTableHeight;
		if (!this.hiddenVerticalScroll)
		{
			_height = _height - this.scrollSynclData.scrollbarWidth + 2;
		}
		return {
			top: `${0}px`,
			right: `${this.scrollSynclData.scrollbarWidth + 1}px`,
			width: `${this.getFixedRightWidth}px`,
			height: `${_height}px`,
			position: 'absolute',//顶层要用position: relative;
			'background-color': 'ghostwhite',
			"overflow-x": "hidden",
			"overflow-y": "hidden",
			'box-sizing': 'order-box'
		};
	} as any as Object;
	getFixedLeftClass = function (
		this: VmThis
	)
	{
		return this.hiddenVerticalScroll ? '' : 'c-table-fiexed-left';
	} as any as string;
	getFixedLeftStyle = function (
		this: VmThis
	)
	{
		let _height = this.getTableHeight;
		if (!this.hiddenVerticalScroll)
		{
			_height = _height - this.scrollSynclData.scrollbarWidth + 2;
		}
		return {
			'border-right': this.hiddenVerticalScroll ? '1px solid #dddddd' : '',
			top: `${0}px`,
			left: `${1}px`,
			width: `${this.getFixedLeftWidth}px`,
			height: `${_height}px`,
			position: 'absolute',//顶层要用position: relative;
			'background-color': 'ghostwhite',
			"overflow-x": "hidden",
			"overflow-y": "hidden",
			'box-sizing': 'order-box'
		};
	} as any as Object;
	getFloatRightHeaderStyle = function (
		this: VmThis
	)
	{
		console.log(`${this.headerHeight}px`);
		return {
			height: `${this.headerHeight}px`
		};
	} as any as Object;
}

class VmData
{
	//滚动条同步对像,body通过这个对像将同步信息传给header
	scrollSynclData = {
		scrollTop: 0,
		scrollLeft: 0,
		scrollbarWidth: 16,
		offsetWidth: 0,
		focus_vkey: -1,
		clicked_vkey: -1,
		virtualItems: {
			renderData: [],
			newItems: [],
			replaceItemsIndex: 0
		}
	};
	cloneColumnsConfig: ColumnConfig[] = null;
	bodyVisable = false;
	hiddenVerticalScroll = false;
	bodyWidth = 0;
	selectionColumn: ColumnConfig = null;
}

class VmWatch
{
	columnsConfig = {
		handler: function (
			this: VmThis,
			config: ColumnConfig[]
		)
		{
			let _$this = this;
			if (!config || config.length == 0)
			{
				return _$this.cloneColumnsConfig = [];
			}
			console.log('handler columnsConfig', config);
			if (null == _$this.selectionColumn)
			{
				//用临时变量的话会selectionColumn绑定到组件上会有异常
				//（因为构建时, VmWatch进入了两次, 函数内的_toggleSelectObject和绑定到组件上的_toggleSelectObject不是同一对象），回头研究
				_$this.selectionColumn = generateSelectionColumn(_$this);
			}
			return _$this.cloneColumnsConfig = [_$this.selectionColumn, ...config];

			/**
			 * 获取选择的数据
			 */
		},
		immediate: true,
		//deep: true,
	}
}

class VmMethods
{
	tableResize = function (
		this: VmThis
	)
	{
		//自适应列宽
		let _$this = this;
		_$this.bodyWidth = _$this.$refs.tableWrapper.clientWidth;//tableHeader
		if (0 == _$this.bodyWidth)
		{
			_$this.bodyWidth = _$this.$refs.tableWrapper.scrollWidth;
		}
		_$this.bodyWidth = 0 == _$this.bodyWidth ? 0 : (_$this.bodyWidth - 5);

		let _getAllColumnsWidth = getAndInitColumnsDefaultWidth(_$this.cloneColumnsConfig);// _$this.getAllColumnsWidth;
		let _getUnFixedWidth = _$this.getUnFixedWidth;
		_$this.hiddenVerticalScroll = (_$this.bodyWidth > _getAllColumnsWidth);

		let _diffWidth = _$this.bodyWidth - _getAllColumnsWidth;
		//console.log('bodyWidth=', _$this.bodyWidth, '_defWidth=', _diffWidth);
		let _lessWidth = _diffWidth;
		let _unFixColumns = _$this.getUnFixedColumnsConfig;
		for (let _c = 0, _cLen = _unFixColumns.length, _cLast = _cLen - 1; _c < _cLen; _c++)
		{
			let _col = _unFixColumns[_c];

			if (_$this.hiddenVerticalScroll)
			{
				//如果长度超过设定宽度，调整列宽度
				let _defaultWidth = parseInt(_col.defaultWidth);
				let _rateWidth = parseInt(_defaultWidth / _getUnFixedWidth * _diffWidth);
				_col.width = _defaultWidth + ((_lessWidth < _rateWidth || _cLast == _c) ? _lessWidth : _rateWidth);
				_lessWidth -= _rateWidth;
				_col.cWidth = `${_col.width}px`;
				//console.log('_col=', _col.key, '_lessWidth=', _lessWidth, '_w2=', _rateWidth, 'cWidth=', _col.cWidth);
			}
			else
			{
				_col.cWidth = `${_col.defaultWidth}px`;
			}
		}

		console.log(_$this.cloneColumnsConfig);
		_$this.bodyVisable = !!_$this.$refs.tableHeader;
	};

	handleResize = function (
		this: VmThis
	)
	{
		let _$this = this;
		_$this.bodyVisable = false;
		_$this.$nextTick(
			() =>
			{
				_$this.tableResize();
			}
		);
	};
}


export default {
	components: {
		TableHeader,
		TableBody,
		RequestAnimationFrameTableBody,
		VirtualScrollTableBody,
		VirtualScrollTableFixed,
	},
	name: 'SingleTable',
	props: new VmProps(),
	watch: new VmWatch(),
	data()
	{
		return new VmData();
	},
	computed: new VmComputed(),
	methods: new VmMethods(),
	mounted: function (
		this: VmThis
	)
	{
		let _$this = this;

		_$this.tableResize();
		////_$this.$nextTick(() => _$this.ready = true);

		on(window, 'resize', _$this.handleResize);
		//_$this.observer = elementResizeDetectorMaker();
		//_$this.observer.listenTo(_$this.$el, _$this.handleResize);

		_$this.$on('on-visible-change', (val) =>
		{
		    if (val)
		    {
		        _$this.handleResize();
		    }
		});
	},
	beforeDestroy(
		this: VmThis
	)
	{
		off(window, 'resize', this.handleResize);
		//this.observer.removeListener(this.$el, this.handleResize);
	}
};


const isServer = Vue.prototype.$isServer;
/* istanbul ignore next */
const on = (function ()
{
	if (!isServer && document.addEventListener)
	{
		return function (element, event, handler)
		{
			if (element && event && handler)
			{
				element.addEventListener(event, handler, false);
			}
		};
	} else
	{
		return function (element, event, handler)
		{
			if (element && event && handler)
			{
				element.attachEvent('on' + event, handler);
			}
		};
	}
})();

/* istanbul ignore next */
const off = (function ()
{
	if (!isServer && document.removeEventListener)
	{
		return function (element, event, handler)
		{
			if (element && event)
			{
				element.removeEventListener(event, handler, false);
			}
		};
	} else
	{
		return function (element, event, handler)
		{
			if (element && event)
			{
				element.detachEvent('on' + event, handler);
			}
		};
	}
})();