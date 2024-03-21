export interface ITimeline {
   type: 'date'
   values: number[]
}

export interface IVertices {
   name: string
   color: string
   values: number[]
}

// prettier-ignore
export interface IChartOptions {
   width: number
   height: number
   padding: number
   rowsCount: number
   data: {
      timeline: ITimeline | null
      vertices: IVertices[]
   }
   i18n: {
      months: string[]
   }
   interactivity: {
      horisontalGuide: boolean,
      guideDotsRadius: number,
      fpsLimit: number
   },
   style: {
      textFont: string
      textColor: string
      secondaryColor: string
      backgroundColor: string
   }
   technical: {
      insertMethod: 'append' | 'prepend' | ((containerElement: HTMLElement, chartWrapperElement: HTMLDivElement) => void)
      immediateInit: boolean
   }
}
