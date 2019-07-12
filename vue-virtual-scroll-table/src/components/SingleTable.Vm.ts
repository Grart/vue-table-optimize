
import Vue from 'vue';
import elementResizeDetectorMaker from 'element-resize-detector';

import TableHeader from './SingleTableHeader';
import TableBody from './SingleTableBody';
import RequestAnimationFrameTableBody from './RequestAnimationFrameTableBody';
import VirtualScrollTableBody from './VirtualScrollTableBody';
import VirtualScrollTableFixed from './VirtualScrollTableFixed';
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
function getColumnsDefaultWidth(
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
//checkbox 组件
const SelectionComponent = {
	props: {
		checkSyncObject: Object
	},
	data()
	{
		let _$this = this;
		return _$this.checkSyncObject;//直接把输入属性做绑定对像绑定
	},
	render: function (h, params)
	{
		let _$this = this;
		let _synObject = _$this.checkSyncObject;
		//console.log('render selection');
		return h(
			"div",
			{
				on: {
					click: function (e)
					{
						_synObject.checked = _$this.checked = !_$this.checked;
						if (_synObject.onCheckedChange)
						{
							_synObject.onCheckedChange(
								_$this.checked,
								_$this.index
							);
						}
					}
				}
			},
			[
				h("span", {
					staticClass: true == _$this.checked ? "iconfont icon-checkbox_on" : "iconfont icon-check-box-outline-bl",
					staticStyle: {
						'font-size': '18px',
						'width': '40px',
						'color': '#2d8cf0'
					},
					attrs: {}
				})
			]
		);
	}
};

export default {
	components: {
		TableHeader,
		TableBody,
		RequestAnimationFrameTableBody,
		VirtualScrollTableBody,
		VirtualScrollTableFixed,
	},
	name: 'SingleTable',
	props: {
		columnsConfig: Array,
		data: Array,
		recordKey: String,
		headerHeight: Number,
		bodyHeight: Number,
		tableWidth: Number,
		recordHeight: Number,
		headerClass: {
			type: String,
			default: 'c-table-header__default'
		},
	},
	data()
	{
		return {
			//滚动条同步对像,body通过这个对像将同步信息传给header
			scrollSynclData: {
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
			},
			bodyVisable: false,
			hiddenVerticalScroll: false,
			bodyWidth: 0
		};
	},
	computed: {
		getColumnsConfig: function ()
		{
			let _$this = this;
			if (!_$this.columnsConfig)
			{
				return [];
			}
			let _unCheckedCount = -1;
			let _defaultChecked = false;
			let _toggleSelectObject = {
				checked: false,
				onCheckedChange: function (checked)
				{
					//console.log('onCheckedChange', checked);
					for (let _key in _cellSelectionDict)
					{
						_cellSelectionDict[_key].checked = checked;
					}
					_defaultChecked = checked;
					if (checked)
					{
						_unCheckedCount = 0;
					}
					let _selection = getSelectionData(
						_cellSelectionDict,
						_$this.data,
						_defaultChecked
					);
			
					if (checked)
					{
						_$this.$emit('on-select-all', _selection);
					} else
					{
						_$this.$emit('on-select-all-cancel', _selection);
					}
					_$this.$emit('on-selection-change', _selection);
				}
			};
			let _cellSelectionDict = {};
			let _onCellCheckedChange = function (checked, index)
			{
				//console.log('_onCellCheckedChange', checked);
				if (!checked)
				{
					_unCheckedCount++;
				}
				else
				{
					_unCheckedCount--;
				}

				_$this.$nextTick(
					() =>
					{
						//vue 有循环检测, 用这方法跳出循环
						_toggleSelectObject.checked = (_unCheckedCount == 0);

						let _selection = getSelectionData(
							_cellSelectionDict,
							_$this.data,
							_defaultChecked
						);
						_$this.$emit(checked ? 'on-select' : 'on-select-cancel',
							_selection,
							JSON.parse(JSON.stringify(_$this.data[index])
							));
						_$this.$emit('on-selection-change', _selection);
					}
				);
			};
			let _selection = {
				title: '选择',
				sortable: true,
				width: 29,//右边框1px
				disableDrag: true,
				fixed: 'left',
				renderHeader: function (h, params)
				{
					console.log(params);
					return h(
						SelectionComponent,
						{
							props: {
								checkSyncObject: _toggleSelectObject
							}
						}
					);
				},
				render: function (h, params)
				{
					let _row = params.row;
					let _vkey = _row.__vkey;
					//console.log('render _vkey=' + _vkey);
					let _checkObject = _cellSelectionDict[_vkey];
					if (!_checkObject)
					{
						_cellSelectionDict[_vkey] = _checkObject = {
							checked: _defaultChecked,
							onCheckedChange: _onCellCheckedChange,
							index: _vkey
						};
					}
					return h(
						SelectionComponent,
						{
							props: {
								checkSyncObject: _checkObject
							}
						}
					);
				},
				key: 'status',
				noNeedVertical: true,
				enableEllipsis: true,
			};
			return [_selection, ... this.columnsConfig];

			/**
			 * 获取选择的数据
			 */
			function getSelectionData(
				checkedDict: {},
				data: any[],
				defaultChecked: boolean
			)
			{
				let _selectionIndexes = [];
				let _unSelectionIndexes = [];
				for (let _i in checkedDict)
				{
					let _index = parseInt(_i);
					if (checkedDict[_i].checked)
					{
						_selectionIndexes.push(_index);
					}
					else
					{
						_unSelectionIndexes.push(_index);
					}
				}
				if (defaultChecked)
				{
					//全选情况下,排除非选择项目
					return JSON.parse(JSON.stringify(data.filter((data, index) => _unSelectionIndexes.indexOf(index) == -1)));
				}
				//非全选情况下,只获取选择项
				return JSON.parse(JSON.stringify(data.filter((data, index) => _selectionIndexes.indexOf(index) > -1)));
			}
		},
		getUnFixedColumnsConfig: function ()
		{
			return this.getColumnsConfig.filter(
				m => m.fixed != 'right' && m.fixed != 'left'
			);
		},
		getFixedLeftColumnsConfig: function ()
		{
			return this.getColumnsConfig.filter(
				m => m.fixed == 'left'
			);
		},
		getFixedRightColumnsConfig: function ()
		{
			return this.getColumnsConfig.filter(
				m => m.fixed == 'right'
			);
		},
		getFixedLeftWidth: function ()
		{
			return getColumnsWidth(this.getFixedLeftColumnsConfig);
		},
		getFixedRightWidth: function ()
		{
			return getColumnsWidth(this.getFixedRightColumnsConfig);
		},
		getUnFixedWidth: function ()
		{
			return getColumnsWidth(this.getUnFixedColumnsConfig);
		},
		getAllColumnsWidth: function ()
		{
			return getColumnsWidth(this.columnsConfig);
		},
		getBodyHeight: function ()
		{
			return this.data.length * this.recordHeight;
		},

		getTableWrapperStyle: function ()
		{
			//最外层嵌套元素样式
			let _width = this.bodyVisable ? (this.tableWidth ? this.tableWidth : this.bodyWidth) : 0;
			return {
				width: 0 != _width ? `${_width}px` : 'inherit',
				position: "relative"
			};
		},

		getHeaderStyle: function ()
		{
			let _totalWidth = this.getUnFixedWidth + this.getFixedLeftWidth + this.getFixedRightWidth;
			console.log(this.scrollSynclData.offsetWidth);
			return {
				width: (this.tableWidth ? `${this.tableWidth}px` : (this.bodyVisable ? `${this.bodyWidth - 18}px` : 'inherit')),
				"overflow-x": "hidden",
				"overflow-y": "hidden"
			}

			//return `${(this.scrollSynclData ? this.scrollSynclData.offsetWidth : this.tableWidth)}px`;
		},
		getHeaderColumnWidth: function ()
		{
			return `${(this.scrollSynclData ? this.scrollSynclData.offsetWidth : this.tableWidth) - this.scrollSynclData.scrollbarWidth - 4}px`;
		},
		getTableHeight: function ()
		{
			return this.bodyHeight + this.headerHeight;
		},
		getFixedRightClass: function ()
		{
			return this.hiddenVerticalScroll ? '' : 'c-table-fiexed-right';
		},
		getFixedRightStyle: function ()
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
		},
		getFixedLeftClass: function ()
		{
			return this.hiddenVerticalScroll ? '' : 'c-table-fiexed-left';
		},
		getFixedLeftStyle: function ()
		{
			let _height = 0;
			if (this.hiddenVerticalScroll)
			{
				//为了显示左冻结列，右方的表格线条
				_height = this.data.length * this.recordHeight;
			}
			else
			{
				_height = this.getTableHeight - this.scrollSynclData.scrollbarWidth + 2;
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
		},
		getFloatRightHeaderStyle: function ()
		{
			console.log(`${this.headerHeight}px`);
			return {
				height: `${this.headerHeight}px`
			};
		}
	},
	methods: {
		tableResize()
		{
			let _$this = this;
			_$this.bodyWidth = _$this.$refs.tableWrapper.clientWidth;//tableHeader
			if (0 == _$this.bodyWidth)
			{
				_$this.bodyWidth = _$this.$refs.tableWrapper.scrollWidth;
			}
			_$this.bodyWidth = 0 == _$this.bodyWidth ? 0 : (_$this.bodyWidth - 5);

			console.log(_$this.bodyWidth);
			let _getAllColumnsWidth = getColumnsDefaultWidth(_$this.columnsConfig);// _$this.getAllColumnsWidth;
			let _getUnFixedWidth = _$this.getUnFixedWidth;
			_$this.hiddenVerticalScroll = (_$this.bodyWidth > _getAllColumnsWidth);

			let _defWidth = _$this.bodyWidth - _getAllColumnsWidth;
			let _lessWidth = _defWidth;
			for (let _c = 0; _c < _$this.columnsConfig.length; _c++)
			{
				let _col = _$this.columnsConfig[_c];
				if (_col.fixed != 'right' && _col.fixed != 'left')
				{
					if (_$this.hiddenVerticalScroll)
					{
						//如果长度超过设定宽度，调整列宽度
						let _w = parseInt(_col.cWidth ? _col.cWidth.replace('px', '') : _col.width);
						let _w2 = parseInt(_w / _getUnFixedWidth * _defWidth);
						_col.width = _w + (_lessWidth > _w2 ? _w2 : _lessWidth);
						_lessWidth -= _w2;
						_col.cWidth = `${_col.width}px`;
					}
					else
					{
						_col.cWidth = `${_col.defaultWidth}px`;
					}
				}
			}


			_$this.bodyVisable = !!_$this.$refs.tableHeader;
		},
		handleResize()
		{
			let _$this = this;
			_$this.bodyVisable = false;
			_$this.$nextTick(
				() =>
				{
					_$this.tableResize();
				}
			);
		}

	},
	mounted: function ()
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
	beforeDestroy()
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