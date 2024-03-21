import { debounce } from '@/utils'
import { ChartOptionsError } from './chart-error'
import type { IDataAxisY, IChartOptions } from './types'

export class Chart {
   // Static options preset
   private static presetOptions: IChartOptions = {
      width: 600,
      height: 250,
      padding: 40,
      rowsCount: 5,
      guideDotsRadius: 8,
      data: {
         xAxis: null,
         yAxis: []
      },
      i18n: {
         months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      style: {
         textFont: 'normal 20px Helvetica,sans-serif',
         textColor: '#96a2aa',
         secondaryColor: '#bbbbbb',
         backgroundColor: '#ffffff'
      },
      flags: {
         horGuide: true,
         immediateInit: true
      },
      insertMethod: 'append'
   }

   // Options
   private readonly WIDTH: IChartOptions['width']
   private readonly HEIGHT: IChartOptions['height']
   private readonly PADDING: IChartOptions['padding']
   private readonly ROWS_COUNT: IChartOptions['rowsCount']
   private readonly GUIDE_DOTS_RADIUS: IChartOptions['guideDotsRadius']
   private readonly DATA: IChartOptions['data']
   private readonly I18N: IChartOptions['i18n']
   private readonly STYLE: IChartOptions['style']
   private readonly FLAGS: IChartOptions['flags']
   private readonly INSERT_METHOD: IChartOptions['insertMethod']

   // Calculated
   private readonly DPI_WIDTH: number
   private readonly DPI_HEIGHT: number
   private readonly VIEW_WIDTH: number
   private readonly VIEW_HEIGHT: number
   private readonly Y_AXIS_DATA_BOUNDARIES: [number, number]
   private readonly X_RATIO: number
   private readonly Y_RATIO: number
   private readonly ROWS_STEP: number
   private readonly TEXT_STEP: number
   private readonly X_AXIS_DATA_COUNT: number
   private readonly X_AXIS_DATA_STEP: number

   // Interactivity
   private readonly mouse: { x?: number | null; y?: number | null }
   private isInitialized: boolean = false
   private rafID: number = 0

   // DOM
   private containerElement: HTMLElement
   private wrapperElement: HTMLDivElement
   private canvasElement: HTMLCanvasElement
   private tooltipElement: HTMLDivElement
   private canvasRect: DOMRect | null
   private ctx: CanvasRenderingContext2D

   /**
    * Constructor for creating a new instance of the Chart class.
    *
    * @param {HTMLElement} containerElement - the HTML element that will contain the chart
    * @param {Partial<IChartOptions>} options - optional chart options
    */
   constructor(containerElement: HTMLElement, options: Partial<IChartOptions> = {}) {
      const formattedOptions = Chart.getOptions(options)
      const xLength = formattedOptions.data.xAxis?.values.length || 0
      const yLength = this.getAxisYDataLength(formattedOptions.data.yAxis)

      // Chart container
      this.containerElement = containerElement

      // Options
      this.WIDTH = formattedOptions.width
      this.HEIGHT = formattedOptions.height
      this.PADDING = formattedOptions.padding
      this.ROWS_COUNT = formattedOptions.rowsCount
      this.GUIDE_DOTS_RADIUS = formattedOptions.guideDotsRadius
      this.DATA = formattedOptions.data
      this.I18N = formattedOptions.i18n
      this.STYLE = formattedOptions.style
      this.FLAGS = formattedOptions.flags
      this.INSERT_METHOD = formattedOptions.insertMethod

      // Calculated
      this.DPI_WIDTH = this.WIDTH * 2
      this.DPI_HEIGHT = this.HEIGHT * 2
      this.VIEW_WIDTH = this.DPI_WIDTH
      this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2
      this.Y_AXIS_DATA_BOUNDARIES = this.getYAxisDataBoundaries(this.DATA.yAxis)
      this.X_RATIO = this.VIEW_WIDTH / (yLength - 1)
      this.Y_RATIO = this.VIEW_HEIGHT / (this.Y_AXIS_DATA_BOUNDARIES[1] - this.Y_AXIS_DATA_BOUNDARIES[0])
      this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT
      this.TEXT_STEP = (this.Y_AXIS_DATA_BOUNDARIES[1] - this.Y_AXIS_DATA_BOUNDARIES[0]) / this.ROWS_COUNT
      this.X_AXIS_DATA_COUNT = 6
      this.X_AXIS_DATA_STEP = xLength && Math.round(xLength / this.X_AXIS_DATA_COUNT)

      // Event handlers bindings
      this.resizeHandler = debounce(this.resizeHandler.bind(this), 100)
      this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
      this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this)
      this.drawChart = this.drawChart.bind(this)

      // Interactivity
      this.mouse = new Proxy(
         {},
         {
            set: (...args) => {
               const result = Reflect.set(...args)
               this.rafID = window.requestAnimationFrame(this.drawChart)
               return result
            }
         }
      )

      // Create chart DOM elements
      this.createDOMElements()

      // Initialize if in immediate mode
      if (this.FLAGS.immediateInit) {
         this.initialize()
      }
   }

   /** Create the necessary DOM elements for the chart, but does not insert into the DOM. */
   private createDOMElements(): void {
      // Chart wrapper
      this.wrapperElement = document.createElement('div')
      this.wrapperElement.className = 'simple-chart'

      // Canvas
      this.canvasElement = document.createElement('canvas')
      this.canvasElement.className = 'simple-chart__canvas'
      this.canvasElement.width = this.DPI_WIDTH
      this.canvasElement.height = this.DPI_HEIGHT
      this.canvasElement.style.width = this.WIDTH + 'px'
      this.canvasElement.style.height = this.HEIGHT + 'px'
      this.ctx = this.canvasElement.getContext('2d')!

      // Tooltip
      this.tooltipElement = document.createElement('div')
      this.tooltipElement.className = 'simple-chart__tooltip'
   }

   /** Initializes the component by appending the canvas to the container element and drawing the chart. */
   public initialize(): void {
      if (this.isInitialized) return
      this.isInitialized = true

      // Insert into DOM
      if (this.INSERT_METHOD === 'append') {
         this.containerElement.appendChild(this.wrapperElement)
      } else if (this.INSERT_METHOD === 'prepend') {
         this.containerElement.insertBefore(this.wrapperElement, this.containerElement.firstChild)
      } else {
         this.INSERT_METHOD(this.containerElement, this.wrapperElement)
      }
      this.wrapperElement.appendChild(this.canvasElement)
      this.wrapperElement.appendChild(this.tooltipElement)

      // Add event listeners and drawing
      window.addEventListener('resize', this.resizeHandler)
      window.addEventListener('orientationchange', this.resizeHandler)
      this.canvasElement.addEventListener('mousemove', this.mouseMoveHandler)
      this.canvasElement.addEventListener('mouseleave', this.mouseLeaveHandler)
      this.drawChart()
   }

   /** Destroys the component from the DOM. */
   public destroy(): void {
      if (!this.isInitialized) return
      this.isInitialized = false

      // Delete from DOM
      this.wrapperElement.removeChild(this.tooltipElement)
      this.wrapperElement.removeChild(this.canvasElement)
      this.containerElement.removeChild(this.wrapperElement)

      // Remove event listeners and cancel animations frames
      window.cancelAnimationFrame(this.rafID)
      window.removeEventListener('resize', this.resizeHandler)
      window.removeEventListener('orientationchange', this.resizeHandler)
      this.canvasElement.removeEventListener('mousemove', this.mouseMoveHandler)
      this.canvasElement.removeEventListener('mouseleave', this.mouseLeaveHandler)
   }

   /** Main method that draws the chart by clearing the canvas. */
   private drawChart(): void {
      console.log('draw')
      this.drawBackground()
      this.drawAxisX()
      this.drawAxisY()
      this.drawLines()
   }

   /** Draws the background of the chart. */
   private drawBackground(): void {
      this.ctx.fillStyle = this.STYLE.backgroundColor
      this.ctx.fillRect(0, 0, this.DPI_WIDTH, this.DPI_HEIGHT)
   }

   /** Draws the X axis of the chart and guide lines. */
   private drawAxisX(): void {
      if (!this.DATA.xAxis) return

      // For X axis
      this.ctx.fillStyle = this.STYLE.textColor
      this.ctx.font = this.STYLE.textFont

      // For guides
      this.ctx.lineWidth = 2
      this.ctx.strokeStyle = this.STYLE.secondaryColor

      for (let i = 1; i <= this.DATA.xAxis.values.length; i++) {
         const x = this.getX(i)

         // Draw the X axis
         if ((i - 1) % this.X_AXIS_DATA_STEP === 0) {
            const text = this.getDate(this.DATA.xAxis.values[i - 1])
            this.ctx.fillText(text, x, this.DPI_HEIGHT - 10)
         }

         // Draw guides
         this.drawGuideLinesIsOver(x)
      }
   }

   /**
    * Draws the guide lines if the mouse-x is over the y-axis data item.
    *
    * @param {number} x - The x-coordinate to check for mouse position and draw the guide lines.
    * @return {boolean} true if the guide lines were drawn, false otherwise
    */
   private drawGuideLinesIsOver(x: number): boolean {
      if (this.mouse.x && this.mouse.y) {
         const isOver = this.isMouseOverYAxisDataItem(x)
         const topHeight = this.PADDING / 2
         const bottomHeight = this.DPI_HEIGHT - this.PADDING

         if (isOver && this.mouse.y >= topHeight) {
            // Dashed horizontal guide line
            if (this.FLAGS.horGuide && this.mouse.y <= bottomHeight) {
               this.ctx.beginPath()
               this.ctx.setLineDash([20, 25])
               this.ctx.moveTo(0, this.mouse.y)
               this.ctx.lineTo(this.DPI_WIDTH, this.mouse.y)
               this.ctx.stroke()
               this.ctx.closePath()
            }

            // Solid vertical guide line
            this.ctx.beginPath()
            this.ctx.setLineDash([])
            this.ctx.moveTo(x, topHeight)
            this.ctx.lineTo(x, bottomHeight)
            this.ctx.stroke()
            this.ctx.closePath()

            // Dot in the top of the vertical guide line
            this.ctx.beginPath()
            this.ctx.arc(x, topHeight, 2, 0, 2 * Math.PI)
            this.ctx.fill()
            this.ctx.stroke()
            this.ctx.closePath()

            return true
         }
      }

      return false
   }

   /** Draws the Y axis of the chart. */
   private drawAxisY(): void {
      this.ctx.lineWidth = 1
      this.ctx.strokeStyle = this.STYLE.secondaryColor
      this.ctx.fillStyle = this.STYLE.textColor
      this.ctx.font = this.STYLE.textFont
      this.ctx.beginPath()

      for (let i = 1; i <= this.ROWS_COUNT; i++) {
         const text = String(Math.round(this.Y_AXIS_DATA_BOUNDARIES[1] - this.TEXT_STEP * i))
         const y = i * this.ROWS_STEP + this.PADDING
         this.ctx.fillText(text, 5, y - 10)
         this.ctx.moveTo(0, y)
         this.ctx.lineTo(this.DPI_WIDTH, y)
      }

      this.ctx.stroke()
      this.ctx.closePath()
   }

   /** Draws the lines of the chart. */
   private drawLines(): void {
      this.ctx.lineWidth = 4
      this.ctx.fillStyle = this.STYLE.backgroundColor

      for (const col of this.DATA.yAxis) {
         let overX: number | null = null
         let overY: number | null = null

         this.ctx.strokeStyle = col.color
         this.ctx.beginPath()

         for (let i = 0; i < col.values.length; i++) {
            const x = this.getX(i)
            const y = this.getY(col.values[i])
            this.ctx.lineTo(x, y)

            // Write x and y values if the mouse-x is over the y-axis data item
            if (this.isMouseOverYAxisDataItem(x)) {
               overX = x
               overY = y
            }
         }

         this.ctx.stroke()
         this.ctx.closePath()

         // Draw guide dots if the mouse-x is over the y-axis data item
         if (overX && overY && this.mouse.x && this.mouse.y && this.mouse.y >= this.PADDING / 2) {
            this.ctx.beginPath()
            this.ctx.arc(overX, overY, this.GUIDE_DOTS_RADIUS, 0, 2 * Math.PI)
            this.ctx.fill()
            this.ctx.stroke()
            this.ctx.closePath()
         }
      }
   }

   /** Event handler that updates the mouse position by canvas coordinates. */
   private mouseMoveHandler(e: MouseEvent): void {
      this.canvasRect ??= this.canvasElement.getBoundingClientRect()
      this.mouse.x = (e.clientX - this.canvasRect.left) * 2
      this.mouse.y = (e.clientY - this.canvasRect.top) * 2
   }

   /** Event handler that resets the mouse position when the mouse leaves the canvas. */
   private mouseLeaveHandler(): void {
      this.mouse.x = null
      this.mouse.y = null
   }

   /** Event handler that update the chart interactivity when the window is resized. */
   private resizeHandler(): void {
      this.canvasRect = this.canvasElement.getBoundingClientRect()
   }

   /**
    * Generates boundaries for the y-axis based on the provided columns.
    *
    * @param {IDataAxisY[]} columns - an array of data axis Y values
    * @return {[number, number]} an array containing the minimum and maximum y values
    */
   private getYAxisDataBoundaries(columns: IDataAxisY[]): [number, number] {
      let yMin: number | null = null
      let yMax: number | null = null

      for (const col of columns) {
         for (const y of col.values) {
            if (yMin === null || y < yMin) yMin = y
            if (yMax === null || y > yMax) yMax = y
         }
      }

      return [yMin ?? 0, yMax ?? 0]
   }

   /**
    * Returns a formatted date string for x-axis based on the given timestamp.
    *
    * @param {number} timestamp - The timestamp to convert to a date.
    * @return {string} The formatted date string in the format "day month".
    */
   private getDate(timestamp: number): string {
      const date = new Date(timestamp)
      const day = date.getDate()
      const month = date.getMonth()
      return `${day} ${this.I18N.months[month]}`
   }

   /**
    * Converts x coordinate from x-axis data to canvas coordinate.
    *
    * @param {number} x - x coordinate in x-axis data
    * @return {number} x coordinate in canvas
    */
   private getX(x: number): number {
      return x * this.X_RATIO
   }

   /**
    * Converts x coordinate from y-axis data to canvas coordinate.
    *
    * @param {number} y - y coordinate in y-axis data
    * @return {number} y coordinate in canvas
    */
   private getY(y: number): number {
      return this.DPI_HEIGHT - this.PADDING - y * this.Y_RATIO
   }

   /**
    * Calculate the maximum length of the Y-axis data.
    *
    * @param {?IDataAxisY[]} yAxisData - optional parameter for the Y-axis data
    * @return {number} the maximum length of the Y-axis data.
    */
   private getAxisYDataLength(yAxisData?: IDataAxisY[]): number {
      yAxisData ??= this.DATA.yAxis
      let maxLength = 0

      for (const col of yAxisData) {
         if (col.values.length > maxLength) maxLength = col.values.length
      }

      return maxLength
   }

   /**
    * Checks if the mouse-x is hovering over an x-axis data item at its x-coordinate.
    *
    * @param {number} x - The x-axis data item coordinate to check.
    * @return {boolean} true if the mouse-x is hovering over the x-axis data item, false otherwise.
    */
   private isMouseOverYAxisDataItem(x: number): boolean {
      const length = this.getAxisYDataLength() - 1
      if (!length || !this.mouse.x) return false
      return Math.abs(x - this.mouse.x) < this.DPI_WIDTH / length / 2
   }

   /**
    * Validates the provided options for a chart constructor.
    *
    * @param {Partial<IChartOptions>} options - the options to be validated
    * @throws {ChartOptionsError} if the options are invalid
    * @return {void}
    */
   // prettier-ignore
   private static validateOptions(options: Partial<IChartOptions> = {}): void {
      const {
         width,
         height,
         padding,
         rowsCount,
         guideDotsRadius,
         data: { xAxis, yAxis } = {},
         i18n: { months } = {},
         style: { textFont, textColor, secondaryColor, backgroundColor } = {},
         flags: { horGuide, immediateInit } = {},
         insertMethod
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

      if (guideDotsRadius) {
         if (typeof guideDotsRadius !== 'number') throw new ChartOptionsError('guideDotsRadius should be a number')
         if (guideDotsRadius <= 0) throw new ChartOptionsError('guideDotsRadius should be greater than 0')
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

      if (months) {
         if (!Array.isArray(months)) throw new ChartOptionsError('i18n.months should be an array')
         if (months.length !== 12) throw new ChartOptionsError('i18n.months should have 12 elements')
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

      if (backgroundColor) {
         if (typeof backgroundColor !== 'string') throw new ChartOptionsError('style.backgroundColor should be a string')
      }

      if (horGuide) {
         if (typeof horGuide !== 'boolean') throw new ChartOptionsError('flags.horGuide should be a boolean')
      }

      if (immediateInit) {
         if (typeof immediateInit !== 'boolean') throw new ChartOptionsError('flags.immediateInit should be a boolean')
      }

      if (insertMethod) {
         if (typeof insertMethod !== 'string' && typeof insertMethod !== 'function') throw new ChartOptionsError('insertMethod should be a string or function')
         if (typeof insertMethod === 'string') {
            if (!['append', 'prepend'].includes(insertMethod)) throw new ChartOptionsError('insertMethod should be "append" or "prepend" or function')
         }
      }
   }

   /**
    * Returns the formatted options for the chart constructor by merging the provided options with the preset options.
    *
    * @param {Partial<IChartOptions>} options - The options to merge with the preset options.
    * @return {IChartOptions} The merged options.
    */
   private static getOptions(options: Partial<IChartOptions> = {}): IChartOptions {
      this.validateOptions(options)

      return {
         width: options.width || this.presetOptions.width,
         height: options.height || this.presetOptions.height,
         padding: options.padding ?? this.presetOptions.padding,
         rowsCount: options.rowsCount || this.presetOptions.rowsCount,
         guideDotsRadius: options.guideDotsRadius || this.presetOptions.guideDotsRadius,
         data: {
            xAxis: options.data?.xAxis || this.presetOptions.data.xAxis,
            yAxis: options.data?.yAxis || this.presetOptions.data.yAxis
         },
         i18n: {
            months: options.i18n?.months || this.presetOptions.i18n.months
         },
         style: {
            textFont: options.style?.textFont || this.presetOptions.style.textFont,
            textColor: options.style?.textColor || this.presetOptions.style.textColor,
            secondaryColor: options.style?.secondaryColor || this.presetOptions.style.secondaryColor,
            backgroundColor: options.style?.backgroundColor || this.presetOptions.style.backgroundColor
         },
         flags: {
            horGuide: options.flags?.horGuide ?? this.presetOptions.flags.horGuide,
            immediateInit: options.flags?.immediateInit ?? this.presetOptions.flags.immediateInit
         },
         insertMethod: options.insertMethod || this.presetOptions.insertMethod
      }
   }

   /**
    * Updates the preset options with the provided options.
    *
    * @param {Partial<IChartOptions>} options - The options to update the preset options with. Default is an empty object.
    */
   // prettier-ignore
   public static changePresetOptions(options: Partial<IChartOptions> = {}): void {
      this.validateOptions(options)
      this.presetOptions.width                 = options.width                  || this.presetOptions.width
      this.presetOptions.height                = options.height                 || this.presetOptions.height
      this.presetOptions.padding               = options.padding                ?? this.presetOptions.padding
      this.presetOptions.rowsCount             = options.rowsCount              || this.presetOptions.rowsCount
      this.presetOptions.guideDotsRadius       = options.guideDotsRadius        || this.presetOptions.guideDotsRadius
      this.presetOptions.i18n.months           = options.i18n?.months           || this.presetOptions.i18n.months
      this.presetOptions.style.textFont        = options.style?.textFont        || this.presetOptions.style.textFont
      this.presetOptions.style.textColor       = options.style?.textColor       || this.presetOptions.style.textColor
      this.presetOptions.style.secondaryColor  = options.style?.secondaryColor  || this.presetOptions.style.secondaryColor
      this.presetOptions.style.backgroundColor = options.style?.backgroundColor || this.presetOptions.style.backgroundColor
      this.presetOptions.data.xAxis            = options.data?.xAxis            || this.presetOptions.data.xAxis
      this.presetOptions.data.yAxis            = options.data?.yAxis            || this.presetOptions.data.yAxis
      this.presetOptions.flags.horGuide        = options.flags?.horGuide        ?? this.presetOptions.flags.horGuide
      this.presetOptions.flags.immediateInit   = options.flags?.immediateInit   ?? this.presetOptions.flags.immediateInit
      this.presetOptions.insertMethod          = options.insertMethod           || this.presetOptions.insertMethod
   }
}
