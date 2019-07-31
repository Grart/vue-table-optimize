import Vue, { VNode } from "vue";
import Popper from 'popper.js/dist/umd/popper.js';
import PopperComponent from './Popper';


const _GlobalElement = document.createElement('div');
document.body.appendChild(_GlobalElement);

class VmData {
	DataIndexArray: Array<number> = [];
	ComponentInstance: any = null;
	PopperInstance: any = null;
}

class VmProps {
	value = String as any as string;
	data = Array as any as any[];//传入数据，数组类型
	keyField = String as any as string;////数据唯一标志字段
	valueField = String as any as string;////要显示的字段
	columns = Array as any as any[];////下拉表格要显示的列{title:string,key:string}
	filterMethod: (val: string, dObjh: any) => boolean = null;
	pageCount = Number as any as number;
}

declare type VmType = VmData & VmProps & Vue;

export default
	{
		render: function (
			this,
			h,
			params
		) {
			let _$this = this;
			let _componentInstance = _$this.ComponentInstance;
			let _prvInputText = "", _inputHasChange = false;
			let _searcher = null;
			if (_componentInstance) {
				_searcher = _componentInstance.Searcher;
				_componentInstance.DataIndexArray = _$this.DataIndexArray;
			}

			let _popper = _$this.PopperInstance;
			if (null != _popper) {
				_popper.reference = _$this.$el;
				_popper.scheduleUpdate();
				_popper.update();
			}

			return (
				<div class="ivu-poptip">
					<input
						{...{
							ref: "InputRef",
							attrs: {
								'icon': "arrow-down-b",
								'value': _$this.InputText
							},
							on: {
								'input': HandlerInput,
								'click': HandlerInputClick,
								'blur': HandlerBlur,
								'keydown': HandlerInputKeydown
							},
							nativeOn: {
							}
						}}>
					</input>
				</div>
			);

			function PoperCanVisible() {
				return _searcher.IsSearching() || _$this.DataIndexArray.length > 0;
			}

			function HandlerInput(
				event//InputEvent 
			) {
				let _value = event.target.value;
				console.log(event);
				console.log(_value);
				_inputHasChange = true;
				_$this.InputText = _value;
				_$this.DataIndexArray = GenerDataIndexArray(_value);
			};

			function HandlerInputClick(
				event
			) {
				console.log(event);
				_$this.DataIndexArray = GenerDataIndexArray(_$this.InputText);
				let _elementInput: any = _$this.$refs.InputRef;
				_elementInput.focus();
			}

			function HandlerBlur(
				event//FocusEvent 
			) {
				return;
				console.log(event);
				SetInputText();
				_searcher.StopLooper();
				_$this.FocusIndex = -1;
				_$this.DataIndexArray = [];
			}

			function HandlerInputKeydown(
				event: KeyboardEvent
			) {
				console.log(event);
				if (40 == event.keyCode)//下
				{
					if (!PoperCanVisible()) {
						_$this.DataIndexArray = GenerDataIndexArray(_$this.InputText);
					}
					if ((_$this.FocusIndex + 1) < _$this.DataIndexArray.length) {
						_$this.FocusIndex++;
					}
					"debug code"
					console.log(_$this.FocusIndex);
					"end debug code"
					//UpdatePoperScroll();
					return StopEvent(event);
				}
				if (38 == event.keyCode)//上
				{
					if (!PoperCanVisible()) {
						_$this.DataIndexArray = GenerDataIndexArray(_$this.InputText);
					}
					if (_$this.FocusIndex > 0) {
						_$this.FocusIndex--;
					}
					else {
						_$this.FocusIndex = 0;
					}
					//UpdatePoperScroll();
					return StopEvent(event);
				}
				if (13 == event.keyCode//回车
					&& 0 != _$this.DataIndexArray.length
				) {
					SetInputText();
					return StopEvent(event);
				}
				return true;
			};


			function GenerDataIndexArray(
				txt: string
			) {
				let _dIndexAry = [];
				//continueSearch ?: boolean
				if (!txt
					|| (txt = txt.trim().toUpperCase()).length == 0
				) {
					_$this.FocusIndex = - 1;
					_searcher.StopLooper();
					return [];
				}
				if (_prvInputText === txt && PoperCanVisible()) {
					return _dIndexAry;
				}

				_searcher.StopLooper();

				let _filter = (dObj) => {
					let result = true;
					if (_$this.filterMethod) {
						result = _$this.filterMethod(txt, dObj);
					}
					else {
						result = dObj[_$this.keyField].indexOf(txt) >= 0;
					}
					return result;
				};
				const _data = _$this.data;

				let _continueSearch = _prvInputText && txt.startsWith(_prvInputText);
				_prvInputText = txt;

				_dIndexAry = _searcher.Search(_data, _filter, _continueSearch);
				if (_dIndexAry.length == 0) {
					_$this.FocusIndex = - 1;
				}
				return _dIndexAry;
			};


			function SetInputText() {
				if (!_inputHasChange) {
					return;
				}
				let _dObj = null;
				if (_$this.FocusIndex >= 0) {
					let _index = _$this.DataIndexArray[_$this.FocusIndex];
					_dObj = _$this.data[_index];
					_$this.InputText = _dObj[_$this.keyField];
				}
				else {
					_$this.InputText = "";
				}

				_$this.$emit('input', _$this.InputText, _dObj);
				_$this.FocusIndex = - 1;
				_$this.DataIndexArray = [];
				let _elementInput: any = _$this.$refs.InputRef;
				_elementInput.focus();
				_inputHasChange = false;
			};
		},
		props: new VmProps(),
		data: function () {
			return new VmData();
		},
		mounted: function (
			this: VmType
		) {
			let _$this = this;
			if (null == _$this.ComponentInstance) {
				let _componentInstance = new PopperComponent(
					{
						propsData: {
							data: _$this.data,
							columns: _$this.columns,
							pageCount: 20
						}
					});
				_componentInstance.$mount();
				_GlobalElement.appendChild(_componentInstance.$el);
				_$this.ComponentInstance = _componentInstance;
				let _popper = _$this.PopperInstance;
				if (null == _popper) {
					_popper = new Popper(
						_$this.$el,//rel
						_componentInstance.$el,
						{
							placement: "bottom-start",
							modifiers: {
								flip: {
									behavior: ['left', 'bottom', 'top']
								},
								computeStyle: {
									gpuAcceleration: false
								},
								preventOverflow: {
									boundariesElement: 'window'
									//boundariesElement: 'container',
								}
							},
							onCreate: () => {
								_$this.$nextTick(() => { _popper && _popper.update(); });
							},
							onUpdate: () => {
							}
						});
					_$this.PopperInstance = _popper;
				}
				else {
					_popper.reference = _$this.$el;
					_popper.scheduleUpdate();
					_popper.update();
				}

			}
		},
		destroyed: function () {
			let _$this = this;
			console.log('top destroyed d');
			let _componentInstance = _$this.ComponentInstance;
			if (_componentInstance) {
				let _el = _componentInstance.$el;
				if (_el.remove) {
					_el.remove();
				}
				else if (_el.parentNode && _el.parentNode.removeChild) {
					_el.parentNode.removeChild(_el);
				}
				_componentInstance.$destroy();
			}
			let _popper = _$this.PopperInstance;
			if (_popper) {
				_popper.destroy();
				_$this.PopperInstance = null;
			}
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
	};

function StopEvent(event: Event)
{
	if (event.stopPropagation)
	{
		event.stopPropagation();
	}
	else
	{
		event.cancelBubble = true;
	}

	if (event.preventDefault)
	{
		event.preventDefault();
	}
	else
	{
		event.returnValue = false;
	}
	return false;
}