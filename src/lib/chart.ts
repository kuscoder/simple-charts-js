import { ChartOptionsError } from './chart-error'
import type { IDataAxisX, IDataAxisY, IChartOptions } from './types'

export class Chart {
   // Static options preset
   private static presetOptions: IChartOptions = {
      width: 600,
      height: 250,
      padding: 40,
      rowsCount: 5,
      i18n: {
         months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      data: {
         xAxis: null,
         yAxis: []
      },
      style: {
         textFont: 'normal 20px Helvetica,sans-serif',
         textColor: '#96a2aa',
         secondaryColor: '#bbbbbb'
      },
      immediate: true
   }

   // Options
   private readonly WIDTH: number
   private readonly HEIGHT: number
   private readonly PADDING: number
   private readonly ROWS_COUNT: number
   private readonly MONTHS_NAMES: string[]

   private readonly DATA: {
      xAxis: IDataAxisX | null
      yAxis: IDataAxisY[]
   }

   private readonly STYLES: {
      textFont: string
      textColor: string
      secondaryColor: string
   }

   // Calculated
   private readonly DPI_WIDTH: number
   private readonly DPI_HEIGHT: number
   private readonly VIEW_WIDTH: number
   private readonly VIEW_HEIGHT: number
   private readonly Y_BOUNDARIES: [number, number]
   private readonly X_RATIO: number
   private readonly Y_RATIO: number
   private readonly ROWS_STEP: number
   private readonly TEXT_STEP: number
   private readonly X_AXIS_DATA_COUNT: number
   private readonly X_AXIS_DATA_STEP: number

   // Interactivity
   private isInitialized: boolean = false
   private rafID: number = 0

   private readonly mouse: {
      x?: number | null
      y?: number | null
   }

   // DOM
   private readonly container: HTMLElement
   private readonly canvas: HTMLCanvasElement
   private readonly ctx: CanvasRenderingContext2D
   private canvasRect: DOMRect | null

   /** */
   constructor(container: HTMLElement, options: Partial<IChartOptions> = {}) {
      const formattedOptions = Chart.getOptions(options)
      const xLength = formattedOptions.data.xAxis?.values.length || 0
      const yLength = formattedOptions.data.yAxis[0].values.length

      // Options
      this.WIDTH = formattedOptions.width
      this.HEIGHT = formattedOptions.height
      this.PADDING = formattedOptions.padding
      this.ROWS_COUNT = formattedOptions.rowsCount
      this.MONTHS_NAMES = formattedOptions.i18n.months

      this.DATA = {
         xAxis: formattedOptions.data.xAxis,
         yAxis: formattedOptions.data.yAxis
      }

      this.STYLES = {
         textFont: formattedOptions.style.textFont,
         textColor: formattedOptions.style.textColor,
         secondaryColor: formattedOptions.style.secondaryColor
      }

      // Calculated
      this.DPI_WIDTH = this.WIDTH * 2
      this.DPI_HEIGHT = this.HEIGHT * 2
      this.VIEW_WIDTH = this.DPI_WIDTH
      this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2

      this.Y_BOUNDARIES = this.getBoundariesY(this.DATA.yAxis)
      this.X_RATIO = this.VIEW_WIDTH / (yLength - 1)
      this.Y_RATIO = this.VIEW_HEIGHT / (this.Y_BOUNDARIES[1] - this.Y_BOUNDARIES[0])

      this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT
      this.TEXT_STEP = (this.Y_BOUNDARIES[1] - this.Y_BOUNDARIES[0]) / this.ROWS_COUNT

      this.X_AXIS_DATA_COUNT = 6
      this.X_AXIS_DATA_STEP = xLength && Math.round(xLength / this.X_AXIS_DATA_COUNT)

      // Event handlers bindings
      this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
      this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this)
      this.drawGraph = this.drawGraph.bind(this)

      // Interactivity
      this.mouse = new Proxy(
         {},
         {
            set: (...args) => {
               const result = Reflect.set(...args)
               this.rafID = window.requestAnimationFrame(this.drawGraph)
               return result
            }
         }
      )

      // HTML Elements
      this.container = container
      this.canvas = document.createElement('canvas')
      this.canvas.style.width = this.WIDTH + 'px'
      this.canvas.style.height = this.HEIGHT + 'px'
      this.canvas.width = this.DPI_WIDTH
      this.canvas.height = this.DPI_HEIGHT
      this.ctx = this.canvas.getContext('2d')!

      // Initialize if in immediate mode
      if (formattedOptions.immediate) {
         this.initialize()
      }
   }

   /** Initializes the component by appending the canvas to the container element and drawing the chart */
   public initialize() {
      if (this.isInitialized) return
      this.isInitialized = true

      this.container.appendChild(this.canvas)
      this.canvas.addEventListener('mousemove', this.mouseMoveHandler)
      this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler)
      this.drawGraph()
   }

   /** Destroys the component from the DOM */
   public destroy() {
      if (!this.isInitialized) return
      this.isInitialized = false

      window.cancelAnimationFrame(this.rafID)
      this.canvas.removeEventListener('mousemove', this.mouseMoveHandler)
      this.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler)
      this.canvas.remove()
   }

   /** */
   private drawGraph() {
      this.clearAll()
      this.drawAxisX()
      this.drawAxisY()
      this.drawLines()
   }

   /** */
   private clearAll() {
      this.ctx.clearRect(0, 0, this.DPI_WIDTH, this.DPI_HEIGHT)
   }

   /** */
   private drawAxisX() {
      if (!this.DATA.xAxis) return

      // For X axis
      this.ctx.fillStyle = this.STYLES.textColor
      this.ctx.font = this.STYLES.textFont

      // For guides
      this.ctx.lineWidth = 2
      this.ctx.strokeStyle = this.STYLES.secondaryColor

      for (let i = 1; i <= this.DATA.xAxis.values.length; i++) {
         const x = this.getX(i)

         // Draw the X axis
         if ((i - 1) % this.X_AXIS_DATA_STEP === 0) {
            const text = this.getDate(this.DATA.xAxis.values[i - 1])
            this.ctx.fillText(text, x, this.DPI_HEIGHT - 10)
         }

         // Draw guides
         this.drawGuides(x)
      }
   }

   private drawGuides(x: number) {
      if (!this.mouse.x || !this.mouse.y) return

      const length = this.DATA.xAxis?.values.length || 0
      const isOver = length && Math.abs(x - this.mouse.x) < this.DPI_WIDTH / length / 2

      if (isOver) {
         // Y dashed line
         this.ctx.beginPath()
         this.ctx.setLineDash([20, 25])
         this.ctx.moveTo(0, this.mouse.y)
         this.ctx.lineTo(this.DPI_WIDTH, this.mouse.y)
         this.ctx.stroke()
         this.ctx.closePath()

         // X solid line
         this.ctx.beginPath()
         this.ctx.setLineDash([])
         this.ctx.moveTo(x, 0)
         this.ctx.lineTo(x, this.DPI_HEIGHT)
         this.ctx.stroke()
         this.ctx.closePath()
      }
   }

   /** */
   private drawAxisY() {
      this.ctx.lineWidth = 1
      this.ctx.strokeStyle = this.STYLES.secondaryColor
      this.ctx.fillStyle = this.STYLES.textColor
      this.ctx.font = this.STYLES.textFont
      this.ctx.beginPath()

      for (let i = 1; i <= this.ROWS_COUNT; i++) {
         const text = String(Math.round(this.Y_BOUNDARIES[1] - this.TEXT_STEP * i))
         const posY = i * this.ROWS_STEP + this.PADDING
         this.ctx.fillText(text, 5, posY - 10)
         this.ctx.moveTo(0, posY)
         this.ctx.lineTo(this.DPI_WIDTH, posY)
      }

      this.ctx.stroke()
      this.ctx.closePath()
   }

   /** */
   private drawLines() {
      this.ctx.lineWidth = 4

      for (const col of this.DATA.yAxis) {
         this.ctx.strokeStyle = col.color
         this.ctx.beginPath()

         for (let i = 0; i < col.values.length; i++) {
            const x = this.getX(i)
            const y = this.getY(col.values[i])
            this.ctx.lineTo(x, y)
         }

         this.ctx.stroke()
         this.ctx.closePath()
      }
   }

   /** */
   private mouseMoveHandler(e: MouseEvent) {
      this.canvasRect ??= this.canvas.getBoundingClientRect()
      this.mouse.x = (e.clientX - this.canvasRect.left) * 2
      this.mouse.y = (e.clientY - this.canvasRect.top) * 2
   }

   /** */
   private mouseLeaveHandler() {
      this.mouse.x = null
      this.mouse.y = null
   }

   /** */
   private getBoundariesY(columns: IDataAxisY[]) {
      let yMin: number | null = null
      let yMax: number | null = null

      for (const col of columns) {
         for (const y of col.values) {
            yMin = yMin === null || y < yMin ? y : yMin
            yMax = yMax === null || y > yMax ? y : yMax
         }
      }

      return [yMin, yMax] as [number, number]
   }

   /** */
   private getDate(timestamp: number) {
      const date = new Date(timestamp)
      const day = date.getDate()
      const month = date.getMonth()
      const months = this.MONTHS_NAMES
      return `${day} ${months[month]}`
   }

   /** */
   private getX(x: number) {
      return x * this.X_RATIO
   }

   /** */
   private getY(y: number) {
      return this.DPI_HEIGHT - this.PADDING - y * this.Y_RATIO
   }

   /** */
   private static validateOptions(options: Partial<IChartOptions> = {}): void {
      const {
         width,
         height,
         padding,
         rowsCount,
         i18n: { months } = {},
         data: { xAxis, yAxis } = {},
         style: { textFont, textColor, secondaryColor } = {},
         immediate
      } = options

      if (width) {
         if (typeof width !== 'number') throw new ChartOptionsError('width should be a number')
         if (width <= 0) throw new ChartOptionsError('width should be greater than 0')
         if (width % 2 !== 0) throw new ChartOptionsError('width should be an even number')
      }

      if (height) {
         if (typeof height !== 'number') throw new ChartOptionsError('height should be a number')
         if (height <= 0) throw new ChartOptionsError('height should be greater than 0')
         if (height % 2 !== 0) throw new ChartOptionsError('height should be an even number')
      }

      if (padding) {
         if (typeof padding !== 'number') throw new ChartOptionsError('padding should be a number')
         if (padding < 0) throw new ChartOptionsError('padding should be greater or equal to 0')
      }

      if (rowsCount) {
         if (typeof rowsCount !== 'number') throw new ChartOptionsError('rowsCount should be a number')
         if (rowsCount <= 0) throw new ChartOptionsError('rowsCount should be greater than 0')
      }

      if (months) {
         if (!Array.isArray(months)) throw new ChartOptionsError('i18n.months should be an array')
         if (months.length !== 12) throw new ChartOptionsError('i18n.months should have 12 elements')
      }

      if (xAxis) {
         if (typeof xAxis !== 'object') throw new ChartOptionsError('data.xAxis should be an object')
         if (typeof xAxis.type !== 'string') throw new ChartOptionsError('data.xAxis.type should be a string')
         if (!['date'].includes(xAxis.type)) throw new ChartOptionsError('data.xAxis.type should be "date"')
         if (!Array.isArray(xAxis.values)) throw new ChartOptionsError('data.xAxis.values should be an array')

         if (xAxis.type === 'date') {
            xAxis.values.forEach((value, i) => {
               if (typeof value !== 'number') throw new ChartOptionsError(`data.xAxis.values[${i}] should be a number`)
            })
         }
      }

      if (yAxis) {
         if (!Array.isArray(yAxis)) throw new ChartOptionsError('data.columns should be an array')

         yAxis.forEach((col, i) => {
            if (typeof col.name !== 'string') throw new ChartOptionsError(`data.yAxis[${i}].name should be a string`)
            if (typeof col.color !== 'string') throw new ChartOptionsError(`data.yAxis[${i}].color should be a string`)
            if (!Array.isArray(col.values)) throw new ChartOptionsError(`data.yAxis[${i}].values should be an array`)

            col.values.forEach((value, j) => {
               if (typeof value !== 'number')
                  throw new ChartOptionsError(`data.yAxis[${i}].values[${j}] should be a number`)
            })
         })
      }

      if (textFont) {
         if (typeof textFont !== 'string') throw new ChartOptionsError('style.textFont should be a string')
      }

      if (textColor) {
         if (typeof textColor !== 'string') throw new ChartOptionsError('style.textColor should be a string')
      }

      if (secondaryColor) {
         if (typeof secondaryColor !== 'string') throw new ChartOptionsError('style.secondaryColor should be a string')
      }

      if (immediate) {
         if (typeof immediate !== 'boolean') throw new ChartOptionsError('immediate should be a boolean')
      }
   }

   /** */
   private static getOptions(options: Partial<IChartOptions> = {}): IChartOptions {
      this.validateOptions(options)

      return {
         width: options.width || this.presetOptions.width,
         height: options.height || this.presetOptions.height,
         padding: options.padding || this.presetOptions.padding,
         rowsCount: options.rowsCount || this.presetOptions.rowsCount,
         i18n: {
            months: options.i18n?.months || this.presetOptions.i18n.months
         },
         style: {
            textFont: options.style?.textFont || this.presetOptions.style.textFont,
            textColor: options.style?.textColor || this.presetOptions.style.textColor,
            secondaryColor: options.style?.secondaryColor || this.presetOptions.style.secondaryColor
         },
         data: {
            xAxis: options.data?.xAxis || this.presetOptions.data.xAxis,
            yAxis: options.data?.yAxis || this.presetOptions.data.yAxis
         },
         immediate: options.immediate ?? this.presetOptions.immediate
      }
   }

   /**
    * Updates the preset options with the provided options.
    *
    * @param {Partial<IChartOptions>} options - The options to update the preset options with. Default is an empty object.
    */
   public static changePresetOptions(options: Partial<IChartOptions> = {}) {
      this.validateOptions(options)
      this.presetOptions.width = options.width || this.presetOptions.width
      this.presetOptions.height = options.height || this.presetOptions.height
      this.presetOptions.padding = options.padding || this.presetOptions.padding
      this.presetOptions.rowsCount = options.rowsCount || this.presetOptions.rowsCount
      this.presetOptions.i18n.months = options.i18n?.months || this.presetOptions.i18n.months
      this.presetOptions.style.textFont = options.style?.textFont || this.presetOptions.style.textFont
      this.presetOptions.style.textColor = options.style?.textColor || this.presetOptions.style.textColor
      this.presetOptions.style.secondaryColor = options.style?.secondaryColor || this.presetOptions.style.secondaryColor
      this.presetOptions.data.xAxis = options.data?.xAxis || this.presetOptions.data.xAxis
      this.presetOptions.data.yAxis = options.data?.yAxis || this.presetOptions.data.yAxis
      this.presetOptions.immediate = options.immediate || this.presetOptions.immediate
   }
}
