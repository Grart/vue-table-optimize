export default {
	name: 'TableExpand',
	functional: true,
	props: {
		row: Object,
		render: Function,
		columnIndex: Number,
		column: {
			type: Object,
			default: null,
		},
	},
	render: (h, ctx) =>
	{
		let _props = ctx.props;
		let _row = _props.row;
		const params = {
			row: _row,
			index: _row ? _row.__dataIndex : -1,//ºÊ»›‘≠ Ù–‘
			column: _props.column,
			columnIndex: _props.columnIndex
		};
		return _props.render(h, params);
	},
};
