import Vue, { VNode } from "vue";


const _GlobalElement = document.createElement('div');
document.body.append(_GlobalElement);

class VmData
{
	InputText: string;
	DataIndexArray: Array<number> = [];
	FocusIndex: number = -1;
}

class VmProps
{
	value = Object as any as string;
	data = Array as any as any[];//传入数据，数组类型
	keyField = String as any as string;////数据唯一标志字段
	valueField = String as any as string;////要显示的字段
	columns = Array as any as any[];////下拉表格要显示的列{title:string,key:string}
	filterMethod: (val: string, dObjh: any) => boolean = null;
	pageCount = Number as any as number;
}



class VmWatch 
{
	//constructor()
	//{
	//	let $this = this;
	//	let _VmThis: Vue & VmData & VmProps;
	//	$this.SetVmThis = function (vmThis)
	//	{
	//		_VmThis = vmThis;
	//		return $this;
	//	};
	//	$this.value = (val) =>
	//	{
	//		_VmThis.InputText = val;
	//	};
	//	$this.data = (val) =>
	//	{
	//		_VmThis.data = val;
	//	};
	//	$this.keyField = (val) =>
	//	{
	//		_VmThis.keyField = val;
	//	};
	//}
	SetVmThis: (vm) => VmWatch;
	value: (val) => void;
	data: (val) => void;
	keyField: (val) => void;
}

declare type VmType =  VmData & VmProps;

const _TableRowHeight = 24;
function VueComponentRender(
	$this: VmType,
	h,
	params
): VNode
{
	let _$this = $this;
	let _vNodeOfTBody = null, _vNodeOfRel = null, _vNodeOfPopper = null;
	//let _searcher = SearchCtor();
	_$this.InputText = _$this.value;


	return JsxProper(h, true) as any as VNode;

	function JsxProper(h, visible)
	{
		if (!visible)
		{
			return [];
		}
		return (
			<div
				{...{
					staticClass: "ivu-poptip-popper",
					style: visible ? '' : 'display:none',
					attrs: { slot: "content" },
					slot: "content"
				}
				}
			>
				<table
					{...{
						attrs: {
							cellspacing: "0",
							cellpadding: "0",
							border: "0"
						},
						style: {
							'padding-left': '4px',
						}
					}}>
					<thead>
						<tr>
							{JsxTableHead(h)}
						</tr>
					</thead>
				</table>
				<ul
					{...{
						staticClass: 'ivu-select-dropdown ivu-select-dropdown-list',
						style: {
							'margin-top': '0px',
							'padding-left': '4px',
							'padding-bottom': '6px',
							'max-height': (_$this.pageCount * _TableRowHeight) + 'px'
						},
						hook: {
							'create': function (vNode0, vNode1)
							{
								_vNodeOfTBody = vNode1;
							}
						}
					}
					}>
					<table cellspacing="0" cellpadding="0" border="0">
						<tbody class="ivu-table-tbody">
							{JsxTableBody(h)}
						</tbody>
					</table>
				</ul>
			</div>
		) ;
	}


	function JsxTableHead(h)
	{
		let _ret = [<th style="width:35px">#</th>];

		for (let _i = 0, _iCnt = _$this.columns.length; _i < _iCnt; _i++)
		{
			let _col = _$this.columns[_i];
			_ret.push(
				<th
					{...{
						style: {
							'width': _col.Width + 'px'
						}
					}}>
					<p class="ivu-table-cell">
						{_col.title}
					</p>
				</th>
			);
		}
		//_ret.push(<td style="width:21px"> </td>);
		return _ret;
	}

	function JsxTableBody(h)
	{
		let _ret = [];
		_$this.DataIndexArray.map(
			function (val, index)
			{
				_ret.push(
					<tr
						{...{
							style: {
								'height': `${_TableRowHeight}px`
							},
							class:
								_$this.FocusIndex == index
									? "ivu-table-row-hover"
									: "ivu-table-row",
							on: {
								mouseenter: function (ev)
								{
									//HandlerMouseIn(val, index)
								}
							}
						}}>
						{JsxTableRow(h, _$this.data[val], index)}
					</tr>
				);
			}
		);
		return _ret;
	}

	function JsxTableRow(h, val, index)
	{
		let _ret = [
			<td
				{
				...{
					style: {
						'height': `${_TableRowHeight}px`,
						'background-color': '#f8f8f9',
						'width': '35px',
						'color': _$this.FocusIndex == index ? 'blue' : '',
					}
				}
				}>
				<p>
					{index + 1}
				</p>
			</td>
		];
		for (let _i = 0; _i < _$this.columns.length; _i++)
		{
			_ret.push(
				<td
					{...{
						staticClass: 'ivu-table-column-center',
						//css样式传递，由于在表格中会继承到选中行的样式，所以改成styel设置样式
						style: {
							'height': `${_TableRowHeight}px`,
							'background-color': _$this.FocusIndex == index ? '#ebf7ff' : '#fff',
							'width': _$this.columns[_i].Width + 'px',
						}
					}} >
					<p>
						{val[_$this.columns[_i].key]}
					</p>
				</td>
			)
		}
		return _ret;
	}

}

function SearchCtor()
{
	let _loopHandler = null, _isSearching = false;
	let _dIndexAry: Array<number>;
	let _index = 0, _iCnt = 0;
	let _innerSearcher = ContinueSearchCtor();
	return { StopLooper, Search, IsSearching };//返回类对像

	//  判断是否正在查询
	function IsSearching()
	{
		return _isSearching || _innerSearcher.IsSearching();
	}

	function StopLooper()
	{
		_innerSearcher.StopLooper();
		if (_loopHandler)
		{
			clearTimeout(_loopHandler);
			_loopHandler = null;
		}
		_isSearching = false;
		"debug code";
		console.log(`Search StopLooper`);
		"end debug code";
	}

	function Search(
		data: any[],
		filter: (d) => boolean,
		isContinue: boolean,
	)
	{
		StopLooper();
		if (isContinue)
		{
			return _innerSearcher.Search(
				_dIndexAry,
				data,
				filter,
				() =>
				{
					_loopHandler = setTimeout(
						() =>
						{
							doInnerLoop();
						},
						300
					);
				}
			);
		}
		_isSearching = true;
		_dIndexAry = [];//新查询时生成新数组
		_index = 0, _iCnt = data.length;

		_loopHandler = setTimeout(
			() =>
			{
				doInnerLoop();
			},
			300
		);

		return _dIndexAry;


		function doInnerLoop()
		{
			"debug code";
			console.log('LookUpEdit-SearchCtor-Search-doInnerLoop');
			console.log(`Search _index=${_index} _iCnt = ${_iCnt}`);
			"end debug code";
			let _loopCnt = 0;
			let _indexAry = [];
			for (; _index < _iCnt; _index++)
			{
				let _dIndex = _index;//***
				if (filter(data[_dIndex]))
				{
					_indexAry.push(_dIndex);
				}
				_loopCnt++;

				if (_loopCnt >= 250)
				{
					_loopHandler = setTimeout(
						() =>
						{
							doInnerLoop();
						},
						300
					);
					break;
				}
			}
			if (_indexAry.length > 0)
			{
				_dIndexAry.push.apply(_dIndexAry, _indexAry);
			}
			if (_index == _iCnt)
			{
				_isSearching = false;
			}
		}
	}


	/////************内部类
	function ContinueSearchCtor()
	{
		let _loopHandler = null, _isSearching = false;
		let _dIndexAry4Loop = null;
		let _index = 0, _iCnt = 0;
		return { StopLooper, Search, IsSearching };//返回类对像

		function IsSearching()
		{
			return _isSearching;
		}

		function StopLooper()
		{
			if (_loopHandler)
			{
				clearTimeout(_loopHandler);
				_loopHandler = null;
			}
			_isSearching = false;
			"debug code";
			console.log('Continue StopLooper');
			"end debug code";
		}

		function Search(
			dIndexAry: Array<number>,
			data: any[],
			filter: (d) => boolean,
			cbOfComplete: () => void
		)
		{
			StopLooper();
			_isSearching = true;
			//之前未来查询完的元素
			let _dIndexAryOdd = _dIndexAry4Loop ?
				_dIndexAry4Loop.slice(_index) //返回数组中 >=_index 的元素
				: [];
			//b=a.splice(0) => a（清空）将数组元素->移到->b
			_dIndexAry4Loop = dIndexAry.splice(0).concat(_dIndexAryOdd);

			_index = 0, _iCnt = _dIndexAry4Loop.length;
			_loopHandler = setTimeout(
				() =>
				{
					doInnerLoop();
				},
				300
			);
			return dIndexAry;

			function doInnerLoop()
			{
				"debug code";
				console.log(`ContinueSearch _index=${_index} _iCnt = ${_iCnt}`);
				"end debug code";
				let _loopCnt = 0;
				let _indexAry = [];
				for (; _index < _iCnt; _index++)
				{
					let _dIndex = _dIndexAry4Loop[_index];//***
					if (filter(data[_dIndex]))
					{
						_indexAry.push(_dIndex);
					}
					_loopCnt++;
					if (_loopCnt >= 250)
					{
						_loopHandler = setTimeout(
							() =>
							{
								doInnerLoop();
							},
							300
						);
						break;
					}
				}
				if (_indexAry.length > 0)
				{
					dIndexAry.push.apply(dIndexAry, _indexAry);
				}
				if (_index == _iCnt)
				{
					_isSearching = false;
					if (cbOfComplete)
					{
						cbOfComplete();
					}
				}
			}
		}
	}
}

export default Vue.extend(
	{
		render: function (h, params)
		{
			return VueComponentRender(
				this,
				h,
				params
			);
		} ,
		props: new VmProps(),
		data: function ()
		{
			return new VmData();
		},
		//使用jsx computed和methods可以一起写在闭包里
		//computed: VmProxyFactory(VmComputed),
		watch: new VmWatch(),
		mounted: function (
			this: VmType
		)
		{
			for (var _i = 0; _i < this.data.length; _i++)
			{
				this.DataIndexArray.push(_i);
			}
		},
		destroyed: function ()
		{
			//hook: {
			//	'create': function (vNode0, vNode1)
			//	{
			//		_vNodeOfPopper = vNode1;
			//		UpPopper();
			//	},
			//	'destroy': function (vNode0)
			//	{
			//		if (_Popper)
			//		{
			//			_Popper.destroy();
			//			_Popper = null;
			//		}
			//	}
			//}
		},
		methods: {}
	}
)
