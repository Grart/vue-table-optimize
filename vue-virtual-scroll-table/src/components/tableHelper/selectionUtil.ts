//表格多选列
//checkbox 组件
const SelectionCheckBox = {
	name: 'SelectionCheckBox',
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
					staticClass: true == _$this.checked ? "iconfont icon-checkbox_on" : "iconfont icon-check-box-off",
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

//获取勾选数据
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

export function generateSelectionColumn(
	vmthis
)
{
	let _unCheckedCount = -1;
	let _defaultChecked = false;
	let _onToggleSelected = function (checked)
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
			vmthis.data,
			_defaultChecked
		);

		if (checked)
		{
			vmthis.$emit('on-select-all', _selection);
		} else
		{
			vmthis.$emit('on-select-all-cancel', _selection);
		}
		vmthis.$emit('on-selection-change', _selection);
	};

	let _toggleSelectObject = {
		checked: false,
		onCheckedChange: _onToggleSelected,
		index: -1
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
		let _selection = getSelectionData(
			_cellSelectionDict,
			vmthis.data,
			_defaultChecked
		);
		vmthis.$emit(checked ? 'on-select' : 'on-select-cancel',
			_selection,
			JSON.parse(JSON.stringify(vmthis.data[index])
			));
		vmthis.$emit('on-selection-change', _selection);

		vmthis.$nextTick(
			() =>
			{
				_toggleSelectObject.checked = (_unCheckedCount == 0);
				console.log(_toggleSelectObject.checked);
			}
		);
	};
	return {
		title: '选择',
		sortable: true,
		width: 29,//右边框1px
		disableDrag: true,
		fixed: 'left',
		renderHeader: function (h, params)
		{
			let _column = params.column;
			let _index = params.index;
			console.log(params);
			return h(
				SelectionCheckBox,
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
				SelectionCheckBox,
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
}