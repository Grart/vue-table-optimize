
import Vue from 'vue';
import elementResizeDetectorMaker from 'element-resize-detector';

import TableHeader from './SingleTableHeader.vue';
import TableBody from './SingleTableBody.vue';
import RequestAnimationFrameTableBody from './RequestAnimationFrameTableBody.vue';
import VirtualScrollTableBody from './VirtualScrollTableBody.vue';
import VirtualScrollTableFixed from './VirtualScrollTableFixed.vue';
import { generateSelectionColumn } from './tableHelper/selectionUtil'
import { generateRowNumberColumn } from './tableHelper/rowNumberUtil';
import { fail } from 'assert';

interface SelectionColumnConfig extends ColumnConfig
{
	getSelectionData: () => any[]
	toggleSelectObject: {
		checked: boolean
	}
	cellSelectionDict: Map<string, {checked: boolean}>
}

/**
 * 计算列宽
 */
function getColumnsWidth(
	columnsConfigArray
)
{
	let _bodyWidth = 0;
	let _cfgAry = columnsConfigArray;
	for (let _c = 0; _c < _cfgAry.length; _c++)
	{
		let _col = _cfgAry[_c];
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
	columnsConfig,
	tableWidth
)
{
	let _bodyWidth = 0;
	let _cfg = columnsConfig;
	for (let _c = 0; _c < _cfg.length; _c++)
	{
		let _col = _cfg[_c];
		if (!_col.defaultWidth)
		{
			_col.defaultWidth = parseInt(_col.cWidth ? _col.cWidth.replace('px', '') : (_col.width ? _col.width : 0));
			if (0 == _col.defaultWidth)
			{
				_col.defaultWidth = 85;//默认60
			}
			_col.cWidth = `${_col.defaultWidth}px`;
		}
		_bodyWidth += _col.defaultWidth;
	}
	return _bodyWidth;
}


type VmThis = VmProps & VmWatch & VmMethods & VmData & VmComputed & Vue;

class VmProps
{
	//主表体组件this
	tableOwner = Object as any as Object
	columnsConfig = Array as any as ColumnConfig[]
	data = Array as any as any[]
	recordKey = String as any as string
	headerHeight = Number as any as number
	bodyHeight = Number as any as number
	tableWidth = Number as any as number
	recordHeight = Number as any as number
	headerClass = {
		type: String,
		default: 'c-table-header__default'
	} as any as string
	multiSelection = {
		type: Boolean,
		default: false
	} as any as boolean

  /*多选模式下用于初始化勾选状态*/
	initRowSelection = Function
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
		console.log('getUnFixedWidth');
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
			'width': (this.tableWidth ? `${this.tableWidth}px` : (this.bodyVisable ? `${this.bodyWidth - 18}px` : 'inherit')),
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
		return  'c-table-fiexed-right';
		//return this.hiddenVerticalScroll ? '' : 'c-table-fiexed-right';
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
			'top': `${0}px`,
			'right': `${this.scrollSynclData.scrollbarWidth + 1}px`,
			'width': `${this.getFixedRightWidth}px`,
			'height': `${_height}px`,
			'position': 'absolute',//顶层要用position: relative;
			'background-color': '#fff',
			"overflow-x": "hidden",
			"overflow-y": "hidden",
			'box-sizing': 'order-box'
		};
	} as any as Object;
	getFixedLeftClass = function (
		this: VmThis
	)
	{
		return  'c-table-fiexed-left';
		//return this.hiddenVerticalScroll ? '' : 'c-table-fiexed-left';
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
			'top': `${0}px`,
			'left': `${1}px`,
			'width': `${this.getFixedLeftWidth}px`,
			'height': `${_height}px`,
			'position': 'absolute',//顶层要用position: relative;
			'background-color': '#fff',
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
		hover_index: -1,
		clicked_index: -1,
		virtualItems: {
			renderData: [],
			newItems: [],
			replaceItemsIndex: 0
		}
	} as ScrollSynclData;
	cloneColumnsConfig: ColumnConfig[] = null;
	bodyVisable = false;
	hiddenVerticalScroll = false;
	bodyWidth = 0;
	selectionColumn: SelectionColumnConfig = null;
	rowNumberColumn: ColumnConfig = null;
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
			if (null == _$this.rowNumberColumn)
			{
				_$this.rowNumberColumn = generateRowNumberColumn(_$this, _$this.tableOwner);
			}
			if (!config || config.length == 0)
			{
				_$this.cloneColumnsConfig = [_$this.rowNumberColumn];
			}
			if (null == _$this.selectionColumn)
			{
				//用临时变量的话会selectionColumn绑定到组件上会有异常
				//（因为构建时, VmWatch进入了两次, 函数内的_toggleSelectObject和绑定到组件上的_toggleSelectObject不是同一对象），回头研究
				_$this.selectionColumn = generateSelectionColumn(
					_$this,
					_$this.tableOwner
				);
			}
			if (_$this.multiSelection)
			{
				_$this.cloneColumnsConfig = [_$this.rowNumberColumn, _$this.selectionColumn, ...config];
			}
			else
			{
				_$this.cloneColumnsConfig = [_$this.rowNumberColumn, ...config];
			}
			_$this.handleResize();
			/**
			 * 获取选择的数据
			 */
		},
		immediate: true,
		//deep: true,
	};

	data = {
		handler: function (
			this: VmThis,
			val
		)
		{
			let _$this = this;
			if ( _$this.selectionColumn)
			{
				let _cellDict = _$this.selectionColumn.cellSelectionDict;
				for (let _index in _cellDict)
				{
					_cellDict[_index].checked = false;
				}
				if (val && val.length > 0)
				{
					let _checkedCount = 0;
					for (let _index = 0; _index < val.length; _index++)
					{
						let _cellObject = _cellDict[_index];
						if (!_cellObject)
						{
							_cellDict[_index] = _cellObject = {};
						}
						if (_$this.initRowSelection)
						{
							_cellObject.checked = _$this.initRowSelection(val[_index]);
						}
						else
						{
							_cellObject.checked = false;
						}
						if (_cellObject.checked)
						{
							_checkedCount++;
						}
					}
					//判断全选
					_$this.selectionColumn.toggleSelectObject.checked = _checkedCount == val.length;
				}
				else
				{
					_$this.selectionColumn.toggleSelectObject.checked = false;
				}
			}
		},
		immediate: true,
		deep: true,
	};
}

class VmMethods
{
	getSelectionData = function (
		this: VmThis
	)
	{
		return this.selectionColumn.getSelectionData();
	};
	tableResize = function (
		this: VmThis
	)
	{
		console.log('tableResize');
		//自适应列宽
		let _$this = this;
		let _tableWraper = _$this.$refs.tableWrapper as HTMLElement;
		_$this.bodyWidth = _tableWraper.clientWidth;//tableHeader
		if (0 == _$this.bodyWidth)
		{
			_$this.bodyWidth = _tableWraper.scrollWidth;
		}
		_$this.bodyWidth = 0 == _$this.bodyWidth ? 0 : (_$this.bodyWidth - 5);

		let _getAllColumnsWidth = getAndInitColumnsDefaultWidth(
			_$this.cloneColumnsConfig,
			_$this.bodyWidth
		);// _$this.getAllColumnsWidth;
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
				let _defaultWidth: number = parseInt(_col.defaultWidth );
				let _rateWidth = parseInt((_defaultWidth / _getUnFixedWidth * _diffWidth) as any as string);
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
		//强制刷新computed依赖缓存
		_$this.$set(_$this, 'cloneColumnsConfig', [..._$this.cloneColumnsConfig]);
		_$this.$nextTick(
			() =>
			{
				_$this.bodyVisable = !!_$this.$refs.tableHeader;
			}
		);
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