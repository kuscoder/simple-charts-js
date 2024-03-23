import { debounce, throttle } from '@/utils'
import { ChartOptionsError } from './chart-error'
import type { IVertices, IChartOptions } from './chart-types'

export class Chart {
   // Static options preset
   private static presetOptions: IChartOptions = {
      width: 600,
      height: 250,
      padding: 40,
      rowsCount: 5,
      data: {
         timeline: null,
         vertices: []
      },
      i18n: {
         months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      interactivity: {
         horisontalGuide: true,
         guideDotsRadius: 8,
         fpsLimit: 60,
         disable: false
      },
      style: {
         textFont: 'normal 20px Helvetica,sans-serif',
         textColor: '#96a2aa',
         secondaryColor: '#bbbbbb',
         backgroundColor: '#ffffff',
         classNames: {
            wrapper: 'simple-chart',
            canvas: 'simple-chart__canvas',
            tooltip: 'simple-chart__tooltip'
         }
      },
      technical: {
         debug: false,
         insertMethod: 'append',
         immediateInit: true
      }
   }

   // Options
   private readonly WIDTH: IChartOptions['width']
   private readonly HEIGHT: IChartOptions['height']
   private readonly PADDING: IChartOptions['padding']
   private readonly ROWS_COUNT: IChartOptions['rowsCount']
   private readonly DATA: IChartOptions['data']
   private readonly I18N: IChartOptions['i18n']
   private readonly INTERACTIVITY: IChartOptions['interactivity']
   private readonly STYLE: IChartOptions['style']
   private readonly TECHNICAL: IChartOptions['technical']

   // Calculated
   private readonly DPI_WIDTH: number
   private readonly DPI_HEIGHT: number
   private readonly VIEW_WIDTH: number
   private readonly VIEW_HEIGHT: number
   private readonly VERTICES_BOUNDARIES: [number, number]
   private readonly X_RATIO: number
   private readonly Y_RATIO: number
   private readonly ROWS_STEP: number
   private readonly TEXT_STEP: number
   private readonly TIMELINE_ITEMS_COUNT: number
   private readonly TIMELINE_ITEMS_STEP: number

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
      const timelineLength = formattedOptions.data.timeline?.values.length || 0
      const verticesLength = this.getVerticesLongestLength(formattedOptions.data.vertices)

      // Chart container
      this.containerElement = containerElement

      // Options
      this.WIDTH = formattedOptions.width
      this.HEIGHT = formattedOptions.height
      this.PADDING = formattedOptions.padding
      this.ROWS_COUNT = formattedOptions.rowsCount
      this.DATA = formattedOptions.data
      this.I18N = formattedOptions.i18n
      this.INTERACTIVITY = formattedOptions.interactivity
      this.STYLE = formattedOptions.style
      this.TECHNICAL = formattedOptions.technical

      // Calculated
      this.DPI_WIDTH = this.WIDTH * 2
      this.DPI_HEIGHT = this.HEIGHT * 2
      this.VIEW_WIDTH = this.DPI_WIDTH
      this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2
      this.VERTICES_BOUNDARIES = this.getVerticesBoundaries(this.DATA.vertices)
      this.X_RATIO = this.VIEW_WIDTH / (verticesLength - 1)
      this.Y_RATIO = this.VIEW_HEIGHT / (this.VERTICES_BOUNDARIES[1] - this.VERTICES_BOUNDARIES[0])
      this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT
      this.TEXT_STEP = (this.VERTICES_BOUNDARIES[1] - this.VERTICES_BOUNDARIES[0]) / this.ROWS_COUNT
      this.TIMELINE_ITEMS_COUNT = 6
      this.TIMELINE_ITEMS_STEP = timelineLength && Math.round(timelineLength / this.TIMELINE_ITEMS_COUNT)

      // Event handlers bindings
      this.resizeHandler = debounce(this.resizeHandler.bind(this), 100)
      this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
      this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this)
      this.drawChart = throttle(this.drawChart.bind(this), 1000 / this.INTERACTIVITY.fpsLimit)

      // prettier-ignore
      // Interactivity
      this.mouse = new Proxy({}, {
         set: (...args) => {
            const result = Reflect.set(...args)
            this.rafID = window.requestAnimationFrame(this.drawChart)
            return result
         }
      })

      // Create chart DOM elements
      this.createDOMElements()

      // Initialize if in immediate mode
      if (this.TECHNICAL.immediateInit) {
         this.initialize()
      }
   }

   /** Create the necessary DOM elements for the chart, but does not insert into the DOM. */
   private createDOMElements(): void {
      // Chart wrapper
      this.wrapperElement = document.createElement('div')
      this.wrapperElement.className = this.STYLE.classNames.wrapper

      // Canvas
      this.canvasElement = document.createElement('canvas')
      this.canvasElement.className = this.STYLE.classNames.canvas
      this.canvasElement.width = this.DPI_WIDTH
      this.canvasElement.height = this.DPI_HEIGHT
      this.canvasElement.style.width = this.WIDTH + 'px'
      this.canvasElement.style.height = this.HEIGHT + 'px'
      this.ctx = this.canvasElement.getContext('2d')!

      // Tooltip
      this.tooltipElement = document.createElement('div')
      this.tooltipElement.className = this.STYLE.classNames.tooltip
   }

   /**
    * Initializes the component by appending the canvas to the container element and drawing the chart.
    *
    * @return {boolean} Returns true if the chart is successfully initialized, false otherwise.
    */
   public initialize(): boolean {
      if (!this.isInitialized) {
         this.isInitialized = true

         // Insert into DOM
         this.wrapperElement.appendChild(this.canvasElement)
         this.wrapperElement.appendChild(this.tooltipElement)

         if (this.TECHNICAL.insertMethod === 'append') {
            this.containerElement.appendChild(this.wrapperElement)
         } else if (this.TECHNICAL.insertMethod === 'prepend') {
            this.containerElement.insertBefore(this.wrapperElement, this.containerElement.firstChild)
         } else {
            this.TECHNICAL.insertMethod(this.containerElement, this.wrapperElement)
         }

         // Add event listeners
         if (!this.INTERACTIVITY.disable) {
            window.addEventListener('resize', this.resizeHandler)
            window.addEventListener('orientationchange', this.resizeHandler)
            this.canvasElement.addEventListener('mousemove', this.mouseMoveHandler)
            this.canvasElement.addEventListener('mouseleave', this.mouseLeaveHandler)
         }

         // Debug
         if (this.TECHNICAL.debug) {
            this.debugLog('INITIALIZE', 'Chart initialized successfully')
         }

         this.drawChart()
         return true
      }

      // Debug
      if (this.TECHNICAL.debug) {
         this.debugLog('INITIALIZE', 'Chart already initialized')
      }

      return false
   }

   /**
    * Destroys the instance and cleans up all resources.
    *
    * @return {boolean} Returns true if the chart is successfully destroyed, false otherwise.
    */
   public destroy(): boolean {
      if (this.isInitialized) {
         this.isInitialized = false

         // Delete from DOM
         this.wrapperElement.removeChild(this.tooltipElement)
         this.wrapperElement.removeChild(this.canvasElement)
         this.containerElement.removeChild(this.wrapperElement)

         // Remove event listeners and cancel animations frames
         if (!this.INTERACTIVITY.disable) {
            window.cancelAnimationFrame(this.rafID)
            window.removeEventListener('resize', this.resizeHandler)
            window.removeEventListener('orientationchange', this.resizeHandler)
            this.canvasElement.removeEventListener('mousemove', this.mouseMoveHandler)
            this.canvasElement.removeEventListener('mouseleave', this.mouseLeaveHandler)
         }

         // Debug
         if (this.TECHNICAL.debug) {
            this.debugLog('DESTROY', 'Chart destroyed successfully')
         }

         return true
      }

      // Debug
      if (this.TECHNICAL.debug) {
         this.debugLog('DESTROY', 'Chart already destroyed')
      }

      return false
   }

   /** Main method that draws the chart by clearing the canvas. */
   private drawChart(): void {
      this.drawBackground()
      this.drawTimeline()
      this.drawRows()
      this.drawLines()

      // Debug
      if (this.TECHNICAL.debug) {
         this.debugLog('RENDER', 'Chart (re)drawn')
      }
   }

   /** Draws the background of the chart. */
   private drawBackground(): void {
      this.ctx.fillStyle = this.STYLE.backgroundColor
      this.ctx.fillRect(0, 0, this.DPI_WIDTH, this.DPI_HEIGHT)
   }

   /** Draws the timeline of the chart and guide lines. */
   private drawTimeline(): void {
      if (!this.DATA.timeline) return

      // For timeline
      this.ctx.fillStyle = this.STYLE.textColor
      this.ctx.font = this.STYLE.textFont

      // For guides
      this.ctx.lineWidth = 2
      this.ctx.strokeStyle = this.STYLE.secondaryColor

      for (let i = 1; i <= this.DATA.timeline.values.length; i++) {
         const x = this.getX(i)

         // Draw the timeline
         if ((i - 1) % this.TIMELINE_ITEMS_STEP === 0) {
            const text = this.getDate(this.DATA.timeline.values[i - 1])
            this.ctx.fillText(text, x, this.DPI_HEIGHT - 10)
         }

         // Draw guides
         if (!this.INTERACTIVITY.disable) {
            this.drawGuideLinesIsOver(x)
         }
      }
   }

   /**
    * Draws the guide lines if the mouse-x is over the vertice
    *
    * @param {number} x - The x-coordinate to check for mouse position and draw the guide lines.
    * @return {boolean} true if the guide lines were drawn, false otherwise
    */
   private drawGuideLinesIsOver(x: number): boolean {
      if (this.mouse.x && this.mouse.y) {
         const isOver = this.isMouseVerticeOver(x)
         const topHeight = this.PADDING / 2
         const bottomHeight = this.DPI_HEIGHT - this.PADDING

         if (isOver && this.mouse.y >= topHeight) {
            // Dashed horizontal guide line
            if (this.INTERACTIVITY.horisontalGuide && this.mouse.y <= bottomHeight) {
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

   /** Draws the rows of the chart. */
   private drawRows(): void {
      this.ctx.lineWidth = 1
      this.ctx.strokeStyle = this.STYLE.secondaryColor
      this.ctx.fillStyle = this.STYLE.textColor
      this.ctx.font = this.STYLE.textFont
      this.ctx.beginPath()

      for (let i = 1; i <= this.ROWS_COUNT; i++) {
         const text = String(Math.round(this.VERTICES_BOUNDARIES[1] - this.TEXT_STEP * i))
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

      for (const verticesItem of this.DATA.vertices) {
         let overX: number | null = null
         let overY: number | null = null

         this.ctx.strokeStyle = verticesItem.color
         this.ctx.beginPath()

         for (let i = 0; i < verticesItem.values.length; i++) {
            const x = this.getX(i)
            const y = this.getY(verticesItem.values[i])
            this.ctx.lineTo(x, y)

            // Write x and y values if the mouse-x is over the vertice
            if (this.isMouseVerticeOver(x)) {
               overX = x
               overY = y
            }
         }

         this.ctx.stroke()
         this.ctx.closePath()

         // Draw guide dots if the mouse-x is over the vertice
         if (!this.INTERACTIVITY.disable) {
            if (overX && overY && this.mouse.x && this.mouse.y && this.mouse.y >= this.PADDING / 2) {
               this.ctx.beginPath()
               this.ctx.arc(overX, overY, this.INTERACTIVITY.guideDotsRadius, 0, 2 * Math.PI)
               this.ctx.fill()
               this.ctx.stroke()
               this.ctx.closePath()
            }
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
    * Returns an array containing the minimum and maximum y values in the given vertices array.
    *
    * @param {IVertices[]} vertices - an array of vertices
    * @return {[number, number]} an array containing the minimum and maximum y values
    */
   private getVerticesBoundaries(vertices: IVertices[]): [number, number] {
      let yMin: number | null = null
      let yMax: number | null = null

      for (const verticesItem of vertices) {
         for (const vertice of verticesItem.values) {
            if (yMin === null || vertice < yMin) yMin = vertice
            if (yMax === null || vertice > yMax) yMax = vertice
         }
      }

      return [yMin ?? 0, yMax ?? 0]
   }

   /**
    * Returns a formatted date string for timeline based on the given timestamp.
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
    * Calculates the x-coordinate value based on the given input value.
    *
    * @param {number} value - The input value used to calculate the x-coordinate.
    * @return {number} The calculated x-coordinate value.
    */
   private getX(value: number): number {
      return value * this.X_RATIO
   }

   /**
    * Calculates the y-coordinate value based on the given input value.
    *
    * @param {number} value - The input value used to calculate the y-coordinate.
    * @return {number} The calculated y-coordinate value.
    */
   private getY(value: number): number {
      return this.DPI_HEIGHT - this.PADDING - value * this.Y_RATIO
   }

   /**
    * Calculate the maximum length of the vertices item.
    *
    * @param {?IVertices[]} vertices - optional parameter for the vertices
    * @return {number} the maximum length of the vertices item.
    */
   private getVerticesLongestLength(vertices?: IVertices[]): number {
      vertices ??= this.DATA.vertices
      let maxLength = 0

      for (const verticesItem of vertices) {
         if (verticesItem.values.length > maxLength) maxLength = verticesItem.values.length
      }

      return maxLength
   }

   /**
    * Checks if the mouse-x is hovering over an vertice at its x-coordinate.
    *
    * @param {number} x - The vertice coordinate to check.
    * @return {boolean} true if the mouse-x is hovering over the vertice, false otherwise.
    */
   private isMouseVerticeOver(x: number): boolean {
      if (!this.mouse.x) return false
      return Math.abs(x - this.mouse.x) < this.X_RATIO / 2
   }

   /**
    * Logs a debug message
    *
    * @param {string} scope - the scope of the debug message
    * @param {string} message - the message to be logged
    */
   private debugLog(scope: string, message: string): void {
      if (!this.TECHNICAL.debug) return
      console.log(`[${scope}]: ${message}`, this)
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
         data,
         i18n,
         interactivity,
         style,
         technical
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

      // data
      if (data) {
         if (data.timeline) {
            if (typeof data.timeline !== 'object') throw new ChartOptionsError('data.timeline should be an object')
            if (typeof data.timeline.type !== 'string') throw new ChartOptionsError('data.timeline.type should be a string')
            if (!['date'].includes(data.timeline.type)) throw new ChartOptionsError('data.timeline.type should be "date"')
            if (!Array.isArray(data.timeline.values)) throw new ChartOptionsError('data.timeline.values should be an array')

            if (data.timeline.type === 'date') {
               data.timeline.values.forEach((value, i) => {
                  if (typeof value !== 'number') throw new ChartOptionsError(`data.timeline.values[${i}] should be a number`)
               })
            }
         }

         if (data.vertices) {
            if (!Array.isArray(data.vertices)) throw new ChartOptionsError('data.vertices should be an array')

            data.vertices.forEach((verticesItem, i) => {
               if (typeof verticesItem.name !== 'string') throw new ChartOptionsError(`data.vertices[${i}].name should be a string`)
               if (typeof verticesItem.color !== 'string') throw new ChartOptionsError(`data.vertices[${i}].color should be a string`)
               if (!Array.isArray(verticesItem.values)) throw new ChartOptionsError(`data.vertices[${i}].values should be an array`)

               verticesItem.values.forEach((vertice, j) => {
                  if (typeof vertice !== 'number')
                     throw new ChartOptionsError(`data.vertices[${i}].values[${j}] should be a number`)
               })
            })
         }
      }

      // i18n
      if (i18n) {
         if (i18n.months) {
            if (!Array.isArray(i18n.months)) throw new ChartOptionsError('i18n.months should be an array')
            if (i18n.months.length !== 12) throw new ChartOptionsError('i18n.months should have 12 elements')
         }
      }

      // interactivity
      if (interactivity) {
         if (interactivity.horisontalGuide) {
            if (typeof interactivity.horisontalGuide !== 'boolean') throw new ChartOptionsError('interactivity.horisontalGuide should be a boolean')
         }

         if (interactivity.guideDotsRadius) {
            if (typeof interactivity.guideDotsRadius !== 'number') throw new ChartOptionsError('interactivity.guideDotsRadius should be a number')
            if (interactivity.guideDotsRadius <= 0) throw new ChartOptionsError('interactivity.guideDotsRadius should be greater than 0')
         }

         if (interactivity.fpsLimit) {
            if (typeof interactivity.fpsLimit !== 'number') throw new ChartOptionsError('interactivity.fpsLimit should be a number')
            if (interactivity.fpsLimit <= 0) throw new ChartOptionsError('interactivity.fpsLimit should be greater than 0')
         }

         if (interactivity.disable) {
            if (typeof interactivity.disable !== 'boolean') throw new ChartOptionsError('interactivity.disable should be a boolean')
         }
      }

      // style
      if (style) {
         if (style.textFont) {
            if (typeof style.textFont !== 'string') throw new ChartOptionsError('style.textFont should be a string')
         }

         if (style.textColor) {
            if (typeof style.textColor !== 'string') throw new ChartOptionsError('style.textColor should be a string')
         }

         if (style.secondaryColor) {
            if (typeof style.secondaryColor !== 'string') throw new ChartOptionsError('style.secondaryColor should be a string')
         }

         if (style.backgroundColor) {
            if (typeof style.backgroundColor !== 'string') throw new ChartOptionsError('style.backgroundColor should be a string')
         }

         if (style.classNames) {
            if (typeof style.classNames !== 'object') throw new ChartOptionsError('style.classNames should be an object')

            if (style.classNames.wrapper) {
               if (typeof style.classNames.wrapper !== 'string') throw new ChartOptionsError('style.classNames.wrapper should be a string')
            }

            if (style.classNames.canvas) {
               if (typeof style.classNames.canvas !== 'string') throw new ChartOptionsError('style.classNames.canvas should be a string')
            }

            if (style.classNames.tooltip) {
               if (typeof style.classNames.tooltip !== 'string') throw new ChartOptionsError('style.classNames.tooltip should be a string')
            }
         }
      }

      // technical
      if (technical) {
         if (technical.debug) {
            if (typeof technical.debug !== 'boolean') throw new ChartOptionsError('technical.debug should be a boolean')
         }

         if (technical.insertMethod) {
            if (typeof technical.insertMethod !== 'string' && typeof technical.insertMethod !== 'function') throw new ChartOptionsError('technical.insertMethod should be a string or function')
            if (typeof technical.insertMethod === 'string') {
               if (!['append', 'prepend'].includes(technical.insertMethod)) throw new ChartOptionsError('technical.insertMethod should be "append" or "prepend" or function')
            }
         }

         if (technical.immediateInit) {
            if (typeof technical.immediateInit !== 'boolean') throw new ChartOptionsError('technical.immediateInit should be a boolean')
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
         width: options.width ?? this.presetOptions.width,
         height: options.height ?? this.presetOptions.height,
         padding: options.padding ?? this.presetOptions.padding,
         rowsCount: options.rowsCount ?? this.presetOptions.rowsCount,
         data: {
            timeline: options.data?.timeline ?? this.presetOptions.data.timeline,
            vertices: options.data?.vertices ?? this.presetOptions.data.vertices
         },
         i18n: {
            months: options.i18n?.months || this.presetOptions.i18n.months
         },
         interactivity: {
            horisontalGuide: options.interactivity?.horisontalGuide ?? this.presetOptions.interactivity.horisontalGuide,
            guideDotsRadius: options.interactivity?.guideDotsRadius ?? this.presetOptions.interactivity.guideDotsRadius,
            fpsLimit: options.interactivity?.fpsLimit ?? this.presetOptions.interactivity.fpsLimit,
            disable: options.interactivity?.disable ?? this.presetOptions.interactivity.disable
         },
         style: {
            textFont: options.style?.textFont ?? this.presetOptions.style.textFont,
            textColor: options.style?.textColor ?? this.presetOptions.style.textColor,
            secondaryColor: options.style?.secondaryColor ?? this.presetOptions.style.secondaryColor,
            backgroundColor: options.style?.backgroundColor ?? this.presetOptions.style.backgroundColor,
            classNames: {
               wrapper: options.style?.classNames?.wrapper ?? this.presetOptions.style.classNames.wrapper,
               canvas: options.style?.classNames?.canvas ?? this.presetOptions.style.classNames.canvas,
               tooltip: options.style?.classNames?.tooltip ?? this.presetOptions.style.classNames.tooltip
            }
         },
         technical: {
            debug: options.technical?.debug ?? this.presetOptions.technical.debug,
            insertMethod: options.technical?.insertMethod ?? this.presetOptions.technical.insertMethod,
            immediateInit: options.technical?.immediateInit ?? this.presetOptions.technical.immediateInit
         }
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
      this.presetOptions.width                         = options.width                          ?? this.presetOptions.width
      this.presetOptions.height                        = options.height                         ?? this.presetOptions.height
      this.presetOptions.padding                       = options.padding                        ?? this.presetOptions.padding
      this.presetOptions.rowsCount                     = options.rowsCount                      ?? this.presetOptions.rowsCount
      this.presetOptions.data.timeline                 = options.data?.timeline                 ?? this.presetOptions.data.timeline
      this.presetOptions.data.vertices                 = options.data?.vertices                 ?? this.presetOptions.data.vertices
      this.presetOptions.i18n.months                   = options.i18n?.months                   ?? this.presetOptions.i18n.months
      this.presetOptions.interactivity.horisontalGuide = options.interactivity?.horisontalGuide ?? this.presetOptions.interactivity.horisontalGuide
      this.presetOptions.interactivity.guideDotsRadius = options.interactivity?.guideDotsRadius ?? this.presetOptions.interactivity.guideDotsRadius
      this.presetOptions.interactivity.fpsLimit        = options.interactivity?.fpsLimit        ?? this.presetOptions.interactivity.fpsLimit
      this.presetOptions.interactivity.disable         = options.interactivity?.disable         ?? this.presetOptions.interactivity.disable
      this.presetOptions.style.textFont                = options.style?.textFont                ?? this.presetOptions.style.textFont
      this.presetOptions.style.textColor               = options.style?.textColor               ?? this.presetOptions.style.textColor
      this.presetOptions.style.secondaryColor          = options.style?.secondaryColor          ?? this.presetOptions.style.secondaryColor
      this.presetOptions.style.backgroundColor         = options.style?.backgroundColor         ?? this.presetOptions.style.backgroundColor
      this.presetOptions.style.classNames.wrapper      = options.style?.classNames?.wrapper     ?? this.presetOptions.style.classNames.wrapper
      this.presetOptions.style.classNames.canvas       = options.style?.classNames?.canvas      ?? this.presetOptions.style.classNames.canvas
      this.presetOptions.style.classNames.tooltip      = options.style?.classNames?.tooltip     ?? this.presetOptions.style.classNames.tooltip
      this.presetOptions.technical.debug               = options.technical?.debug               ?? this.presetOptions.technical.debug
      this.presetOptions.technical.insertMethod        = options.technical?.insertMethod        ?? this.presetOptions.technical.insertMethod
      this.presetOptions.technical.immediateInit       = options.technical?.immediateInit       ?? this.presetOptions.technical.immediateInit
   }
}
