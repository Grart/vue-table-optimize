declare interface ColumnConfig
{
	title: string
	sortable: boolean
	width: number
	disableDrag: boolean
	fixed: string
	//getSortValue: (a: any) => void
	renderHeader?: (h: any, params: any) => any
	render: (h: any, params: any) => any
	key: string
	noNeedVertical: boolean
	enableEllipsis: boolean
	/*用于记录初始宽度**/
	defaultWidth?: number & string
	/*宽度样式字符 px **/
	cWidth?: string
}

declare interface ScrollSynclData 
{
	scrollTop: number
	scrollLeft: number
	scrollbarWidth: number
	offsetWidth: number
	hover_index: number
	clicked_index: number
	virtualItems: {
		renderData: any[]
		newItems?: any[]
		replaceItemsIndex?: number
	}
}