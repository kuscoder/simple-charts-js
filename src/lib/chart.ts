import { debounce, throttle, styles } from '@/utils'
import { ChartOptionsError } from './chart-error'
import type { ILine, IChartOptions, IMouseProxy, ITooltipItem, DeepPartial } from './chart-types'

export class Chart {
   // Static options preset
   private static presetOptions: IChartOptions = {
      width: 600,
      height: 250,
      padding: 40,
      rowsCount: 5,
      data: {
         timeline: {
            type: 'date',
            values: []
         },
         lines: []
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
   private readonly LINES_VERTICES_BOUNDARIES: [number, number]
   private readonly X_RATIO: number
   private readonly Y_RATIO: number
   private readonly ROWS_STEP: number
   private readonly TEXT_STEP: number
   private readonly TIMELINE_ITEMS_COUNT: number
   private readonly TIMELINE_ITEMS_STEP: number

   // Interactivity
   private readonly mouse: IMouseProxy
   private rafID: number = 0
   private isInitialized: boolean = false

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
    * @param {DeepPartial<IChartOptions>} options - optional chart options
    */
   constructor(containerElement: HTMLElement, options: DeepPartial<IChartOptions> = {}) {
      const formattedOptions = Chart.getOptions(options)
      const timelineLength = formattedOptions.data.timeline?.values.length || 0
      const linesVerticesLength = this.getLinesVerticesLongestLength(formattedOptions.data.lines)

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
      this.LINES_VERTICES_BOUNDARIES = this.getLinesVerticesBoundaries(this.DATA.lines)
      this.X_RATIO = this.VIEW_WIDTH / (linesVerticesLength - 1)
      this.Y_RATIO = this.VIEW_HEIGHT / (this.LINES_VERTICES_BOUNDARIES[1] - this.LINES_VERTICES_BOUNDARIES[0])
      this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT
      this.TEXT_STEP = (this.LINES_VERTICES_BOUNDARIES[1] - this.LINES_VERTICES_BOUNDARIES[0]) / this.ROWS_COUNT
      this.TIMELINE_ITEMS_COUNT = 6
      this.TIMELINE_ITEMS_STEP = timelineLength && Math.round(timelineLength / this.TIMELINE_ITEMS_COUNT)

      // Decorators and bindings for instance methods
      this.resizeHandler = debounce(this.resizeHandler.bind(this), 100)
      this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
      this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this)
      this.drawChart = throttle(this.drawChart.bind(this), 1000 / this.INTERACTIVITY.fpsLimit)

      // Interactivity
      this.mouse = new Proxy(
         {
            value: {
               mouseX: null,
               mouseY: null,
               tooltipLeft: null,
               tooltipTop: null
            }
         },
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
      if (this.TECHNICAL.immediateInit) {
         this.initialize()
      }
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

      styles(this.canvasElement, {
         width: this.WIDTH + 'px',
         height: this.HEIGHT + 'px'
      })

      // Canvas context
      this.ctx = this.canvasElement.getContext('2d')!

      // Tooltip
      this.tooltipElement = document.createElement('div')
      this.tooltipElement.className = this.STYLE.classNames.tooltip

      // Set CSS variables
      styles(this.wrapperElement, {
         '--text-font': this.STYLE.textFont,
         '--text-color': this.STYLE.textColor,
         '--secondary-color': this.STYLE.secondaryColor,
         '--background-color': this.STYLE.backgroundColor
      })
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
         const text = this.getDate(this.DATA.timeline.values[i - 1])
         const x = this.getX(i)

         // Draw the timeline
         if ((i - 1) % this.TIMELINE_ITEMS_STEP === 0) {
            this.ctx.fillText(text, x, this.DPI_HEIGHT - 10)
         }

         // Draw guides
         if (!this.INTERACTIVITY.disable) {
            this.drawGuideLinesIsOver(x, i, text)
         }
      }
   }

   /**
    * Draws the guide lines if the mouse-x is over the vertice
    *
    * @param {number} x - The x-coordinate to check for mouse position and draw the guide lines.
    * @param {number} i - The original index of the vertice
    * @param {string} text - The title to display in the tooltip
    * @return {boolean} true if the guide lines were drawn, false otherwise
    */
   private drawGuideLinesIsOver(x: number, i: number, text: string): boolean {
      const { mouseX, mouseY } = this.mouse.value

      if (mouseX && mouseY) {
         const isOver = this.isMouseVerticeOver(x)

         if (isOver) {
            const topHeight = this.PADDING / 2
            const bottomHeight = this.DPI_HEIGHT - this.PADDING

            // Tooltip
            this.tooltipShow(
               text,
               this.DATA.lines.map((line) => ({
                  name: line.name,
                  color: line.color,
                  value: line.vertices[i]
               }))
            )

            // Dashed horizontal guide line
            if (this.INTERACTIVITY.horisontalGuide && mouseY <= bottomHeight) {
               this.ctx.beginPath()
               this.ctx.setLineDash([20, 25])
               this.ctx.moveTo(0, mouseY)
               this.ctx.lineTo(this.DPI_WIDTH, mouseY)
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
         const text = String(Math.round(this.LINES_VERTICES_BOUNDARIES[1] - this.TEXT_STEP * i))
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

      for (const line of this.DATA.lines) {
         let overX: number | null = null
         let overY: number | null = null

         this.ctx.strokeStyle = line.color
         this.ctx.beginPath()

         for (let i = 0; i < line.vertices.length; i++) {
            const x = this.getX(i)
            const y = this.getY(line.vertices[i])
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
            if (overX && overY) {
               this.ctx.beginPath()
               this.ctx.arc(overX, overY, this.INTERACTIVITY.guideDotsRadius, 0, 2 * Math.PI)
               this.ctx.fill()
               this.ctx.stroke()
               this.ctx.closePath()
            }
         }
      }
   }

   /**
    * Generates the tooltip content and displays it at the specified position.
    *
    * @param {string} title - The title of the tooltip.
    * @param {ITooltipItem[]} items - An array of tooltip items.
    * @return {boolean} Returns true if the tooltip was successfully displayed, false otherwise.
    */
   private tooltipShow(title: string, items: ITooltipItem[]): boolean {
      const { tooltipLeft, tooltipTop } = this.mouse.value

      if (tooltipLeft && tooltipTop && this.canvasRect) {
         const tooltipRect = this.tooltipElement.getBoundingClientRect()

         // prettier-ignore
         const template = `
            <h2>${title}</h2>
            <ul>
               ${items.map(item => `
                  <li style="color: ${item.color}">
                     <h3>${item.value}</h3>
                     <p>${item.name}</p>
                  </li>
               `).join('\n')}
            </ul>
         `

         const offsetX = tooltipRect.width / 2
         const offsetY = tooltipRect.height / 4

         const toRight = tooltipLeft + offsetX
         const toLeft = tooltipLeft - tooltipRect.width - offsetX

         const toTop = tooltipTop - tooltipRect.height - offsetY
         const toBottom = tooltipTop + offsetY

         const left = toRight + tooltipRect.width + this.canvasRect.x >= window.innerWidth ? toLeft : toRight
         const top = toTop + this.canvasRect.y <= 0 ? toBottom : toTop

         styles(this.tooltipElement, {
            visibility: 'visible',
            left: left + 'px',
            top: top + 'px'
         })

         this.tooltipElement.innerHTML = ''
         this.tooltipElement.insertAdjacentHTML('beforeend', template)

         return true
      }

      return false
   }

   /**
    * Hides the tooltip.
    *
    * @return {boolean} Returns true if the tooltip was successfully hidden, false otherwise.
    */
   private tooltipHide(): boolean {
      styles(this.tooltipElement, { visibility: 'hidden' })
      return true
   }

   /** Event handler that updates the mouse position by canvas coordinates. */
   private mouseMoveHandler(e: MouseEvent): void {
      this.canvasRect ??= this.canvasElement.getBoundingClientRect()

      this.mouse.value = {
         mouseX: (e.clientX - this.canvasRect.left) * 2,
         mouseY: (e.clientY - this.canvasRect.top) * 2,
         tooltipLeft: e.clientX - this.canvasRect.left,
         tooltipTop: e.clientY - this.canvasRect.top
      }
   }

   /** Event handler that resets the mouse position when the mouse leaves the canvas. */
   private mouseLeaveHandler(): void {
      this.tooltipHide()

      this.mouse.value = {
         mouseX: null,
         mouseY: null,
         tooltipLeft: null,
         tooltipTop: null
      }
   }

   /** Event handler that update the chart interactivity when the window is resized. */
   private resizeHandler(): void {
      this.canvasRect = this.canvasElement.getBoundingClientRect()
   }

   /**
    * Returns an array containing the minimum and maximum y vertices values in the given lines array.
    *
    * @param {ILine[]} lines - an array of lines
    * @return {[number, number]} an array containing the minimum and maximum y values
    */
   private getLinesVerticesBoundaries(lines: ILine[]): [number, number] {
      let yMin: number | null = null
      let yMax: number | null = null

      for (const line of lines) {
         for (const vertice of line.vertices) {
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
    * Calculate the maximum length of the lines vertices values.
    *
    * @param {?ILine[]} lines - optional parameter for the lines
    * @return {number} the maximum length of the lines vertices values.
    */
   private getLinesVerticesLongestLength(lines?: ILine[]): number {
      lines ??= this.DATA.lines
      let maxLength = 0

      for (const line of lines) {
         if (line.vertices.length > maxLength) maxLength = line.vertices.length
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
      const { mouseX } = this.mouse.value
      if (!mouseX) return false
      return Math.abs(x - mouseX) < this.X_RATIO / 2
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
    * @param {DeepPartial<IChartOptions>} options - the options to be validated
    * @throws {ChartOptionsError} if the options are invalid
    * @return {void}
    */
   // prettier-ignore
   private static validateOptions(options: DeepPartial<IChartOptions> = {}): void {
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

      if (width !== undefined) {
         if (typeof width !== 'number') throw new ChartOptionsError('width should be a number')
         if (width <= 0) throw new ChartOptionsError('width should be greater than 0')
         if (width % 2 !== 0) throw new ChartOptionsError('width should be an even number')
      }

      if (height !== undefined) {
         if (typeof height !== 'number') throw new ChartOptionsError('height should be a number')
         if (height <= 0) throw new ChartOptionsError('height should be greater than 0')
         if (height % 2 !== 0) throw new ChartOptionsError('height should be an even number')
      }

      if (padding !== undefined) {
         if (typeof padding !== 'number') throw new ChartOptionsError('padding should be a number')
         if (padding < 0) throw new ChartOptionsError('padding should be greater or equal to 0')
      }

      if (rowsCount !== undefined) {
         if (typeof rowsCount !== 'number') throw new ChartOptionsError('rowsCount should be a number')
         if (rowsCount <= 0) throw new ChartOptionsError('rowsCount should be greater than 0')
      }

      // data
      if (data !== undefined) {
         if (typeof data !== 'object') throw new ChartOptionsError('data should be an object')

         if (data.timeline !== undefined) {
            if (typeof data.timeline !== 'object') throw new ChartOptionsError('data.timeline should be an object')

            if (data.timeline.type !== undefined) {
               if (typeof data.timeline.type !== 'string') throw new ChartOptionsError('data.timeline.type should be a string')
               if (!['date'].includes(data.timeline.type)) throw new ChartOptionsError('data.timeline.type should be "date"')
            }

            if (data.timeline.values !== undefined) {
               if (!Array.isArray(data.timeline.values)) throw new ChartOptionsError('data.timeline.values should be an array')

               data.timeline.values.forEach((value, i) => {
                  if (typeof value !== 'number') throw new ChartOptionsError(`data.timeline.values[${i}] should be a number`)
                  if (value < 0) throw new ChartOptionsError(`data.timeline.values[${i}] should be greater or equal to 0`)
               })
            }
         }

         if (data.lines !== undefined) {
            if (!Array.isArray(data.lines)) throw new ChartOptionsError('data.vertices should be an array')

            ;(data.lines as Partial<ILine>[]).forEach((line, i) => {
               if (!line.key) throw new ChartOptionsError(`data.lines[${i}].key required`)
               if (!line.name) throw new ChartOptionsError(`data.lines[${i}].name required`)
               if (!line.color) throw new ChartOptionsError(`data.lines[${i}].color required`)
               if (!line.vertices) throw new ChartOptionsError(`data.lines[${i}].values required`)

               if (typeof line.key !== 'string') throw new ChartOptionsError(`data.lines[${i}].key should be a string`)
               if (typeof line.name !== 'string') throw new ChartOptionsError(`data.lines[${i}].name should be a string`)
               if (typeof line.color !== 'string') throw new ChartOptionsError(`data.lines[${i}].color should be a string`)
               if (!Array.isArray(line.vertices)) throw new ChartOptionsError(`data.lines[${i}].vertices should be an array`)

               line.vertices.forEach((vertice, j) => {
                  if (typeof vertice !== 'number')
                     throw new ChartOptionsError(`data.lines[${i}].vertices[${j}] should be a number`)
               })
            })
         }
      }

      // i18n
      if (i18n !== undefined) {
         if (typeof i18n !== 'object') throw new ChartOptionsError('i18n should be an object')

         if (i18n.months !== undefined) {
            if (!Array.isArray(i18n.months)) throw new ChartOptionsError('i18n.months should be an array')
            if (i18n.months.length !== 12) throw new ChartOptionsError('i18n.months should have 12 elements')
         }
      }

      // interactivity
      if (interactivity !== undefined) {
         if (typeof interactivity !== 'object') throw new ChartOptionsError('interactivity should be an object')

         if (interactivity.horisontalGuide !== undefined) {
            if (typeof interactivity.horisontalGuide !== 'boolean') throw new ChartOptionsError('interactivity.horisontalGuide should be a boolean')
         }

         if (interactivity.guideDotsRadius !== undefined) {
            if (typeof interactivity.guideDotsRadius !== 'number') throw new ChartOptionsError('interactivity.guideDotsRadius should be a number')
            if (interactivity.guideDotsRadius <= 0) throw new ChartOptionsError('interactivity.guideDotsRadius should be greater than 0')
         }

         if (interactivity.fpsLimit !== undefined) {
            if (typeof interactivity.fpsLimit !== 'number') throw new ChartOptionsError('interactivity.fpsLimit should be a number')
            if (interactivity.fpsLimit <= 0) throw new ChartOptionsError('interactivity.fpsLimit should be greater than 0')
         }

         if (interactivity.disable !== undefined) {
            if (typeof interactivity.disable !== 'boolean') throw new ChartOptionsError('interactivity.disable should be a boolean')
         }
      }

      // style
      if (style !== undefined) {
         if (typeof style !== 'object') throw new ChartOptionsError('style should be an object')

         if (style.textFont !== undefined) {
            if (typeof style.textFont !== 'string') throw new ChartOptionsError('style.textFont should be a string')
         }

         if (style.textColor !== undefined) {
            if (typeof style.textColor !== 'string') throw new ChartOptionsError('style.textColor should be a string')
         }

         if (style.secondaryColor !== undefined) {
            if (typeof style.secondaryColor !== 'string') throw new ChartOptionsError('style.secondaryColor should be a string')
         }

         if (style.backgroundColor !== undefined) {
            if (typeof style.backgroundColor !== 'string') throw new ChartOptionsError('style.backgroundColor should be a string')
         }

         if (style.classNames !== undefined) {
            if (typeof style.classNames !== 'object') throw new ChartOptionsError('style.classNames should be an object')

            if (style.classNames.wrapper !== undefined) {
               if (typeof style.classNames.wrapper !== 'string') throw new ChartOptionsError('style.classNames.wrapper should be a string')
            }

            if (style.classNames.canvas !== undefined) {
               if (typeof style.classNames.canvas !== 'string') throw new ChartOptionsError('style.classNames.canvas should be a string')
            }

            if (style.classNames.tooltip !== undefined) {
               if (typeof style.classNames.tooltip !== 'string') throw new ChartOptionsError('style.classNames.tooltip should be a string')
            }
         }
      }

      // technical
      if (technical !== undefined) {
         if (typeof technical !== 'object') throw new ChartOptionsError('technical should be an object')

         if (technical.debug !== undefined) {
            if (typeof technical.debug !== 'boolean') throw new ChartOptionsError('technical.debug should be a boolean')
         }

         if (technical.insertMethod !== undefined) {
            if (typeof technical.insertMethod !== 'string' && typeof technical.insertMethod !== 'function') throw new ChartOptionsError('technical.insertMethod should be a string or function')
            if (typeof technical.insertMethod === 'string') {
               if (!['append', 'prepend'].includes(technical.insertMethod)) throw new ChartOptionsError('technical.insertMethod should be "append" or "prepend" or function')
            }
         }

         if (technical.immediateInit !== undefined) {
            if (typeof technical.immediateInit !== 'boolean') throw new ChartOptionsError('technical.immediateInit should be a boolean')
         }
      }
   }

   /**
    * Returns the formatted options for the chart constructor by merging the provided options with the preset options.
    *
    * @param {DeepPartial<IChartOptions>} options - The options to merge with the preset options.
    * @return {IChartOptions} The merged options.
    */
   private static getOptions(options: DeepPartial<IChartOptions> = {}): IChartOptions {
      this.validateOptions(options)

      return {
         width: options.width ?? this.presetOptions.width,
         height: options.height ?? this.presetOptions.height,
         padding: options.padding ?? this.presetOptions.padding,
         rowsCount: options.rowsCount ?? this.presetOptions.rowsCount,
         data: {
            timeline: {
               type: options.data?.timeline?.type ?? this.presetOptions.data.timeline.type,
               values: options.data?.timeline?.values ?? this.presetOptions.data.timeline.values
            },
            lines: options.data?.lines ?? this.presetOptions.data.lines
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
    * @param {DeepPartial<IChartOptions>} options - The options to update the preset options with. Default is an empty object.
    */
   // prettier-ignore
   public static changePresetOptions(options: DeepPartial<IChartOptions> = {}): void {
      this.validateOptions(options)
      this.presetOptions.width                         = options.width                          ?? this.presetOptions.width
      this.presetOptions.height                        = options.height                         ?? this.presetOptions.height
      this.presetOptions.padding                       = options.padding                        ?? this.presetOptions.padding
      this.presetOptions.rowsCount                     = options.rowsCount                      ?? this.presetOptions.rowsCount
      this.presetOptions.data.timeline.type            = options.data?.timeline?.type           ?? this.presetOptions.data.timeline.type
      this.presetOptions.data.timeline.values          = options.data?.timeline?.values         ?? this.presetOptions.data.timeline.values
      this.presetOptions.data.lines                    = options.data?.lines                    ?? this.presetOptions.data.lines
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
