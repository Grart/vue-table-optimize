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
): any[]
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
	vmThis,
	//主表体组件this
	tableOwner
)
{
	console.log('generateSelectionColumn');
	let _dataCount = vmThis.data ? vmThis.data.length : 0;
	let _cellSelectionDict = {};
	let _checkedCount = 0;
	let _defaultChecked = false;


	let _selectionGeter = () => getSelectionData(
		_cellSelectionDict,
		vmThis.data,
		_defaultChecked
	);

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
			_checkedCount = _dataCount;
		}
		else
		{
			_checkedCount = 0;
		}

		if (checked)
		{
			tableOwner.$emit('on-select-all', _selectionGeter);
		}
		else
		{
			tableOwner.$emit('on-select-all-cancel', _selectionGeter);
		}
		tableOwner.$emit('on-selection-change', _selectionGeter);
	};

	let _toggleSelectObject = {
		checked: false,
		onCheckedChange: _onToggleSelected,
		index: -1
	};

	let _onCellCheckedChange = function (checked, index)
	{
		//console.log('_onCellCheckedChange', checked);
		if (checked)
		{
			_checkedCount++;
		}
		else
		{
			_checkedCount--;
		}
		 tableOwner.$emit(
			checked ? 'on-select' : 'on-select-cancel',
			_selectionGeter,
			JSON.parse(JSON.stringify(vmThis.data[index]))
		);
		console.log('on-selection-change');
		tableOwner.$emit(
			'on-selection-change',
			_selectionGeter
		);

		vmThis.$nextTick(
			() =>
			{
				_toggleSelectObject.checked = (_checkedCount == _dataCount);
			}
		);
	};
	return {
		title: '选择',
		sortable: true,
		width: 31,//右边框1px
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
			let _index = _row.__dataIndex;
			let _checkObject = _cellSelectionDict[_index];
			if (!_checkObject)
			{
				_cellSelectionDict[_index] = _checkObject = {
					checked: _defaultChecked
					//onCheckedChange: _onCellCheckedChange,
					//index: _index
				};
			}
			_checkObject.onCheckedChange = _onCellCheckedChange;
			_checkObject.index = _index;
			return h(
				SelectionCheckBox,
				{
					props: {
						checkSyncObject: _checkObject
					}
				}
			);
		},
		key: '',
		noNeedVertical: true,
		enableEllipsis: true,
		getSelectionData: () => getSelectionData(
			_cellSelectionDict,
			vmThis.data,
			_defaultChecked
		),
		toggleSelectObject: _toggleSelectObject,
		cellSelectionDict: _cellSelectionDict
	};
}