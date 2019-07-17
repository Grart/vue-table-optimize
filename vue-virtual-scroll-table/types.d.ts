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
	/*���ڼ�¼��ʼ���**/
	defaultWidth?: number & string
	/*�����ʽ�ַ� px **/
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