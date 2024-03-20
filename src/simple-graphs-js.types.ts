export interface ISimpleGraphsJSColumn<F extends boolean = false> {
   type: string
   name: string
   color: string
   values: F extends true ? [number, number][] : number[]
}

export interface ISimpleGraphsJSOptions {
   width: number
   height: number
   padding: number
   rows: number
   i18n: {
      months: string[]
   }
   style: {
      textFont: string
      textColor: string
   }
   data: {
      columns: ISimpleGraphsJSColumn<false>[]
      dates: number[]
   }
}
