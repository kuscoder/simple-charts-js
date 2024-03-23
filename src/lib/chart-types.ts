export interface ITimeline {
   type: 'date'
   values: number[]
}

export interface ILines {
   key: string
   name: string
   color: string
   vertices: number[]
}

export interface IChartOptions {
   width: number
   height: number
   padding: number
   rowsCount: number
   data: {
      timeline: ITimeline | null
      lines: ILines[]
   }
   i18n: {
      months: string[]
   }
   interactivity: {
      horisontalGuide: boolean
      guideDotsRadius: number
      fpsLimit: number
      disable: boolean
   }
   style: {
      textFont: string
      textColor: string
      secondaryColor: string
      backgroundColor: string
      classNames: {
         wrapper: string
         canvas: string
         tooltip: string
      }
   }
   technical: {
      debug: boolean
      insertMethod: InsertMethod
      immediateInit: boolean
   }
}

export type InsertMethod =
   | 'append'
   | 'prepend'
   | ((containerElement: HTMLElement, chartWrapperElement: HTMLDivElement) => void)
