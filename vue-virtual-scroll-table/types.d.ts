declare interface ColumnConfig
{
	title: string
	sortable: boolean
	width: number
	disableDrag: boolean
	fixed: string
	//getSortValue: (a: any) => void
	renderHeader: (h: any, params:any) => any
	render: (h: any, params: any) => any
	key: string
	noNeedVertical: boolean
	enableEllipsis: boolean
}