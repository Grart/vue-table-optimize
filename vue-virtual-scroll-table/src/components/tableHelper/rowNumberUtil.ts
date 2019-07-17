//表格多选列
//checkbox 组件
const RowNumberCell = {
	name: 'RowNumberCell',
	props: {
		cellText: String,
		select: Boolean
	},
	data()
	{
		return {}
	},
	render: function (h, params)
	{
		console.log(params);
		let _$this = this;
		return h(
			"div",
			{
				on: {
				}
			},
			[
				h(
					"span",
					{
						//staticClass: "",
						staticStyle: {
							'font-size': '12px',
							'width': '40px',
							'font-weight': _$this.select ? 'bold' : '', 
							'color': _$this.select ? '#2d8cf0' : '',
							//'background-color': '#f8f8f9'
						},
						attrs: {}
					},
					_$this.cellText
				)
			]
		);
	}
};

export function generateRowNumberColumn(
	vmThis,
	//主表体组件this
	tableOwner
)
{
	return {
		title: '序号',
		sortable: true,
		width: 45,//右边框1px
		disableDrag: true,
		fixed: 'left',
		renderHeader: function (h, params)
		{
			return h(
				RowNumberCell,
				{
					props: {
						cellText: "序号"
					}
				}
			);
		},
		render: function (h, params)
		{
			let _row = params.row;
			let _index = _row.__dataIndex;
			return h(
				RowNumberCell,
				{
					props: {
						cellText: `${_index + 1}`,
						select: vmThis.scrollSynclData.clicked_index == _index
					}
				}
			);
		},
		key: '',
		noNeedVertical: true,
		enableEllipsis: true,
	};
}