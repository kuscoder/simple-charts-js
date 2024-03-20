export interface IDataAxisX {
   type: 'date'
   values: number[]
}

export interface IDataAxisY {
   name: string
   color: string
   values: number[]
}

export interface IChartOptions {
   width: number
   height: number
   padding: number
   rowsCount: number
   i18n: {
      months: string[]
   }
   data: {
      xAxis: IDataAxisX | null
      yAxis: IDataAxisY[]
   }
   style: {
      textFont: string
      textColor: string
      secondaryColor: string
   }
   immediate: boolean
}
